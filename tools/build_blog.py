#!/usr/bin/env python3
"""Rebuild the TalkCX blog from content/blog/*.html.

Each source post is an HTML fragment (the article body) with a metadata block
at the top:

    <!--
    title: What happens to the calls your practice misses
    description: One or two sentences for Google and the blog index (max ~155 chars).
    date: 2026-11-23
    author: Barny Pinner
    -->
    <p>Body HTML...</p>

Run `python3 tools/build_blog.py` from the repo root. It writes:
  blog/<slug>.html   one full page per post (slug = source file name)
  blog/index.html    the list of posts, newest first
  sitemap.xml        every public page plus every post
Drafts live on a branch until approved; anything merged to main goes live.
"""
import datetime, html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://talkcx.co.uk"
BOOK = "https://calendar.app.google/L8kcdCoEQL7EJN2VA"
STATIC_PAGES = ["", "about.html", "pricing.html", "faq.html", "out-of-hours-ai-call-answering.html", "in-house-ai-receptionist.html", "connected-ai-booking-agent.html", "ai-readiness-assessment.html", "vendor-selection-rfp.html", "conversational-ai-design.html", "deployment-assurance.html", "polyai-reseller.html", "ongoing-support.html", "insights.html", "partners.html",
                "contact.html", "privacy.html", "terms.html"]  # msa/dpa stay unlisted

def head(title, description, canonical, extra=""):
    t, d = html.escape(title), html.escape(description)
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{t}</title>
<meta name="description" content="{d}" />
<link rel="canonical" href="{canonical}" />
<meta property="og:site_name" content="TalkCX" />
<meta property="og:title" content="{t}" />
<meta property="og:description" content="{d}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="{SITE}/assets/img/talkcx-logo.png" />
<meta name="twitter:card" content="summary" />
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml" />
<link rel="alternate" type="application/rss+xml" title="TalkCX Blog" href="{SITE}/blog/feed.xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=DM+Sans:wght@400;500;700;800;900&display=swap" />
<link rel="stylesheet" href="../assets/css/style.css" />
<script src="../assets/js/analytics.js" defer></script>
{extra}</head>
<body>

<header class="site-header">
  <div class="container nav-wrap">
    <a href="../index.html" class="logo"><img src="../assets/img/talkcx-logo.png" alt="TalkCX" class="logo-img" width="444" height="136" /></a>
    <nav class="primary-nav">
      <ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../about.html">About</a></li>
        <li><a href="../pricing.html">Pricing</a></li>
        <li><a href="../vendor-selection-rfp.html">RFP</a></li>
        <li><a href="../insights.html">Insights</a></li>
        <li><a href="./" class="active">Blog</a></li>
        <li><a href="../partners.html">Partners</a></li>
        <li><a href="../contact.html">Contact</a></li>
        <li class="nav-cta-item"><a href="{BOOK}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Book a call</a></li>
      </ul>
    </nav>
    <div class="nav-actions">
      <a href="{BOOK}" target="_blank" rel="noopener noreferrer" class="btn btn-primary header-cta">Book a call</a>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
    </div>
  </div>
</header>
"""

FOOT = f"""
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a href="../index.html" class="logo"><img src="../assets/img/talkcx-logo.png" alt="TalkCX" class="logo-img" width="444" height="136" /></a>
        <p style="margin-top:14px;max-width:320px;">Vendor-neutral contact centre AI consultancy. Official PolyAI reseller partner for the UK mid-market.</p>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="../about.html">About</a></li>
          <li><a href="../pricing.html#services">Services</a></li>
          <li><a href="../pricing.html">Pricing</a></li>
          <li><a href="../faq.html">FAQ</a></li>
          <li><a href="../insights.html">Insights</a></li>
          <li><a href="./">Blog</a></li>
          <li><a href="../partners.html">Partners</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="mailto:info@talkcx.co.uk">info@talkcx.co.uk</a></li>
          <li><a href="../contact.html">Contact page</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 TalkCX. All rights reserved.</span>
      <span class="footer-legal-links"><a href="../privacy.html">Privacy Policy</a> · <a href="../terms.html">Terms of Use</a> · <a href="#" data-cookie-settings>Cookie settings</a></span>
      <span>PolyAI and all partner names are trademarks of their respective owners.</span>
    </div>
  </div>
</footer>

<script src="../assets/js/main.js"></script>
</body>
</html>
"""

CTA = f"""
  <section class="container">
    <div class="cta-band reveal text-center">
      <h2>Want the honest read on your own phones?</h2>
      <p>A 30-minute call, no obligation. We'll tell you where AI would genuinely help, and where it wouldn't.</p>
      <a href="{BOOK}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Book a call</a>
    </div>
  </section>
