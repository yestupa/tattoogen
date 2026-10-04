import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { envConfigs } from '@/config';
import { getStorage } from '@/modules/storage/service';
import { md5 } from '@/lib/hash';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

import {
  parseBoundedMultipartFormData,
  prepareImageUploads,
  storageUploadFailureResponse,
  uploadErrorResponse,
} from './-image-upload';

// Apply the same cap to local and remote storage to bound memory and storage use.
const MAX_IMAGE_BYTES = (Number(envConfigs.inline_image_max_kb) || 2048) * 1024;
const MAX_IMAGE_FILES = 9;
const MAX_AGGREGATE_IMAGE_BYTES = MAX_IMAGE_BYTES * MAX_IMAGE_FILES;
const MAX_MULTIPART_BYTES = MAX_AGGREGATE_IMAGE_BYTES + 1024 * 1024;

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 1000,
    keyPrefix: 'upload-image',
  });
  if (limited) return limited;

  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const formData = await parseBoundedMultipartFormData(
      request,
      MAX_MULTIPART_BYTES
    );
    const uploads = await prepareImageUploads(formData, {
      maxFiles: MAX_IMAGE_FILES,
      maxFileBytes: MAX_IMAGE_BYTES,
      maxAggregateBytes: MAX_AGGREGATE_IMAGE_BYTES,
    });

    const storage = await getStorage();
    const uploadResults: Array<{
      url: string;
      key: string;
      filename: string;
      deduped: boolean;
    }> = [];

    for (const { file, body, extension } of uploads) {
      const digest = md5(body);
      // R2Provider prepends its own uploadPath (default `uploads`), so the object
      // key is the bare filename. The local fallback uses `public/uploads/<file>`.
      const objectKey = `${digest}.${extension}`;

      // No storage configured → persist to public/uploads and return a short
      // local URL. Avoids inlining a giant base64 data URL into DB columns (some
      // are varchar(255)). Configure R2 (admin → Storage) for production.
      if (!storage) {
        const dir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, objectKey), body);
        uploadResults.push({
          url: `/uploads/${objectKey}`,
          key: `uploads/${objectKey}`,
          filename: file.name,
          deduped: false,
        });
        continue;
      }

      const exists = await storage.exists({ key: objectKey });
      if (exists) {
        const publicUrl = storage.getPublicUrl({ key: objectKey });
        if (publicUrl) {
          uploadResults.push({
            url: publicUrl,
            key: objectKey,
            filename: file.name,
            deduped: true,
          });
          continue;
        }
      }

      const result = await storage.uploadFile({
        body,
        key: objectKey,
        contentType: file.type,
        disposition: 'inline',
      });

      if (!result.success || !result.url) {
        return storageUploadFailureResponse(result, objectKey);
      }

      uploadResults.push({
        url: result.url,
        key: result.key || objectKey,
        filename: file.name,
        deduped: false,
      });
    }

    return respData({
      urls: uploadResults.map((r) => r.url),
      results: uploadResults,
    });
  } catch (error) {
    return uploadErrorResponse(error);
  }
}

export const Route = createFileRoute('/api/storage/upload-image')({
  server: {
    handlers: { POST },
  },
});
