"""Generate idempotent CMS draft SQL; execute only through the authorized D1 CLI.

This adds editorial records to existing tables. It never creates users, changes
roles, changes schemas, or replaces another post with the same slug. The author
is inherited from the existing approved tattoo-aftercare post.
"""

from __future__ import annotations

import json
import argparse
import time
import uuid
from pathlib import Path


def sql(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh-from', type=Path, help='Previously verified raw D1 readback; refresh only matching owned drafts')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    folder = root / "docs/articles/discovery-2026-10-16"
    payloads = json.loads((folder / "cms-drafts.json").read_text(encoding="utf-8"))
    namespace = uuid.UUID("72d9ae34-86aa-48be-b9b3-3e3d2d8565fd")
    now = int(time.time() * 1000)
    drafts, publish, unpublish, ids, refresh = [], [], [], [], []
    previous = {}
    if args.refresh_from:
        previous = {(row['slug'], row['locale']): row for row in json.loads(args.refresh_from.read_bytes())[0]['results']}
    for payload in payloads:
        english = next(item for item in payload["translations"] if item["locale"] == "en")
        slug = english["slug"]
        post_id = str(uuid.uuid5(namespace, slug))
        ids.append(post_id)
        # ON CONFLICT is deliberately absent: a collision blocks rather than
        # overwriting an existing record owned by another author or workflow.
        values = [post_id, slug, "article", english["title"], english["description"], payload["image"], english["content"], payload["categories"], "", "draft"]
        drafts.append("INSERT INTO post (id,user_id,slug,type,title,description,image,content,categories,author_name,status,created_at,updated_at,sort) SELECT " + sql(values[0]) + ",user_id," + ",".join(sql(value) for value in values[1:]) + f",{now},{now},0 FROM post WHERE slug='tattoo-aftercare' AND NOT EXISTS (SELECT 1 FROM post WHERE id={sql(post_id)});" )
        for item in payload["translations"]:
            translation_id = str(uuid.uuid5(namespace, f"{slug}:{item['locale']}"))
            columns = [translation_id, post_id, item["locale"], slug, item["title"], item["description"], item["content"], "draft"]
            drafts.append("INSERT INTO post_translation (id,post_id,locale,slug,title,description,content,status,published_at,created_at,updated_at) SELECT " + ",".join(sql(value) for value in columns) + f",NULL,{now},{now} WHERE NOT EXISTS (SELECT 1 FROM post_translation WHERE id={sql(translation_id)});" )
            if args.refresh_from:
                old = previous[(slug, item['locale'])]
                if old['id'] != post_id or old['status'] != 'draft' or old['translation_status'] != 'draft':
                    raise ValueError(f'Refusing to refresh an unowned or published record: {slug}')
                guard = f"content={sql(old['content'])} AND title={sql(old['title'])} AND COALESCE(description,'')={sql(old['description'] or '')}"
                changes = f"title={sql(item['title'])},description={sql(item['description'])},content={sql(item['content'])},updated_at={now}"
                refresh.append(f"UPDATE post_translation SET {changes} WHERE id={sql(translation_id)} AND post_id={sql(post_id)} AND locale={sql(item['locale'])} AND status='draft' AND {guard};")
                if item['locale'] == 'en':
                    refresh.append(f"UPDATE post SET {changes} WHERE id={sql(post_id)} AND slug={sql(slug)} AND status='draft' AND {guard};")
        publish.append(f"UPDATE post_translation SET status='published',published_at=COALESCE(published_at,{now}),updated_at={now} WHERE post_id={sql(post_id)} AND status='draft';")
        publish.append(f"UPDATE post SET status='published',updated_at={now} WHERE id={sql(post_id)} AND status='draft';")
        unpublish.append(f"UPDATE post_translation SET status='draft',updated_at={now} WHERE post_id={sql(post_id)};")
        unpublish.append(f"UPDATE post SET status='draft',updated_at={now} WHERE id={sql(post_id)};")
    output = root / "data/seo"
    output.mkdir(parents=True, exist_ok=True)
    for name, lines in (("article-drafts.sql", drafts), ("article-publish.sql", publish), ("article-unpublish.sql", unpublish)):
        (output / name).write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    if refresh:
        (output / 'article-refresh-drafts.sql').write_text('\n'.join(refresh)+'\n', encoding='utf-8', newline='\n')
    where = ",".join(sql(value) for value in ids)
    # Repair only this release's draft records if an older Windows writer
    # converted embedded markdown LF to CRLF during SQL file creation.
    normalize = f"UPDATE post_translation SET content=replace(content,char(13)||char(10),char(10)) WHERE post_id IN ({where}) AND status='draft';\nUPDATE post SET content=replace(content,char(13)||char(10),char(10)) WHERE id IN ({where}) AND status='draft';\n"
    (output / 'article-normalize.sql').write_text(normalize, encoding='utf-8', newline='\n')
    (output / "article-verify.sql").write_text(f"SELECT p.id,p.slug,p.status,pt.locale,pt.title,pt.description,pt.content,pt.status AS translation_status FROM post p JOIN post_translation pt ON pt.post_id=p.id WHERE p.id IN ({where}) ORDER BY p.slug,pt.locale;\n", encoding="utf-8")
    print(json.dumps({"draft_records": len(payloads), "translations": len(payloads) * 2, "output": "data/seo", "execution": "not-executed"}))


if __name__ == "__main__":
    main()
