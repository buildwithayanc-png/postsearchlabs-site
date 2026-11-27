# PostSearchLabs website

Static site for postsearchlabs.com (GitHub Pages). AI search visibility for B2B SaaS and AI startups only.

Links use clean URLs (`/tools`, not `tools.html`). GitHub Pages serves `tools.html` at `/tools` automatically, and the old `.html` addresses still work; each page's canonical tag points to the clean URL.

- `index.html`: home, kept short: hero, signal map, the numbers, what you get, how it works, an Explore grid and the final call to action
- `services.html`: outcomes, deliverables, how it works with the first 30 days, comparison table, how we measure, fit check, promise
- `tools.html`: free shortlist test and pipeline calculator
- `why.html`: what changed, what it costs, the numbers
- `faq.html`: FAQ, with the FAQ schema
- `scorecard.html`: free AI Shortlist Scorecard (12-question self-audit)
- `about.html`: who we are, founder, contact
- `privacy.html`, `terms.html`, `cookies.html`: legal pages
- `tools.js`: shortlist test, pipeline model, scorecard and the phone booking bar. Runs in the browser, sends nothing.
- `atlas.js`: scroll-driven signal map animation on the home page
- `consent.js`: cookie banner (see below)
- `local.html`, `startups.html`: redirects to the home page for old links

## Open TODOs
Search the HTML files for `TODO(Ayan)`. Each one marks something only the founder can supply: photo, LinkedIn URL, short bio, legal entity and address, payment and termination terms, and a legal review of `terms.html`.

## Logo
The logo is the wordmark alone, in Lexend Bold: "PostSearch" in the text colour and "Labs" in blue (`.brand__name` in the header and footer of every page). `og-image.png` carries the same wordmark. The P mark is used only as the icon: `favicon.ico`, `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` (orange, on a transparent or white background) and `logo.png` (blue, used in the schema). When you replace an icon file, raise the `?v=` number on the icon links in every page, because browsers keep favicons for a long time.

## Header and footer
Every page has the same header and footer. If you change one, change it on all eleven pages (`index`, `services`, `tools`, `why`, `faq`, `about`, `scorecard`, `privacy`, `terms`, `cookies`, `404`). `404.html` uses links that start with `/`.

## Contact email
No contact email is shown yet, because the domain has no mailbox. Once one works, add it back to the footer (Company column) of all seven pages, the home page final call to action, the About, Privacy and Terms pages, the schema in `index.html` and `about.html` (`"email"`), and `llms.txt`.

## Changing the design
After editing `styles.css`, change the `?v=` number on the stylesheet link in every page (for example `styles.css?v=20261201`). Browsers keep the old file for 10 minutes otherwise.

## Adding a video
The hero video block was removed until there is a real video. `site.js` still supports one: add a `<div class="video" data-video="home">` block back to the hero (see the git history of `index.html`) and paste the link into `VIDEOS.home` in `site.js` (YouTube embed, Vimeo, Loom embed or a direct .mp4 link).

## Menu
The ☰ button opens the full menu at every screen width. Links are grouped under Services, Free tools, Learn and Company (`.nav__group` inside `.nav__links`). Every page has the same menu, so add a new link on all eleven pages. `site.js` still contains tab code (`data-tabs`), which no page uses right now.

## Day / night mode
`theme.js` runs in the `<head>` of every page. The site follows the visitor's device setting until they click the toggle (the sun/moon button in the header, or the "Night mode" row in the phone menu). Their choice is saved in the browser as `psl_theme`. Any element with `data-theme-toggle` works as a toggle. Dark colours live in `styles.css` under `:root[data-theme="dark"]`.

## Booking link
All "Book a call" buttons point to the Cal.com 30-minute event. The shortlist test and scorecard add the visitor's result to the booking notes.

## Cookie banner
`consent.js` shows the cookie banner (Accept all / Reject all / Customize) and remembers the choice for 6 months in the `psl_consent` cookie. Every page loads it in the `<head>`, and the "Cookie settings" link in each footer reopens it.

To add a tracking tool, paste its ID into `CONSENT_TOOLS` at the top of `consent.js` (Google Analytics 4, Microsoft Clarity, LinkedIn Insight Tag or Meta Pixel), then raise `CONSENT_VERSION` by 1 so visitors are asked again. The tool loads only after the visitor allows its category. `cookies.html` lists only the tools that have an ID. Name the provider in `privacy.html` too.

For any other script, write it as `<script type="text/plain" data-consent="analytics" src="..."></script>` (or `data-consent="marketing"`). It runs only after consent.
