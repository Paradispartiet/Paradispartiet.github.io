#!/usr/bin/env python3
"""Lightweight checks for the static public project portal."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "portal" / "index.html").read_text(encoding="utf-8")
WORKFLOW = (ROOT / ".github" / "workflows" / "sync-production-sites.yml").read_text(encoding="utf-8")
ROOT_HTML = (ROOT / "index.html").read_text(encoding="utf-8")
assert ROOT_HTML == HTML, "Public root index.html must match portal/index.html"
assert (ROOT / ".nojekyll").exists(), "Root .nojekyll required for branch-based Pages deployment"
assert "Paradispartiet production host" not in ROOT_HTML, "README must not become homepage"
assert "History-Go-2" not in ROOT_HTML, "Do not expose removed History GO 2 project"


EXPECTED_REPOS = {"AHA-EchoNet", "fysen", "Teorien-om-lyset"}

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
            if "featured" in data.get("class", "").split():
                self.featured += 1

parser = PortalParser()
parser.feed(HTML)
assert parser.cards == 8, f"Expected 8 project cards, got {parser.cards}"
assert parser.featured == 3, f"Expected 3 featured games, got {parser.featured}"
assert "History GO 2" not in HTML and "History-Go-2" not in HTML, "Archived History GO 2 must be hidden from the portal"
for removed in ("EchoNet", "Skrivekunstakademiet", "Kunstakademiet"):
    assert f'<span class="project-title">{removed}</span>' not in HTML, f"Unbuilt or redundant project still visible: {removed}"
assert '<span class="project-title">AHA EchoNet</span>' in HTML
assert '<details class="archive">' not in HTML, "Technical archive section must be hidden"
assert 'class="archive-link"' not in HTML, "Technical repository links must be hidden"
assert 'class="source-link"' not in HTML, "Code shortcut links do not belong in the compact launcher"
assert '>GitHub ↗</a>' not in HTML, "Do not expose technical navigation in app header"
assert '8 prosjekter' in HTML, "Initial project count must be eight"

assert 'id="project-catalog"' in HTML
assert 'class="project-grid"' in HTML
assert 'data-filter="spill"' in HTML
found = {match.group(1) for link in parser.hrefs
         if (match := re.fullmatch(r"https://github.com/Paradispartiet/([\w.-]+)", link))}
assert found == EXPECTED_REPOS, f"Missing: {EXPECTED_REPOS-found}; unexpected: {found-EXPECTED_REPOS}"
for published_url in ("/History-Go/", "/HG_Film_Producer/", "/HistoryGo-FootballManager/"):
    assert published_url in parser.hrefs, f"Missing live app link: {published_url}"
assert 'cp portal/index.html _site-root/index.html' in WORKFLOW
assert 'cp portal/index.html index.html' in WORKFLOW
assert 'git add -A HG_Film_Producer HistoryGo-FootballManager History-Go index.html .nojekyll' in WORKFLOW
assert "'portal/**'" in WORKFLOW
for directory in ("History-Go", "HG_Film_Producer", "HistoryGo-FootballManager"):
    assert f"cp -a {directory} _site-root/" in WORKFLOW
assert "cat > _site-root/index.html" not in WORKFLOW
assert 'id="project-search"' in HTML and 'aria-pressed="true"' in HTML
print("Portal check passed: 8 active project tiles, no unbuilt projects or technical archives, 3 live app links.")
