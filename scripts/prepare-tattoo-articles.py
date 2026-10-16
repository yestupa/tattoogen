"""Prepare reviewed bilingual CMS drafts. Does not connect to a database."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ARTICLES = {
    "poison-tree-tattoo-meaning": "/imgs/poison-tree/fine-line.webp",
    "222-tattoo-meaning": "/imgs/angel-numbers/222.webp",
    "butterfly-tattoo-meaning": "/imgs/butterfly/fine-line.webp",
}


def extract(path: Path, locale: str, slug: str) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    header = re.match(r"\A<!--\s*(.*?)-->\s*", text, re.S)
    if not header:
        raise ValueError(f"Missing editorial metadata: {path.name}")
    fields = {}
    for line in header[1].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            fields[key.strip()] = value.strip()
    body = text[header.end():]
    if not body.startswith("# "):
        raise ValueError(f"Missing draft H1: {path.name}")
    body = body.split("\n", 1)[1].strip() + "\n"
    if re.search(r"^# ", body, re.M) or "<!--" in body:
        raise ValueError(f"Editorial markup remains in CMS body: {path.name}")
    if re.search(r"\b(?:TBD|TODO)\b|internal link:", body):
        raise ValueError(f"Unresolved editing marker: {path.name}")
    local_links = re.findall(r"\]\((/[^\s)]+)\)", body)
    if len(set(local_links)) < 5:
        raise ValueError(f"Too few contextual internal links: {path.name}")
    if locale == "zh" and any(not link.startswith("/zh/") for link in local_links):
        raise ValueError(f"Chinese internal link loses locale: {path.name}")
    if locale == "en" and any(link.startswith("/zh/") for link in local_links):
        raise ValueError(f"English internal link points to Chinese: {path.name}")
    if re.search(r"(?:javascript|data):", body, re.I):
        raise ValueError(f"Unsafe article destination: {path.name}")
    title, description = fields.get("Title", ""), fields.get("Description", "")
    if not title or not description:
        raise ValueError(f"Missing title or description: {path.name}")
    return {"locale": locale, "slug": slug, "title": title, "description": description, "content": body, "status": "draft"}


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    folder = root / "docs" / "articles" / "discovery-2026-10-16"
    payloads = []
    manifest = []
    for slug, image in ARTICLES.items():
        if not (root / "public" / image.lstrip("/")).is_file():
            raise ValueError(f"Missing article image: {image}")
        translations = [extract(folder / f"{slug}.{locale}.md", locale, slug) for locale in ("en", "zh")]
        payloads.append({"image": image, "categories": "tattoo-meaning", "authorName": "", "translations": translations})
        manifest.append({"slug": slug, "image": image, "locales": {item["locale"]: {"title": item["title"], "body_sha256": hashlib.sha256(item["content"].encode()).hexdigest(), "body_bytes": len(item["content"].encode()), "internal_links": sorted(set(re.findall(r"\]\((/[^\s)]+)\)", item["content"]))) } for item in translations}})
    (folder / "cms-drafts.json").write_text(json.dumps(payloads, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")
    (folder / "content-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")
    print(json.dumps({"articles": len(payloads), "translations": sum(len(item["translations"]) for item in payloads), "status": "draft", "unsafe_or_editorial_markup": False}, indent=2))


if __name__ == "__main__":
    main()
