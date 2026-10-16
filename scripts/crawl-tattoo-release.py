"""Read-only release crawl: served HTML, metadata, internal links and assets.

No JavaScript execution or claim of Google indexing/ranking. Uses a supplied
sitemap and the reviewed keyword map; saves a local report, never credentials.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import csv
import json
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.h1, self.lang = '', 0, ''
        self.metas, self.links, self.anchors, self.images, self.structured = [], [], [], [], []
        self.in_title, self.in_json = False, False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'html': self.lang = values.get('lang', '')
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'meta': self.metas.append(values)
        if tag == 'link': self.links.append(values)
        if tag == 'a' and values.get('href'): self.anchors.append(values['href'])
        if tag == 'img': self.images.append(values)
        if tag == 'script' and values.get('type') == 'application/ld+json': self.in_json = True

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script': self.in_json = False

    def handle_data(self, value):
        if self.in_title: self.title += value
        if self.in_json: self.structured.append(value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--canonical-origin')
    parser.add_argument('--output', default='data/verification/release-crawl.json')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    origin = args.origin.rstrip('/')
    canonical_origin = (args.canonical_origin or origin).rstrip('/')
    handlers = [urllib.request.ProxyHandler({})] if urlsplit(origin).hostname in ('localhost', '127.0.0.1') else []
    opener = urllib.request.build_opener(*handlers)

    def get(path, body=True):
        target = origin + path
        started = time.monotonic()
        try:
            request = urllib.request.Request(target, headers={'User-Agent': 'TattooReleaseAudit/1.0', 'Accept': 'text/html,application/xml,image/*;q=0.8,*/*;q=0.5'})
            with opener.open(request, timeout=60) as response:
                data = response.read() if body else b''
                return {'path': path, 'status': response.status, 'seconds': round(time.monotonic()-started, 3), 'body': data, 'content_type': response.headers.get('Content-Type', '')}
        except urllib.error.HTTPError as error:
            return {'path': path, 'status': error.code, 'error': str(error)}
        except Exception as error:
            return {'path': path, 'status': 0, 'error': str(error)}

    sitemap = get('/sitemap.xml')
    if sitemap['status'] != 200: raise ValueError(f'Sitemap unavailable: {sitemap}')
    xml = ET.fromstring(sitemap['body'])
    paths = [urlsplit(item.text).path for item in xml.findall('{*}url/{*}loc')]
    if len(paths) != len(set(paths)): raise ValueError('Duplicate sitemap locations')
    issues, pages, incoming, assets, destinations = [], [], Counter(), set(), set()
    for target in csv.DictReader((root / 'docs/seo/tattoo-keyword-page-map.csv').open(encoding='utf-8-sig')):
        if target['target_path'] not in paths: issues.append({'path': target['target_path'], 'issue': 'Keyword target absent from sitemap'})
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(get, paths):
            path = result['path']
            body = result.pop('body', b'')
            if result['status'] != 200:
                issues.append({'path': path, 'issue': f'HTTP {result["status"]}'}); pages.append(result); continue
            html = Page(); html.feed(body.decode('utf-8'))
            canonical = [link.get('href') for link in html.links if link.get('rel') == 'canonical']
            descriptions = [meta.get('content', '') for meta in html.metas if meta.get('name') == 'description']
            robots = ' '.join(meta.get('content', '') for meta in html.metas if meta.get('name', '').lower() == 'robots')
            expected = canonical_origin + path.rstrip('/') if path != '/' else canonical_origin + '/'
            alternates = {link.get('hreflang'): link.get('href') for link in html.links if link.get('rel') == 'alternate' and link.get('hreflang')}
            if canonical != [expected]: issues.append({'path': path, 'issue': 'Canonical mismatch', 'actual': canonical, 'expected': expected})
            if len(descriptions) != 1 or not descriptions[0].strip(): issues.append({'path': path, 'issue': 'Missing or duplicate description'})
            if not html.title.strip() or html.h1 != 1: issues.append({'path': path, 'issue': 'Missing title or h1 count not one', 'h1': html.h1})
            if 'noindex' in robots.lower(): issues.append({'path': path, 'issue': 'Public page is noindex'})
            if html.lang != ('zh' if path == '/zh' or path.startswith('/zh/') else 'en'): issues.append({'path': path, 'issue': 'Wrong HTML language', 'actual': html.lang})
            if set(alternates) != {'en', 'zh', 'x-default'}: issues.append({'path': path, 'issue': 'Incomplete language alternates', 'actual': alternates})
            if any(not image.get('alt') for image in html.images): issues.append({'path': path, 'issue': 'Image missing descriptive alt'})
            for raw in html.anchors:
                linked = urlsplit(urljoin(origin+path, raw))
                if linked.netloc != urlsplit(origin).netloc and linked.netloc != urlsplit(canonical_origin).netloc: continue
                destination = linked.path.rstrip('/') or '/'
                bare = destination.removeprefix('/zh') or '/'
                if any(bare == prefix or bare.startswith(prefix+'/') for prefix in ('/chat','/share','/api','/admin','/settings','/sign-in','/sign-up','/forgot-password','/reset-password')): continue
                destinations.add(destination)
                if destination != path.rstrip('/'): incoming[destination] += 1
            for image in html.images:
                image_url = urlsplit(urljoin(origin+path, image.get('src', '')))
                if image_url.netloc in (urlsplit(origin).netloc, urlsplit(canonical_origin).netloc): assets.add(image_url.path)
            for value in html.structured:
                try: json.loads(value)
                except ValueError: issues.append({'path': path, 'issue': 'Invalid JSON-LD'})
            result.update({'title': html.title, 'title_length': len(html.title), 'description_length': len(descriptions[0]) if descriptions else 0, 'h1': html.h1, 'canonical': canonical, 'lang': html.lang, 'html_bytes': len(body)})
            pages.append(result)
        for result in pool.map(lambda path: get(path, False), sorted(assets | (destinations - set(paths)))):
            if result['status'] != 200: issues.append({'path': result['path'], 'issue': f'Linked resource HTTP {result["status"]}'})
    titles = Counter(page.get('title') for page in pages if page.get('title'))
    for title, count in titles.items():
        if count > 1: issues.append({'issue': 'Duplicate page title', 'title': title, 'count': count})
    for path in paths:
        if path not in ('/', '/zh') and not incoming[path.rstrip('/')]: issues.append({'path': path, 'issue': 'No inbound page link'})
    unknown = [get(path, False) for path in ('/tattoo-ideas/not-a-real-topic', '/tattoo-styles/not-a-real-style', '/tattoo-placements/not-a-real-placement', '/tattoo-designs/not-a-real-design')]
    for result in unknown:
        if result['status'] != 404: issues.append({'path': result['path'], 'issue': f'Unknown route returned {result["status"]}'})
    report = {'origin': origin, 'pages_checked': len(pages), 'assets_checked': len(assets), 'linked_destinations': len(destinations), 'unknown_routes': unknown, 'issues': issues, 'pages': pages}
    output = root / args.output; output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'pages'}, ensure_ascii=True, indent=2))
    return 1 if issues else 0


if __name__ == '__main__':
    raise SystemExit(main())
