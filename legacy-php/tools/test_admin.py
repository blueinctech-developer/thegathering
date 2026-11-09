"""Admin / CMS / security tests against a running local site.
Usage: python -I tools/test_admin.py http://localhost:8080 <test_image.jpg> <test.pdf-or-''> <mysql_args...>
"""
import http.cookiejar, os, re, subprocess, sys, time, urllib.parse, urllib.request, uuid

BASE, IMG = sys.argv[1], sys.argv[2]
MYSQL = sys.argv[3:]
results = []


def sql(q):
    out = subprocess.run(MYSQL + ["-N", "-e", q], capture_output=True, text=True)
    if out.returncode:
        raise RuntimeError(out.stderr)
    return out.stdout.strip()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def session():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), NoRedirect())


def req(op, path, data=None, files=None):
    headers = {}
    body = None
    if files is not None:
        b = uuid.uuid4().hex
        parts = []
        for k, v in (data or {}).items():
            parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
        for k, (fname, content, ctype) in files.items():
            parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{fname}"\r\nContent-Type: {ctype}\r\n\r\n'.encode() + content + b"\r\n")
        parts.append(f"--{b}--\r\n".encode())
        body = b"".join(parts)
        headers["Content-Type"] = f"multipart/form-data; boundary={b}"
    elif data is not None:
        body = urllib.parse.urlencode(data).encode()
    r = urllib.request.Request(BASE + path, data=body, headers=headers)
    try:
        resp = op.open(r)
        return resp.status, resp.read().decode("utf-8", "replace"), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), e.headers


def csrf(html):
    m = re.search(r'name="_csrf" value="([^"]+)"', html)
    return m.group(1) if m else ""


def login(email, pw):
    op = session()
    st, html, _ = req(op, "/admin/login")
    st, html, h = req(op, "/admin/login", {"_csrf": csrf(html), "email": email, "password": pw})
    return op, st, h.get("Location", "")


def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


sql("DELETE FROM rate_hits; DELETE FROM users WHERE email='editor@example.test'; DELETE FROM redirects WHERE from_path='/old-convention-page'")
saved = sql("SELECT GROUP_CONCAT(CONCAT(skey,'=',svalue) SEPARATOR '|') FROM settings WHERE skey LIKE 'form_%_enabled' OR skey IN ('contact_email','livestream_is_live','brand_primary','brand_accent')")
sql("INSERT INTO speakers (slug,name,is_published) VALUES ('tmp-test-speaker','TMP Test Speaker',1)")
anon = session()
for path in ["/admin", "/admin/settings", "/admin/submissions", "/admin/submissions/1", "/admin/submissions/export", "/admin/speakers", "/admin/users"]:
    st, _, h = req(anon, path)
    check(f"anonymous blocked from {path}", st in (302, 303) and "/admin/login" in h.get("Location", ""), st)

op, st, loc = login("admin@example.test", "wrong-password")
check("login: wrong password rejected", "/admin/login" not in loc and st == 200 or loc == "", (st, loc))
op, st, loc = login("admin@example.test", "LocalTest12345")
check("login: correct password signs in", st == 303 and loc.endswith("/admin"), (st, loc))

# Edit a speaker and confirm the public site changes immediately
sid = sql("SELECT id FROM speakers WHERE slug='tmp-test-speaker'")
st, html, _ = req(op, f"/admin/speakers/{sid}")
form = {"_csrf": csrf(html), "name": "TMP Test Speaker Renamed", "slug": "", "role_title": "TEST Title", "ministry": "", "bio": "<p>New bio<script>alert(1)</script> <a href='javascript:alert(1)'>x</a></p>", "is_published": "1", "photo_media_id_alt": "TEST alt"}
st, html, h = req(op, f"/admin/speakers/{sid}", form, files={})
check("speaker: save redirects", st == 303, st)
slug = sql(f"SELECT slug FROM speakers WHERE id={sid}")
st, html, _ = req(session(), f"/speakers/{slug}")
check("speaker: new name live on public page", "TMP Test Speaker Renamed" in html and st == 200, (st, slug))
check("speaker: script tags stripped from bio", "<script>" not in html and "javascript:" not in html)

# Upload photos to the album
aid = sql("SELECT id FROM albums ORDER BY id LIMIT 1")
st, html, _ = req(op, f"/admin/albums/{aid}")
before = int(sql(f"SELECT COUNT(*) FROM photos WHERE album_id={aid}"))
img = open(IMG, "rb").read()
st, html, h = req(op, f"/admin/albums/{aid}/upload", {"_csrf": csrf(html)}, files={"photos[]": ("new.jpg", img, "image/jpeg")})
check("gallery: photo upload works", int(sql(f"SELECT COUNT(*) FROM photos WHERE album_id={aid}")) == before + 1, st)

# Disguised script upload must be rejected
st, html, _ = req(op, "/admin/media")
st, html, h = req(op, "/admin/media", {"_csrf": csrf(html), "action": "upload"}, files={"files[]": ("evil.php.jpg", b"<?php echo 'pwned'; ?>", "image/jpeg")})
st, html, _ = req(op, "/admin/media")
check("upload: PHP disguised as image rejected", "Only images" in html and not sql("SELECT id FROM media WHERE original_name='evil.php.jpg'"))
check("upload: no .php files in uploads folder", not any(f.endswith(".php") for _, _, fs in os.walk("public_html/uploads") for f in fs))

