# PostSearchLabs website

Static site for postsearchlabs.com (GitHub Pages). AI search visibility for B2B SaaS and AI startups only.

- `index.html`: home (hero video, shortlist test, deliverables, comparison table, first 30 days, pipeline model, attribution, fit check, FAQ)
- `scorecard.html`: free AI Shortlist Scorecard (12-question self-audit)
- `tools.js`: shortlist test, pipeline model, scorecard and the phone booking bar. Runs in the browser, sends nothing.
- `atlas.js`: scroll-driven signal map animation on the home page
- `local.html`, `startups.html`: redirects to the home page for old links

## Adding the video
Open `site.js` and paste a link inside `VIDEOS.home` (YouTube embed, Vimeo, Loom embed or a direct .mp4 link).

## Booking link
All "Book a call" buttons point to the Cal.com 30-minute event. The shortlist test and scorecard add the visitor's result to the booking notes.
