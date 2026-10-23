#!/usr/bin/env python3
"""Lightweight checks for the static public project portal."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "portal" / "index.html").read_text(encoding="utf-8")
WORKFLOW = (ROOT / ".github" / "workflows" / "sync-production-sites.yml").read_text(encoding="utf-8")

EXPECTED_REPOS = {
    "Paradispartiet", "Teorien-om-lyset", "EchoNet", "History-Go",
    "Paradisavisa", "History-Go-2", "AHA-EchoNet", "HG",
    "HistoryGo-FootballManager", "HG_Film_Producer", "Kunstakademiet",
    "Skrivekunstakademiet", "fysen", "fysen-preview",
    "Paradispartiet.github.io", "HG_Film_Producer-preview",
    "HistoryGo-FootballManager-preview", "History-Go-preview",
}

class PortalParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs = []
        self.cards = 0
        self.featured = 0

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"])
            if data.get("target") == "_blank":
                assert "noopener" in data.get("rel", ""), "External link must use rel=noopener"
        if tag == "article" and "project-card" in data.get("class", "").split():
            self.cards += 1
            if "is-featured" in data.get("class", "").split():
                self.featured += 1

parser = PortalParser()
parser.feed(HTML)
assert parser.cards == 12, f"Expected 12 project cards, got {parser.cards}"
assert parser.featured == 3, f"Expected 3 featured games, got {parser.featured}"
found = {match.group(1) for link in parser.hrefs
         if (match := re.fullmatch(r"https://github.com/Paradispartiet/([\w.-]+)", link))}
assert found == EXPECTED_REPOS, f"Missing: {EXPECTED_REPOS-found}; unexpected: {found-EXPECTED_REPOS}"
for published_url in ("/History-Go/", "/HG_Film_Producer/", "/HistoryGo-FootballManager/"):
    assert published_url in parser.hrefs, f"Missing live app link: {published_url}"
assert 'cp portal/index.html _site-root/index.html' in WORKFLOW
assert "'portal/**'" in WORKFLOW
for directory in ("History-Go", "HG_Film_Producer", "HistoryGo-FootballManager"):
    assert f"cp -a {directory} _site-root/" in WORKFLOW
assert "cat > _site-root/index.html" not in WORKFLOW
assert 'id="project-search"' in HTML and 'aria-pressed="true"' in HTML
print("Portal check passed: 12 project cards, 18 distinct repositories, 3 app links, Pages workflow intact.")
