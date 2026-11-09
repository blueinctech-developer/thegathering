"""End-to-end form tests against a running local site.
Usage: python -I tools/test_forms.py http://localhost:8080 <mail_dir> <mysql_args...>
Requires the local test database (it reads/clears rows to check results).
"""
import http.cookiejar, os, re, subprocess, sys, time, urllib.parse, urllib.request

BASE = sys.argv[1]
MAIL = sys.argv[2]
MYSQL = sys.argv[3:]
results = []


def sql(q):
    out = subprocess.run(MYSQL + ["-N", "-e", q], capture_output=True, text=True)
    if out.returncode:
        raise RuntimeError(out.stderr)
    return out.stdout.strip()


def session():
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar), NoRedirect())
    return opener


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def fetch(op, path, data=None):
    req = urllib.request.Request(BASE + path, data=urllib.parse.urlencode(data).encode() if data is not None else None)
    try:
        r = op.open(req)
        return r.status, r.read().decode("utf-8", "replace"), r.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), e.headers


def tokens(html, form):
    m = re.search(r'<form class="form" id="form-%s".*?</form>' % form, html, re.S)
    if not m:
        return None
    f = m.group(0)
    return {
        "_csrf": re.search(r'name="_csrf" value="([^"]+)"', f).group(1),
        "_ts": re.search(r'name="_ts" value="([^"]+)"', f).group(1),
        "_back": re.search(r'name="_back" value="([^"]+)"', f).group(1),
    }


def submit(page, form, fields, wait=3.2, op=None, tweak=None):
    op = op or session()
    st, html, _ = fetch(op, page)
    t = tokens(html, form)
    assert t, f"form {form} not found on {page} (status {st})"
    if tweak:
        tweak(t)
    time.sleep(wait)
    data = dict(t, **fields)
    st, _, hdr = fetch(op, "/forms/" + form, data)
    loc = hdr.get("Location", "")
    st2, html2, _ = fetch(op, loc.split("#")[0] or page)
    return st, loc, html2, op


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


def mail_count():
    return len([f for f in os.listdir(MAIL) if f.endswith(".eml")]) if os.path.isdir(MAIL) else 0


def reset_limits():
    sql("DELETE FROM rate_hits")


saved_flags = sql("SELECT GROUP_CONCAT(CONCAT(skey,'=',svalue)) FROM settings WHERE skey LIKE 'form_%_enabled'")
sql("UPDATE settings SET svalue='1' WHERE skey LIKE 'form_%_enabled'; UPDATE settings SET svalue='TEST Team A' WHERE skey='volunteer_teams'")

# ---------- contact ----------
reset_limits()
m0 = mail_count()
n0 = int(sql("SELECT COUNT(*) FROM submissions WHERE form_type='contact'"))
st, loc, html, _ = submit("/contact", "contact", {"first_name": "Test", "last_name": "Person", "email": "tester@example.test", "subject": "Hello", "message": "Line one\nLine two"})
check("contact: redirects after POST (303)", st == 303, st)
check("contact: success message shown", "Received" in html and "MSG-" in html)
check("contact: row saved", int(sql("SELECT COUNT(*) FROM submissions WHERE form_type='contact'")) == n0 + 1)
time.sleep(0.5)
check("contact: 2 emails delivered (team + confirmation)", mail_count() - m0 == 2, mail_count() - m0)
check("contact: email_status = sent", sql("SELECT email_status FROM submissions WHERE form_type='contact' ORDER BY id DESC LIMIT 1") == "sent")

st, loc, html, _ = submit("/contact", "contact", {"first_name": "", "last_name": "P", "email": "not-an-email", "subject": "", "message": "x"})
check("contact invalid: errors shown", "valid email" in html and "This field is required" in html)
check("contact invalid: typed values kept", 'value="not-an-email"' in html)
check("contact invalid: nothing saved", int(sql("SELECT COUNT(*) FROM submissions WHERE form_type='contact'")) == n0 + 1)

m1 = mail_count()
st, loc, html, _ = submit("/contact", "contact", {"first_name": "Bot", "last_name": "B", "email": "bot@example.test", "subject": "Spam", "message": "spam", "website": "http://spam"})
check("honeypot: bot sees normal success", "Received" in html)
check("honeypot: saved as spam, no emails", sql("SELECT status FROM submissions ORDER BY id DESC LIMIT 1") == "spam" and mail_count() == m1)

st, loc, html, _ = submit("/contact", "contact", {"first_name": "Fast", "last_name": "F", "email": "fast@example.test", "subject": "x", "message": "x"}, wait=0)
check("time trap: instant submit marked spam", sql("SELECT status FROM submissions ORDER BY id DESC LIMIT 1") == "spam")

