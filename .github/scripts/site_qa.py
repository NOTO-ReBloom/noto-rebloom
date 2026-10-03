from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
PAGES = [
    "404.html",
    "contact.html",
    "diagnosis.html",
    "event.html",
    "index.html",
    "journal.html",
    "learn.html",
    "media.html",
    "partner.html",
    "photo-credits.html",
    "report.html",
    "thoughts.html",
]
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "data:", "javascript:")


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[tuple[str, str]] = []
        self.blank_links_without_noopener: list[str] = []
        self.images_without_alt: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k.lower(): (v or "") for k, v in attrs}
        if data.get("id"):
            self.ids.append(data["id"])

        if tag in {"a", "link"} and data.get("href"):
            self.refs.append(("href", data["href"]))
        if tag in {"img", "script", "iframe", "source"} and data.get("src"):
            self.refs.append(("src", data["src"]))

        if tag == "a" and data.get("target", "").lower() == "_blank":
            rel = set(data.get("rel", "").lower().split())
            if "noopener" not in rel:
                self.blank_links_without_noopener.append(data.get("href", "(no href)"))

        if tag == "img" and "alt" not in data:
            self.images_without_alt.append(data.get("src", data.get("id", "(dynamic image)")))


def local_target(page: Path, ref: str) -> Path | None:
    ref = ref.strip()
    if not ref or ref.startswith("#") or ref.startswith("//") or ref.lower().startswith(SKIP_SCHEMES):
        return None
    clean = urlsplit(ref).path
    if not clean:
        return None
    if clean.startswith("/noto-rebloom/"):
        return ROOT / clean.removeprefix("/noto-rebloom/")
    if clean.startswith("/"):
        return None
    return (page.parent / clean).resolve()


def main() -> int:
    errors: list[str] = []

    for rel in PAGES:
        page = ROOT / rel
        if not page.exists():
            errors.append(f"{rel}: page is missing")
            continue

        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))

        seen: set[str] = set()
        duplicates: set[str] = set()
        for item in parser.ids:
            if item in seen:
                duplicates.add(item)
            seen.add(item)
        for item in sorted(duplicates):
            errors.append(f"{rel}: duplicate id={item!r}")

        for attr, ref in parser.refs:
            target = local_target(page, ref)
            if target is not None and not target.exists():
                errors.append(f"{rel}: missing local {attr} target {ref!r}")

        for href in parser.blank_links_without_noopener:
            errors.append(f"{rel}: target=_blank missing rel=noopener for {href!r}")

        for src in parser.images_without_alt:
            errors.append(f"{rel}: img missing alt attribute: {src!r}")

        text = page.read_text(encoding="utf-8")
        if 'site-finish-20261004.css?v=1' not in text:
            errors.append(f"{rel}: final consistency stylesheet is missing")
        if 'data-rb-footer-version="20261004"' not in text:
            errors.append(f"{rel}: static footer version marker is missing")

    if errors:
        print("Site QA failed:")
        for error in errors:
            print(f" - {error}")
        return 1

    print(f"Site QA passed for {len(PAGES)} pages.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
