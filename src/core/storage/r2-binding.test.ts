import { describe, expect, it, vi } from 'vitest';

import { R2BindingProvider, serveR2Media } from './r2-binding';

const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function bucket() {
  return {
    put: vi.fn(async () => ({})),
    get: vi.fn(async () => null),
    head: vi.fn(async () => null),
  };
}

describe('Cloudflare R2 binding storage', () => {
  it('saves generated files and returns a browser-readable same-origin URL', async () => {
    const r2 = bucket();
    const provider = new R2BindingProvider(
      r2,
      'https://bestaitattoogenerator.com'
    );
    const result = await provider.uploadFile({
      key: 'agent/sessions/s-123/design.png',
      body: png,
      contentType: 'image/png',
    });

    expect(result.success).toBe(true);
    expect(result.url).toBe(
      'https://bestaitattoogenerator.com/api/storage/media/uploads/agent/sessions/s-123/design.png'
    );
    expect(r2.put).toHaveBeenCalledWith(
      'uploads/agent/sessions/s-123/design.png',
      png,
      {
        httpMetadata: {
          contentType: 'image/png',
          contentDisposition: 'inline',
        },
      }
    );
  });

  it('serves a stored image with its media type and rejects invalid paths', async () => {
    const r2 = bucket();
    r2.get.mockResolvedValueOnce({
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(png);
          controller.close();
        },
      }),
      httpMetadata: { contentType: 'image/png' },
    } as never);
    const response = await serveR2Media(
      new Request(
        'https://bestaitattoogenerator.com/api/storage/media/uploads/test.png'
      ),
      r2
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);

    const invalid = await serveR2Media(
      new Request(
        'https://bestaitattoogenerator.com/api/storage/media/uploads/%2e%2e/private.png'
      ),
      r2
    );
    expect(invalid.status).toBe(400);
    expect(r2.get).toHaveBeenCalledTimes(1);
  });

  it('returns 404 when the R2 object does not exist', async () => {
    const response = await serveR2Media(
      new Request(
        'https://bestaitattoogenerator.com/api/storage/media/uploads/missing.png'
      ),
      bucket()
    );
    expect(response.status).toBe(404);
  });

  it('never publishes active SVG content on the application origin', async () => {
    const r2 = bucket();
    const provider = new R2BindingProvider(
      r2,
      'https://bestaitattoogenerator.com'
    );
    const result = await provider.uploadFile({
      key: 'unsafe.svg',
      body: new TextEncoder().encode('<svg onload="alert(1)"/>'),
      contentType: 'image/svg+xml',
    });
    expect(result.success).toBe(false);
    expect(r2.put).not.toHaveBeenCalled();
  });
});