"""

# Internal links shown under each post (SEO task 13). Keys are post slugs; "default" covers new posts.
PAGE_LINKS = {
    "pricing.html": "Contact Centre AI pricing and plans",
    "faq.html": "Contact Centre AI FAQ",
    "ai-readiness-assessment.html": "AI Readiness Assessment",
    "vendor-selection-rfp.html": "Vendor Selection and RFP",
    "conversational-ai-design.html": "Conversational AI Design",
    "out-of-hours-ai-call-answering.html": "Out of Hours AI call answering",
    "in-house-ai-receptionist.html": "In-House AI receptionist",
    "connected-ai-booking-agent.html": "Connected AI booking agent",
    "polyai-reseller.html": "PolyAI Reseller and Delivery",
    "partners.html": "Our partners",
    "contact.html": "Contact us",
}
RELATED = {
    "dental-practice-missed-calls": ["out-of-hours-ai-call-answering.html", "connected-ai-booking-agent.html", "pricing.html", "contact.html"],
    "questions-before-buying-ai-voice-agent": ["vendor-selection-rfp.html", "ai-readiness-assessment.html", "faq.html", "contact.html"],
    "small-contact-centre-voice-ai": ["ai-readiness-assessment.html", "pricing.html", "faq.html", "contact.html"],
    "talkcx-avant-partnership": ["partners.html", "vendor-selection-rfp.html", "pricing.html", "contact.html"],
    "default": ["pricing.html", "ai-readiness-assessment.html", "faq.html", "contact.html"],
}

def related_block(slug):
    links = RELATED.get(slug, RELATED["default"])
    items = "".join(f'<li><a href="../{u}">{PAGE_LINKS[u]} &rarr;</a></li>' for u in links)
    return f"""
  <section class="container blog-section">
    <div class="card post-related">
      <h2>Useful next steps</h2>
      <ul>{items}</ul>
    </div>
  </section>
"""

def nice_date(d):
    return f"{d.day} {d.strftime('%B %Y')}"

def load_posts():
    posts = []
    for src in sorted((ROOT / "content/blog").glob("*.html")):
        text = src.read_text()
        m = re.match(r"\s*<!--(.*?)-->", text, re.S)
        if not m:
            raise SystemExit(f"{src}: missing metadata block")
        meta = dict(line.split(":", 1) for line in m.group(1).strip().splitlines() if ":" in line)
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        for k in ("title", "description", "date"):
            if not meta.get(k):
                raise SystemExit(f"{src}: missing {k}")
        meta["date"] = datetime.date.fromisoformat(meta["date"])
        meta.setdefault("author", "Barny Pinner")
        meta["slug"] = src.stem
        meta["body"] = text[m.end():].strip()
        posts.append(meta)
    return sorted(posts, key=lambda p: p["date"], reverse=True)

def build_post(p):
    url = f"{SITE}/blog/{p['slug']}.html"
    ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"],
          "description": p["description"], "datePublished": p["date"].isoformat(),
          "author": {"@type": "Person", "name": p["author"]},
          "publisher": {"@type": "Organization", "name": "TalkCX", "url": SITE},
          "mainEntityOfPage": url}
    extra = ('<meta property="og:type" content="article" />\n'
             f'<meta property="article:published_time" content="{p["date"].isoformat()}" />\n'
             f'<script type="application/ld+json">{json.dumps(ld)}</script>\n')
    page = head(f"{p['title']} | TalkCX Blog", p["description"], url, extra)
    page += f"""
<main>
  <section class="page-hero container">
    <div class="eyebrow blue">Blog</div>
    <h1>{html.escape(p['title'])}</h1>
  </section>

  <section class="container blog-section">
    <article class="card post-body">
      <a href="./" class="post-back">← All posts</a>
      <p class="blog-meta">{nice_date(p['date'])} · {html.escape(p['author'])}</p>
{p['body']}
    </article>
  </section>
{related_block(p['slug'])}{CTA}</main>
{FOOT}"""
    (ROOT / "blog" / f"{p['slug']}.html").write_text(page)

def build_index(posts):
    url = f"{SITE}/blog/"
    page = head("Blog: TalkCX | Contact Centre AI and Voice AI for UK Businesses",
                "Practical, hype-free notes on Contact Centre AI, AI voice agents, AI call centres and missed calls, for UK contact centres and growing businesses.",
                url)
    if posts:
        cards = "\n".join(f"""      <a href="{p['slug']}.html" class="card blog-card">
        <p class="blog-meta">{nice_date(p['date'])}</p>
        <h2>{html.escape(p['title'])}</h2>
        <p>{html.escape(p['description'])}</p>
        <span class="read-more">Read the post →</span>
      </a>""" for p in posts)
        listing = f'    <div class="blog-list">\n{cards}\n    </div>'
    else:
        listing = '    <div class="blog-empty card"><p>The first post is on its way.</p></div>'
    page += f"""
