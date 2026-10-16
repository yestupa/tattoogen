"""Read CMS content as UTF-8 bytes and verify it against reviewed draft hashes."""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--status', choices=('draft', 'published'), default='draft')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    query = (root / 'data/seo/article-verify.sql').read_text(encoding='utf-8')
    command = ['node.exe', str(root / 'node_modules/wrangler/bin/wrangler.js'), 'd1', 'execute', 'tattoo-generator', '--remote', '--json', '--command', query]
    result = subprocess.run(command, cwd=root, capture_output=True, check=True)
    (root / 'data/seo/article-draft-readback.json').write_bytes(result.stdout)
    # PowerShell's native stdout conversion can change Chinese and line endings.
    # Keep the raw CLI bytes until JSON has been decoded explicitly as UTF-8.
    rows = json.loads(result.stdout.decode('utf-8'))[0]['results']
    folder = root / 'docs/articles/discovery-2026-10-16'
    manifest = json.loads((folder / 'content-manifest.json').read_text(encoding='utf-8'))
    expected = {(page['slug'], locale): value for page in manifest for locale, value in page['locales'].items()}
    if len(rows) != len(expected):
        raise ValueError(f'Expected {len(expected)} translations; got {len(rows)}')
    evidence = []
    for row in rows:
        key = (row['slug'], row['locale'])
        body_hash = hashlib.sha256(row['content'].encode('utf-8')).hexdigest()
        if key not in expected or row['title'] != expected[key]['title'] or body_hash != expected[key]['body_sha256']:
            raise ValueError(f'CMS content mismatch: {key}')
        if row['status'] != args.status or row['translation_status'] != args.status:
            raise ValueError(f'CMS status mismatch: {key}')
        evidence.append({'post_id': row['id'], 'slug': row['slug'], 'locale': row['locale'], 'title': row['title'], 'body_sha256': body_hash, 'status': args.status})
    (root / 'data/seo/article-draft-readback.json').write_bytes(result.stdout)
    (folder / 'cms-verification.json').write_text(json.dumps({'verified_at': datetime.now(timezone.utc).isoformat(), 'translations': evidence}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
    print(f'Verified {len(rows)} CMS translations: exact UTF-8 titles, body hashes and {args.status} status match.')


if __name__ == '__main__':
    main()
