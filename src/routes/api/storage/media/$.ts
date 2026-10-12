import { createFileRoute } from '@tanstack/react-router';

import { getR2Binding, serveR2Media } from '@/core/storage/r2-binding';

async function GET({ request }: { request: Request }) {
  const bucket = getR2Binding();
  if (!bucket)
    return new Response('Image storage unavailable', { status: 503 });
  return serveR2Media(request, bucket);
}

export const Route = createFileRoute('/api/storage/media/$')({
  server: { handlers: { GET } },
});
