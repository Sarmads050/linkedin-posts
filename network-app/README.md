# Network Daily

Mobile web app (installable PWA) for Sarmad Ali's daily LinkedIn networking.
It opens ready-made LinkedIn people searches (4 per day, rotating), tracks requests sent
and keeps the weekly total under a safe limit. It never sends anything by itself:
every Connect is tapped by hand inside LinkedIn.

## Deploy on Netlify
- Add new site → Import from Git → GitHub → `Sarmads050/linkedin-posts`
- Branch to deploy: `posts`
- Base directory: `network-app`
- Build command: (empty) · Publish directory: `network-app`

Progress is stored in the phone's browser (localStorage). Use Settings → Backup before changing phones.
