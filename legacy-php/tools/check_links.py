"""Crawl the site and check every link, image and asset.
Usage: python -I tools/check_links.py http://localhost:8080 [--external] [--csv out.csv]
Checks: internal links/assets return 200 (or redirect to 200), no "#" placeholders,
external links open in a new tab with rel=noopener, one <h1> per page, unique titles,
meta descriptions present. With --external, also requests every external URL.
"""
import csv, re, sys, urllib.parse, urllib.request
from html.parser import HTMLParser

BASE = sys.argv[1].rstrip("/")
EXTERNAL = "--external" in sys.argv
OUT = sys.argv[sys.argv.index("--csv") + 1] if "--csv" in sys.argv else None


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.assets, self.h1, self.title, self.desc, self.in_title, self.problems = [], [], 0, "", None, False, []

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == "a" and "href" in a:
            self.links.append((a["href"], a.get("target"), a.get("rel") or ""))
        if tag in ("img", "source", "script", "iframe") and (a.get("src") or a.get("srcset")):
            for part in (a.get("srcset") or a.get("src")).split(","):
                self.assets.append(part.strip().split(" ")[0])
        if tag == "link" and a.get("rel") in ("stylesheet", "icon", "canonical", "apple-touch-icon"):
            self.assets.append(a.get("href"))
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.in_title = True
        if tag == "meta" and a.get("name") == "description":
            self.desc = a.get("content")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, d):
        if self.in_title:
            self.title += d


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


op = urllib.request.build_opener(NoRedirect())


def status(url, follow=True, method="GET"):
    hops = 0
    while True:
        try:
            r = op.open(urllib.request.Request(url, method=method, headers={"User-Agent": "Mozilla/5.0 link-check"}), timeout=20)
            return r.status, url, r
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308) and follow and hops < 5:
                url = urllib.parse.urljoin(url, e.headers["Location"])
                hops += 1
                continue
            return e.code, url, None
        except Exception as e:
            return f"ERR {type(e).__name__}", url, None


pages, queue, seen = {}, ["/"], set()
rows, problems, titles = [], [], {}
while queue:
    path = queue.pop(0)
    if path in seen:
        continue
    seen.add(path)
    code, final, r = status(BASE + path)
    if code != 200 or r is None or "text/html" not in r.headers.get("Content-Type", ""):
        continue
    html = r.read().decode("utf-8", "replace")
    p = P()
    p.feed(html)
    pages[path] = p
    titles.setdefault(p.title.strip(), []).append(path)
    if p.h1 != 1:
        problems.append(f"{path}: {p.h1} <h1> elements (expected 1)")
    if not p.desc:
        problems.append(f"{path}: missing meta description")
    for href, target, rel in p.links:
        if href in ("#", "") or href.startswith("javascript:"):
            problems.append(f"{path}: placeholder link '{href}'")
            continue
        if href.startswith("#main"):
            continue
        u = urllib.parse.urljoin(BASE + path, href)
        if u.startswith(BASE):
            rel_path = urllib.parse.urlparse(u).path or "/"
            rows.append((path, href, "internal"))
            if rel_path not in seen and not rel_path.startswith(("/uploads/", "/assets/")):
                queue.append(rel_path)
        elif href.startswith(("mailto:", "tel:")):
            rows.append((path, href, "contact"))
        else:
            rows.append((path, href, "external"))
            if target != "_blank" or "noopener" not in rel:
                problems.append(f"{path}: external link without target=_blank rel=noopener: {href}")
    for a in p.assets:
        if a:
            rows.append((path, a, "asset"))

checked = {}
for page, href, kind in rows:
    key = (href if kind == "external" else urllib.parse.urljoin(BASE + page, href))
    if key in checked or kind == "contact":
        continue
    if kind == "external" and not EXTERNAL:
        checked[key] = "not checked"
        continue
    code, final, _ = status(key)
    checked[key] = code
    if code != 200:
        problems.append(f"{page}: {kind} {href} -> {code}")

for t, ps in titles.items():
    if len(ps) > 1:
        problems.append(f"duplicate <title> '{t}' on {', '.join(ps)}")

print(f"Pages crawled: {len(pages)}")
for pth in sorted(pages):
    print("  ", pth)
print(f"Links/assets checked: {len(checked)}  (external {'checked' if EXTERNAL else 'listed only'})")
if OUT:
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["found_on", "link", "type", "status"])
        for page, href, kind in rows:
            key = (href if kind == "external" else urllib.parse.urljoin(BASE + page, href))
            w.writerow([page, href, kind, checked.get(key, "n/a (mailto/tel)")])
print(f"Problems: {len(problems)}")
for pr in problems:
    print("  -", pr)
sys.exit(1 if problems else 0)
