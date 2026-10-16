r"""Map a supplied competitor keyword snapshot without publishing the raw export.

Usage (PowerShell): python scripts/analyze-tattoo-keywords.py --source 'D:\...\export.csv'
The complete classification is local-only under data/seo. A small page brief is
written under docs/seo for editorial use. Metrics remain the supplied snapshot;
this script does not contact a ranking provider or claim current search volumes.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


EXISTING = {
    "womb": "/womb-tattoo-generator",
    "fear god": "/fear-god-tattoo-generator",
    "kaiser": "/kaiser-tattoo-generator",
    "poison tree": "/poison-tree-tattoo-generator",
    "butterfly": "/butterfly-tattoo-generator",
    "couple": "/couple-tattoo-generator",
    "angel numbers": "/angel-numbers-tattoo-generator",
    "joker": "/joker-tattoo-generator",
    "ghost face": "/ghost-face-tattoo-generator",
    "throat": "/throat-tattoo-for-men-generator",
}

# More specific intent wins. Collection slugs match the curated release catalog.
RULES = [
    (r"poison tree.*meaning|meaning.*poison tree", "/blog/poison-tree-tattoo-meaning", "article"),
    (r"222.*meaning|meaning.*222", "/blog/222-tattoo-meaning", "article"),
    (r"butterfly.*meaning|meaning.*butterfly", "/blog/butterfly-tattoo-meaning", "article"),
    (r"stencil", "/tattoo-to-stencil", "tool"),
    (r"font|lettering|calligraphy|cursive|blackletter|ambigram", "/tattoo-font-generator", "tool"),
    (r"cover.?up", "/tattoo-cover-up", "tool"),
    (r"filler|gap.fill", "/tattoo-filler", "tool"),
    (r"try.on|virtual tattoo", "/try-tattoo", "tool"),
    (r"image.to.tattoo|photo.to.tattoo", "/image-to-tattoo", "tool"),
    (r"idea.generator", "/tattoo-idea-generator", "tool"),
    (r"womb", EXISTING["womb"], "existing"),
    (r"fear\s+(?:of\s+)?god", EXISTING["fear god"], "existing"),
    (r"kaiser", EXISTING["kaiser"], "existing"),
    (r"poison tree", EXISTING["poison tree"], "existing"),
    (r"butterfl", EXISTING["butterfly"], "existing"),
    (r"couple", EXISTING["couple"], "existing"),
    (r"angel number|\b(?:1111|111|222|333|444|555|777|888|999)\b", EXISTING["angel numbers"], "existing"),
    (r"joker", EXISTING["joker"], "existing"),
    (r"ghost\s*face", EXISTING["ghost face"], "existing"),
    (r"throat(?!.*women)", EXISTING["throat"], "existing"),
    (r"fine.?line|delicate", "/tattoo-styles/fine-line", "style"),
    (r"blackwork|black.work", "/tattoo-styles/blackwork", "style"),
    (r"watercolou?r", "/tattoo-styles/watercolor", "style"),
    (r"floral|botanical|flower", "/tattoo-styles/floral", "style"),
    (r"geometric|geometry", "/tattoo-styles/geometric", "style"),
    (r"forearm", "/tattoo-placements/forearm", "placement"),
    (r"wrist", "/tattoo-placements/wrist", "placement"),
    (r"finger", "/tattoo-placements/finger", "placement"),
    (r"shoulder", "/tattoo-placements/shoulder", "placement"),
    (r"\brose\b", "/tattoo-ideas/rose", "subject"),
    # No accurate phoenix examples are available in this release.
    (r"phoenix", "", "subject-backlog"),
    (r"sun.and.moon|sun.moon|moon.and.sun", "/tattoo-ideas/sun-and-moon", "subject"),
    (r"memorial|memory|remembrance", "/tattoo-ideas/memorial", "subject"),
]


def number(value: str | None) -> float:
    try:
        return float((value or "0").replace(",", ""))
    except ValueError:
        return 0


def classify(keyword: str) -> tuple[str, str]:
    normalized = " ".join(keyword.lower().split())
    # Meaning searches are informational. Avoid misrouting unrelated meanings
    # into a collection just because an animal/flower word also matches it.
    if re.search(r"\bmeaning\b|what does|symboli[sz]", normalized):
        for pattern, path, kind in RULES[:3]:
            if re.search(pattern, normalized):
                return path, kind
        return "", "editorial-backlog"
    for pattern, path, kind in RULES[3:]:
        if re.search(pattern, normalized):
            return path, kind
    return "", "unmapped-backlog"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    root = Path(__file__).resolve().parents[1]
    raw = source.read_bytes()
    fingerprint = hashlib.sha256(raw).hexdigest().upper()
    reader = csv.DictReader(raw.decode("utf-8-sig").splitlines())
    required = {"Keyword", "Country", "Volume", "KD", "Current position", "Current URL"}
    if not required.issubset(reader.fieldnames or []):
        raise SystemExit("CSV columns do not match the expected keyword export")
    mapped = []
    for row in reader:
        keyword = row["Keyword"].strip()
        path, kind = classify(keyword)
        mapped.append({
            "keyword": keyword,
            "country": row["Country"],
            "source_volume": row["Volume"],
            "source_kd": row["KD"],
            "source_organic_traffic": row.get("Organic traffic", ""),
            "source_position": row["Current position"],
            "competitor_url": row["Current URL"],
            "target_path": path,
            "intent": kind,
            "review_status": "candidate-requires-page-fit-review" if path else "deferred-no-page-created",
        })
    if not mapped:
        raise SystemExit("CSV contains no keyword records")

    local = root / "data" / "seo"
    public = root / "docs" / "seo"
    local.mkdir(parents=True, exist_ok=True)
    public.mkdir(parents=True, exist_ok=True)
    columns = list(mapped[0])
    with (local / "blackink-keyword-classification.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(mapped)

    by_page: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in mapped:
        if row["target_path"]:
            by_page[row["target_path"]].append(row)
    # Keep the versioned brief small. Raw export and full classifications stay local.
    brief = []
    for path, rows in sorted(by_page.items()):
        ranked = sorted(rows, key=lambda item: (number(item["source_organic_traffic"]), number(item["source_volume"])), reverse=True)
        brief.extend(ranked[:6])
    with (public / "tattoo-keyword-page-map.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(brief)

    summary = {
        "source_file": source.name,
        "source_sha256": fingerprint,
        "source_record_count": len(mapped),
        "source_countries": dict(Counter(row["country"] for row in mapped)),
        "metric_note": "User-supplied competitor ranking snapshot; export date unknown. Not live measurements, forecasts, or our rankings. Keyword variants can overlap and must not be summed as unique demand.",
        "matching_note": "Automated candidate mapping only. Editorial review decides whether a page independently satisfies the intent. Unmapped and meaning backlogs do not create URLs.",
        "intent_counts": dict(Counter(row["intent"] for row in mapped)),
        "candidate_page_count": len(by_page),
        "versioned_brief_records": len(brief),
        "full_classification": "data/seo/blackink-keyword-classification.csv (gitignored)",
        "raw_export_committed": False,
    }
    (public / "tattoo-keyword-source.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")
    print(json.dumps(summary, ensure_ascii=True, indent=2))
    if hashlib.sha256(source.read_bytes()).hexdigest().upper() != fingerprint:
        raise SystemExit("Source changed during analysis; re-run against a stable source")


if __name__ == "__main__":
    main()
