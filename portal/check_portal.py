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
assert "color-scheme:dark" in HTML and "--bg:#08090b" in HTML, "Project portal must use its dark universe theme"
assert "Validate root for branch-based GitHub Pages" in WORKFLOW, "Publishing must use only main branch Pages"
assert "actions/deploy-pages@" not in WORKFLOW and "upload-pages-artifact@" not in WORKFLOW, "Duplicate Pages publisher must be disabled"
assert "pages: write" not in WORKFLOW, "Production sync should not deploy Pages directly"
for logo in ("film-producer", "football-manager", "fysen", "aha-echonet", "paradisavisa", "paradispartiet", "teorien-om-lyset", "finn-natur"):
    assert (ROOT / "assets" / "project-logos" / "v2" / f"{logo}.webp").is_file(), f"Missing new logo: {logo}"
for logo in ("aha.svg", "filmverket.svg", "football-manager.svg", "fysen.svg", "paradispartiet.svg"):
    assert (ROOT / "assets" / "project-logos" / logo).is_file(), f"Missing project logo asset: {logo}"
assert (ROOT / ".nojekyll").exists(), "Root .nojekyll required for branch-based Pages deployment"
assert "Paradispartiet production host" not in ROOT_HTML, "README must not become homepage"
assert "History-Go-2" not in ROOT_HTML, "Do not expose removed History GO 2 project"


EXPECTED_REPOS = set()  # Prosjektkort skal åpne tjenester, ikke kildekode

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
assert '<span class="project-title">Finn Natur</span>' not in HTML, "Finn Natur must not appear in the public catalog"
assert "History GO 2" not in HTML and "History-Go-2" not in HTML, "Archived History GO 2 must be hidden from the portal"
for removed in ("EchoNet", "Skrivekunstakademiet", "Kunstakademiet"):
    assert f'<span class="project-title">{removed}</span>' not in HTML, f"Unbuilt or redundant project still visible: {removed}"
assert '<span class="project-title">AHA EchoNet</span>' in HTML

# Alle fire prosjektkort åpner sin egen publiserte nettside når logoen
# eller resten av kortflaten trykkes. De må aldri sende til GitHub-koden.
SITE_CARDS = {
    "AHA EchoNet": "https://paradispartiet.github.io/AHA-EchoNet/",
    "Paradispartiet": "https://paradispartiet.github.io/Paradispartiet/",
    "Paradisavisa": "https://paradispartiet.github.io/Paradisavisa/",
    "Teorien om lyset": "https://paradispartiet.github.io/Teorien-om-lyset/",
}
for title, url in SITE_CARDS.items():
    pattern = rf'<article class="project-card[^"]*"[^>]*>\s*<a class="project-link" href="{re.escape(url)}"[^>]*>\s*<span class="app-icon [^"]+"[^>]*><img src="assets/project-logos/v2/[^"]+"[^>]*>.*?<span class="project-title">{re.escape(title)}</span>'
    assert re.search(pattern, HTML, re.S), f"{title}: icon and card must link to its own live website"

assert 'https://paradispartiet.github.io/AHA-EchoNet/' in parser.hrefs, "AHA card must link to app, not code"
assert "https://paradispartiet.github.io/Teorien-om-lyset/" in parser.hrefs, "Teorien om lyset must link to published book, not source code"
assert '<img src="/History-Go/bilder/logo_historygo.PNG"' in HTML, "HistoryGo logo remains unchanged"
assert HTML.count('class="project-description"') == 8, "Every card needs a short description"
assert '<details class="archive">' not in HTML, "Technical archive section must be hidden"
assert 'class="archive-link"' not in HTML, "Technical repository links must be hidden"
assert 'class="source-link"' not in HTML, "Code shortcut links do not belong in the compact launcher"
assert '>GitHub ↗</a>' not in HTML, "Do not expose technical navigation in app header"
assert '8 prosjekter' in HTML, "Initial project count must be eight"

assert 'id="project-catalog"' in HTML
assert 'class="project-grid"' in HTML
assert 'class="filters"' not in HTML and 'data-filter="' not in HTML, "Category tabs should not be displayed"
found = {match.group(1) for link in parser.hrefs
         if (match := re.fullmatch(r"https://github.com/Paradispartiet/([\w.-]+)", link))}
assert found == EXPECTED_REPOS, f"Missing: {EXPECTED_REPOS-found}; unexpected: {found-EXPECTED_REPOS}"
for published_url in ("/History-Go/", "/HG_Film_Producer/", "/HistoryGo-FootballManager/", "https://fysen.vercel.app/"):
    assert published_url in parser.hrefs, f"Missing live app link: {published_url}"
assert (ROOT / "fysen" / "index.html").is_file(), "Fysen launch entrypoint must exist"
fysen_html = (ROOT / "fysen" / "index.html").read_text(encoding="utf-8")
archive_html = (ROOT / "fysen" / "arkiv" / "index.html").read_text(encoding="utf-8")
assert "Gratis menyarkiv" not in HTML, "Fysen tile should not advertise a free archive"
assert 'http-equiv="refresh" content="0;url=https://fysen.vercel.app/"' in fysen_html, "Main Fysen route must launch the full Vercel app"
assert 'window.location.replace(destination.href)' in fysen_html, "Browser navigation should reach the full app"
assert 'href="https://fysen.vercel.app/"' in fysen_html, "Provide a no-JavaScript full-app link"
assert "Gratis arkivversjon" not in fysen_html, "The full-app launcher must not show the archive notice"
assert "Gratis arkivversjon" in archive_html, "Preserve the independent archive fallback"
assert re.search(r'<details class="menu-about">.*?<summary>Om</summary>.*?id="archive-notice".*?</details>', archive_html, re.S), "Fallback archive warning must remain under Meny > Om"
assert "test -f fysen/index.html" in WORKFLOW, "Fysen launcher must remain in branch-based Pages root"
assert "cmp portal/index.html index.html" in WORKFLOW, "Root must match the source before branch publishing"
assert 'cp portal/index.html index.html' in WORKFLOW
assert 'git add -A HG_Film_Producer HistoryGo-FootballManager History-Go index.html .nojekyll' in WORKFLOW
assert "'portal/**'" in WORKFLOW
for directory in ("History-Go", "HG_Film_Producer", "HistoryGo-FootballManager"):
    assert f'test -f "$dir/index.html"' in WORKFLOW, "All apps must remain in the branch root"
assert "cat > _site-root/index.html" not in WORKFLOW
assert 'id="project-search"' in HTML, "Search field should remain available"
print("Portal check passed: 8 projects, no Finn Natur card, no tabs, branch-only Pages deploy.")