<main>
  <section class="page-hero container">
    <div class="eyebrow blue">Blog</div>
    <h1>Straight talk on <span class="gradient-text blue">voice AI.</span></h1>
    <p>Practical notes for UK contact centres and anyone wondering what to do about the calls they can't answer. No hype, just what we see working.</p>
  </section>

  <section class="container blog-section">
{listing}
  </section>
{CTA}</main>
{FOOT}"""
    (ROOT / "blog/index.html").write_text(page)

def build_feed(posts):
    items = "".join(f"""
  <item>
    <title>{html.escape(p['title'])}</title>
    <link>{SITE}/blog/{p['slug']}.html</link>
    <guid>{SITE}/blog/{p['slug']}.html</guid>
    <pubDate>{datetime.datetime.combine(p['date'], datetime.time(8)).strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>
    <description>{html.escape(p['description'])}</description>
  </item>""" for p in posts)
    (ROOT / "blog/feed.xml").write_text(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>TalkCX Blog</title>
  <link>{SITE}/blog/</link>
  <description>Practical notes on voice AI and contact centre tech for UK businesses.</description>
  <language>en-gb</language>{items}
</channel>
</rss>
""")

def build_sitemap(posts):
    urls = [(f"{SITE}/{p}", None) for p in STATIC_PAGES]
    urls.append((f"{SITE}/blog/", posts[0]["date"] if posts else None))
    urls += [(f"{SITE}/blog/{p['slug']}.html", p["date"]) for p in posts]
    body = "".join(f"  <url><loc>{u}</loc>{f'<lastmod>{d.isoformat()}</lastmod>' if d else ''}</url>\n" for u, d in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n")

def _text(html_str):
    import html as _h
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html_str, flags=re.S)
    t = re.sub(r"<h[1-4][^>]*>(.*?)</h[1-4]>", lambda m: "\n### " + re.sub(r"<[^>]+>", "", m.group(1)) + "\n", t, flags=re.S)
    t = re.sub(r"<li[^>]*>", "\n- ", t)
    t = re.sub(r"</p>|<br\s*/?>", "\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = _h.unescape(t)
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n\s*\n+", "\n\n", t).strip()

def build_llms(posts):
    """llms.txt from content/llms.md, plus llms-full.txt with FAQ, page text and every post."""
    tmpl = (ROOT / "content/llms.md").read_text()
    lines = "\n".join(f"- [{p['title']}]({SITE}/blog/{p['slug']}.html): {p['description']}" for p in posts)
    short = tmpl.replace("{POSTS}", lines)
    (ROOT / "llms.txt").write_text(short)
    parts = [short.split("## Pages")[0].strip(), "\n## FAQ\n"]
    faq = (ROOT / "faq.html").read_text()
    for q, a in re.findall(r'<div class="card faq-item"><h3>(.*?)</h3><p>(.*?)</p></div>', faq):
        parts.append(f"Q: {_text(q)}\nA: {_text(a)}\n")
    for page in ["pricing.html", "ai-readiness-assessment.html", "vendor-selection-rfp.html", "conversational-ai-design.html",
                 "deployment-assurance.html", "polyai-reseller.html", "ongoing-support.html",
                 "out-of-hours-ai-call-answering.html", "in-house-ai-receptionist.html", "connected-ai-booking-agent.html"]:
        src = (ROOT / page).read_text()
        m = re.search(r"<main>(.*?)</main>", src, re.S)
        if m:
            parts.append(f"\n## Page: {SITE}/{page}\n\n" + _text(m.group(1)))
    for p in posts:
        parts.append(f"\n## Blog: {p['title']}\n{SITE}/blog/{p['slug']}.html ({p['date'].isoformat()})\n\n" + _text(p["body"]))
    (ROOT / "llms-full.txt").write_text("\n".join(parts).strip() + "\n")

if __name__ == "__main__":
    posts = load_posts()
    for p in posts:
        build_post(p)
    build_index(posts)
    build_feed(posts)
    build_sitemap(posts)
    build_llms(posts)
    print(f"Built {len(posts)} post(s): " + ", ".join(p["slug"] for p in posts))