before = int(sql("SELECT COUNT(*) FROM submissions"))
st, loc, html, _ = submit("/contact", "contact", {"first_name": "X", "last_name": "X", "email": "x@example.test", "subject": "x", "message": "x"}, tweak=lambda t: t.update(_csrf="bad"))
check("CSRF: bad token rejected", "session expired" in html and int(sql("SELECT COUNT(*) FROM submissions")) == before)

reset_limits()
op = session()
codes = []
for i in range(7):
    st, loc, html, op = submit("/contact", "contact", {"first_name": "R", "last_name": "R", "email": f"r{i}@example.test", "subject": "x", "message": "x"}, wait=3.1 if i == 0 else 0.1, op=op)
check("rate limit: 7th post within 10 min blocked", "several submissions" in html)
reset_limits()

# ---------- registration ----------
sql("DELETE FROM registrations; DELETE FROM submissions WHERE form_type='registration'; UPDATE events SET registration_open=1, capacity=5 WHERE is_current=1")
m2 = mail_count()
reg = {"full_name": "Ada Test", "email": "ada@example.test", "phone": "+44 7700 900001", "city": "Test City", "attendees": "2", "consent": "1"}
st, loc, html, _ = submit("/register", "registration", reg)
ref = sql("SELECT reference FROM submissions WHERE form_type='registration' ORDER BY id DESC LIMIT 1")
check("registration: saved with REG reference", ref.startswith("REG-") and ref in html, ref)
time.sleep(0.5)
check("registration: team + confirmation emails sent", mail_count() - m2 == 2, mail_count() - m2)
conf = sorted(f for f in os.listdir(MAIL))[-2:]
body = "".join(open(os.path.join(MAIL, f), encoding="utf-8").read() for f in conf)
check("registration: confirmation contains reference, event and venue", ref in body and "The Gathering 2026" in body and "Oyo State, Nigeria" in body)

st, loc, html, _ = submit("/register", "registration", dict(reg, phone="+44 7700 999999"))
check("duplicate: same email rejected", "already registered" in html)
st, loc, html, _ = submit("/register", "registration", dict(reg, email="other@example.test"))
check("duplicate: same phone rejected", "already registered" in html)
st, loc, html, _ = submit("/register", "registration", dict(reg, consent=""))
check("registration: consent required", "Please tick this box" in html)
st, loc, html, _ = submit("/register", "registration", dict(reg, email="b@example.test", phone="+44 7700 900002", attendees="99"))
check("registration: attendee number validated", "number from 1 to 10" in html)

reset_limits()
st, loc, html, _ = submit("/register", "registration", dict(reg, email="c@example.test", phone="+44 7700 900003", attendees="3"))
check("capacity: 2+3 = 5 accepted", "REG-" in html)
st, html, _ = fetch(session(), "/register")
check("capacity: page shows 'full' when capacity reached", "Registration is full" in html)

sql("UPDATE events SET capacity=NULL, registration_open=0 WHERE is_current=1")
st, html, _ = fetch(session(), "/register")
check("closed switch: page shows closed", "Registration is closed" in html and 'id="form-registration"' not in html)
st, html, _ = fetch(session(), "/")
check("closed switch: homepage hides Register button", 'href="/register"' not in html)
sql("UPDATE events SET registration_open=1, capacity=5 WHERE is_current=1")

# ---------- other forms ----------
reset_limits()
for page, form, fields in [
    ("/prayer", "prayer", {"name": "P", "email": "p@example.test", "request": "Please pray"}),
    ("/volunteer", "volunteer", {"name": "V", "email": "v@example.test", "phone": "+44 7700 900004", "team": "TEST Team A", "consent": "1"}),
    ("/testimonies", "testimony", {"name": "T", "email": "t@example.test", "testimony": "Testimony text", "publish_ok": "1"}),
    ("/give", "partnership", {"name": "G", "email": "g@example.test", "country": "Nigeria", "interest": "Prayer Partner", "message": "Hi"}),
    ("/", "newsletter", {"name": "N", "email": "n@example.test"}),
]:
    st, loc, html, _ = submit(page, form, fields)
    check(f"{form}: saved and success shown", "Your reference" in html, loc)
check("testimony: lands as pending (not public)", sql("SELECT status FROM testimonies ORDER BY id DESC LIMIT 1") == "pending")
st, html, _ = fetch(session(), "/testimonies")
check("testimony: pending text not on public page", "Testimony text" not in html)

for kv in saved_flags.split(','):
    k, v = kv.split('=')
    sql(f"UPDATE settings SET svalue='{v}' WHERE skey='{k}'")
sql("UPDATE settings SET svalue='' WHERE skey='volunteer_teams'")
passed = sum(1 for r in results if r[1])
print(f"\n{passed}/{len(results)} passed")
sys.exit(0 if passed == len(results) else 1)
