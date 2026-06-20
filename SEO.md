# SEO & Search Engine Optimization Guide

This document outlines the SEO implementation for shobhit.org.

---

## Target Keywords

### Primary Keywords
- **Shobhit** — Main target
- **Shobhit meaning** — High intent
- **What does Shobhit mean** — Question-based
- **Shobhit name meaning** — Long-tail

### Secondary Keywords
- शोभित (Hindi)
- Shobhit origin
- Shobhit Sanskrit
- Shobhit pronunciation
- Indian boy names meaning

### Long-tail Keywords
- What does the name Shobhit mean in Sanskrit
- Shobhit name meaning and origin
- How to pronounce Shobhit
- Famous people named Shobhit

---

## Technical SEO Implementation

### Meta Tags (All Pages)

Every page includes:
- `<title>` — Unique, keyword-rich, under 60 characters
- `<meta name="description">` — Compelling, 150-160 characters
- `<meta name="keywords">` — Relevant keywords
- `<meta name="robots">` — index, follow
- `<link rel="canonical">` — Prevents duplicate content

### Open Graph Tags

For social sharing (Facebook, LinkedIn):
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://shobhit.org/" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://shobhit.org/assets/og-image.png" />
```

### Twitter Cards

For Twitter/X sharing:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

### Structured Data (JSON-LD)

#### Homepage
- `WebSite` schema with search action
- `Organization` schema
- `WebPage` schema
- `FAQPage` schema with common questions

#### Name Page
- `Article` schema
- `Thing` schema describing "Shobhit"

#### Map Page
- `Map` schema

---

## Files Created

| File | Purpose |
|------|---------|
| `sitemap.xml` | Lists all pages for search engines |
| `robots.txt` | Crawler instructions |
| `llms.txt` | AI/LLM-specific information |
| `.well-known/security.txt` | Security contact info |
| `assets/og-image.svg` | Social share image |

---

## Sitemap

Located at `/sitemap.xml`, includes:
- Homepage (priority 1.0)
- Map page (priority 0.9, daily updates)
- Name page (priority 0.9, key content)
- Quotes page (priority 0.7)
- Play page (priority 0.6)

Submit to:
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

## robots.txt

```
User-agent: *
Allow: /
Sitemap: https://shobhit.org/sitemap.xml
Disallow: /api/
Disallow: /data/
```

AI crawlers (GPTBot, Claude, etc.) are explicitly allowed.

---

## AI Bot Optimization (llms.txt)

The `/llms.txt` file provides structured information for AI language models:
- Name meaning and etymology
- Pronunciation guide
- Site features overview
- Key facts for AI responses

This helps when users ask AI assistants "What does Shobhit mean?" — the AI can reference our authoritative content.

---

## Content SEO

### Name Page (/name.html)

Added comprehensive article content:
- **H2**: "What Does Shobhit Mean?"
- **H3**: Etymology & Origin
- **H3**: Pronunciation Guide
- **H3**: Cultural Significance
- **H3**: Variations & Spellings
- **H3**: Numerology

This semantic structure helps search engines understand the page's topical authority.

### Homepage

Includes FAQ schema answering:
1. What does the name Shobhit mean?
2. What is the origin of the name Shobhit?
3. How do you pronounce Shobhit?
4. What is shobhit.org?

---

## Performance Considerations

SEO-friendly practices:
- **Fast loading** — No heavy frameworks
- **Mobile-responsive** — Works on all devices
- **Semantic HTML** — Proper heading hierarchy
- **Image optimization** — SVG where possible
- **Core Web Vitals** — Minimal layout shift

---

## Monitoring & Tools

### Recommended Setup

1. **Google Search Console**
   - Submit sitemap
   - Monitor indexing
   - Check for errors

2. **Google Analytics** (optional)
   - Track traffic sources
   - Monitor user behavior

3. **Bing Webmaster Tools**
   - Submit sitemap
   - Reach Bing/DuckDuckGo users

### Testing Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

---

## Checklist

- [x] Unique title tags per page
- [x] Meta descriptions under 160 chars
- [x] Canonical URLs
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] JSON-LD structured data
- [x] sitemap.xml created
- [x] robots.txt created
- [x] llms.txt for AI bots
- [x] Semantic HTML (h1, h2, h3 hierarchy)
- [x] Alt text on images
- [x] Mobile responsive
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Generate PNG version of og-image.svg
- [ ] Monitor rankings for target keywords

---

## Next Steps

1. **Convert og-image.svg to PNG** (1200x630px) for better social compatibility
2. **Submit sitemap** to search engines
3. **Build backlinks** from relevant sites
4. **Monitor** rankings for "Shobhit meaning" queries
5. **Create additional content** targeting long-tail keywords

---

*Last updated: June 2026*