# Settings: change contact email, appears in footer
st, html, _ = req(op, "/admin/settings")
data = {"_csrf": csrf(html), "_tab": "contact", "contact_email": "changed@example.test", "brand_primary": "#0b0b0c", "brand_accent": "#ffcc00"}
st, html, h = req(op, "/admin/settings", data)
st, html, _ = req(session(), "/")
check("settings: contact email change visible on site", "changed@example.test" in html)
st, html, _ = req(op, "/admin/settings")
st, html, h = req(op, "/admin/settings", {"_csrf": csrf(html), "contact_email": "thegatheringcof@gmail.com", "social_facebook": "not a url", "brand_primary": "#0b0b0c", "brand_accent": "#ffcc00"})
check("settings: invalid URL rejected", "Use a full link" in html)

# Editor role: can edit content, cannot reach settings/users
st, html, _ = req(op, "/admin/users/new")
st, html, h = req(op, "/admin/users/new", {"_csrf": csrf(html), "name": "TEST Editor", "email": "editor@example.test", "role": "editor", "is_active": "1", "password": "EditorPass123"})
check("users: admin can create editor", sql("SELECT role FROM users WHERE email='editor@example.test'") == "editor")
ed, st, loc = login("editor@example.test", "EditorPass123")
check("editor: can sign in", st == 303)
st, html, _ = req(ed, "/admin/settings")
check("editor: blocked from settings (403)", st == 403)
st, html, _ = req(ed, "/admin/users")
check("editor: blocked from users (403)", st == 403)
st, html, _ = req(ed, "/admin/redirects")
check("editor: blocked from redirects (403)", st == 403)
st, html, _ = req(ed, "/admin/settings")
st, html, _ = req(ed, "/admin/speakers")
check("editor: can open speakers", st == 200)
st, html, _ = req(ed, "/admin/users/1", {"_csrf": csrf(html), "action": "delete"})
check("editor: cannot delete users by direct POST", st == 403 and sql("SELECT COUNT(*) FROM users WHERE id=1") == "1")

# CSRF on admin
st, html, h = req(op, f"/admin/speakers/{sid}/delete", {"_csrf": "bad"})
check("admin CSRF: bad token refused", sql(f"SELECT COUNT(*) FROM speakers WHERE id={sid}") == "1")

# Redirects
st, html, _ = req(op, "/admin/redirects/new")
st, html, h = req(op, "/admin/redirects/new", {"_csrf": csrf(html), "from_path": "/old-convention-page", "to_path": "/register", "code": "301"})
st, _, h = req(session(), "/old-convention-page")
check("redirect: old URL 301s to new page", st == 301 and h.get("Location") == "/register", (st, h.get("Location")))
st, html, _ = req(session(), "/definitely-missing")
check("404: branded page with status 404", st == 404 and "couldn't find that page" in html)

# Export
st, body, h = req(op, "/admin/submissions/export?type=registration")
check("export: CSV download with header row", st == 200 and "text/csv" in h.get("Content-Type", "") and "Reference" in body)

# Password reset flow
sql("DELETE FROM rate_hits")
st, html, _ = req(session(), "/admin/forgot")
s2 = session()
st, html, _ = req(s2, "/admin/forgot")
st, html, _ = req(s2, "/admin/forgot", {"_csrf": csrf(html), "email": "editor@example.test"})
check("reset: request accepted (generic message)", "reset link is on its way" in html)
check("reset: email queued and sent", sql("SELECT status FROM email_outbox WHERE purpose='reset' ORDER BY id DESC LIMIT 1") == "sent")
mails = sorted(os.listdir(sys.argv[2].rsplit("/", 1)[0]) if False else [])

# Brute force lockout
sql("DELETE FROM rate_hits")
for i in range(6):
    o, st, loc = login("editor@example.test", "wrong")
o, st, loc = login("editor@example.test", "EditorPass123")
check("login: locked after 5 failures (even with right password)", st == 200, st)
sql("DELETE FROM rate_hits")

# Logout
st, html, _ = req(op, "/admin")
st, html, h = req(op, "/admin/logout", {"_csrf": csrf(html)})
st, html, h = req(op, "/admin")
check("logout: session ended", st in (302, 303))

# teardown: remove temporary data, restore settings
sql(f"DELETE FROM speakers WHERE id={sid}; DELETE FROM users WHERE email='editor@example.test'; DELETE FROM redirects WHERE from_path='/old-convention-page'")
sql(f"DELETE p, m FROM photos p JOIN media m ON m.id=p.media_id WHERE m.original_name='new.jpg'")
for kv in saved.split('|'):
    k, v = kv.split('=', 1)
    sql(f"UPDATE settings SET svalue='{v}' WHERE skey='{k}'")
passed = sum(1 for r in results if r[1])
print(f"\n{passed}/{len(results)} passed")
sys.exit(0 if passed == len(results) else 1)
