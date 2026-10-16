// Read-only public response capture for playwright-cli run-code --filename.
// Use an anonymous browser session on the production site. Output stays in ignored data/.
async function captureTattooRelease(page) {
  const capture = await page.evaluate(async () => {
    const origin = location.origin;
    if (origin !== 'https://bestaitattoogenerator.com')
      throw new Error('Unexpected capture origin');
    const resources = {};
    async function get(path, body = true) {
      if (!path.startsWith('/') || path.startsWith('//'))
        throw new Error('Unexpected path');
      const started = performance.now();
      try {
        const response = await fetch(path, { credentials: 'omit' });
        const result = {
          path,
          status: response.status,
          seconds: +((performance.now() - started) / 1000).toFixed(3),
          content_type: response.headers.get('content-type') || '',
        };
        if (body) result.body = await response.text();
        else await response.arrayBuffer();
        resources[path] = result;
        return result;
      } catch (error) {
        const result = { path, status: 0, error: String(error) };
        resources[path] = result;
        return result;
      }
    }
    async function pool(items, handler) {
      let next = 0;
      await Promise.all(
        Array.from({ length: 4 }, async () => {
          while (next < items.length) {
            const index = next++;
            await handler(items[index]);
          }
        })
      );
    }
    const sitemap = await get('/sitemap.xml');
    if (sitemap.status !== 200) throw new Error('Sitemap unavailable');
    const xml = new DOMParser().parseFromString(
      sitemap.body,
      'application/xml'
    );
    const paths = Array.from(xml.getElementsByTagName('loc'), (element) => {
      const url = new URL(element.textContent);
      if (url.origin !== origin) throw new Error('Unexpected sitemap origin');
      return url.pathname;
    });
    if (paths.length < 100 || paths.length > 300)
      throw new Error('Unexpected sitemap size: ' + paths.length);
    await pool(paths, (path) => get(path));
    const assets = new Set(),
      destinations = new Set();
    for (const path of paths) {
      const html = resources[path]?.body || '';
      for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
        const url = new URL(match[1].replaceAll('&amp;', '&'), origin + path);
        if (url.origin === origin) assets.add(url.pathname);
      }
      for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
        const url = new URL(match[1].replaceAll('&amp;', '&'), origin + path);
        if (url.origin !== origin) continue;
        const destination = url.pathname.replace(/\/$/, '') || '/';
        const bare = destination.replace(/^\/zh(?=\/|$)/, '') || '/';
        if (
          /^\/(chat|share|api|admin|settings|sign-in|sign-up|forgot-password|reset-password)(\/|$)/.test(
            bare
          )
        )
          continue;
        destinations.add(destination);
      }
    }
    await pool(
      [...new Set([...assets, ...destinations])].filter(
        (path) => !resources[path]
      ),
      (path) => get(path, false)
    );
    await pool(
      [
        '/tattoo-ideas/not-a-real-topic',
        '/tattoo-styles/not-a-real-style',
        '/tattoo-placements/not-a-real-placement',
        '/tattoo-designs/not-a-real-design',
      ],
      (path) => get(path, false)
    );
    await get('/robots.txt');
    return {
      origin,
      transport: 'Anonymous read-only responses from a normal browser',
      captured_at: new Date().toISOString(),
      resources,
      pages: paths.length,
      assets: assets.size,
      destinations: destinations.size,
    };
  });
  const download = page.waitForEvent('download');
  await page.evaluate((data) => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'public-response-capture.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, capture);
  await (
    await download
  ).saveAs('data/verification/production/public-response-capture.json');
  return {
    pages: capture.pages,
    assets: capture.assets,
    destinations: capture.destinations,
    responses: Object.keys(capture.resources).length,
    failedPublicPages: Object.values(capture.resources)
      .filter(
        (value) => value.status !== 200 && !value.path.includes('not-a-real-')
      )
      .map((value) => ({ path: value.path, status: value.status })),
  };
}
