# Dev Maktuporia Portfolio

Premium dark-gold personal portfolio website for **Dev Maktuporia**, a Computer Engineering student at SCET. The site includes a luxurious glassmorphism UI, animated particles, custom cursor and trail effects, project filters, a skill radar chart, PWA support, SEO metadata, and a Node.js + Express + SQLite contact backend.

## Folder Structure

```text
.
├── index.html
├── style.css
├── script.js
├── server.js
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── icon.svg
│   ├── og-image.svg
│   └── dev-maktuporia-resume.txt
├── data/
│   └── portfolio.db
├── package.json
└── README.md
```

## Features

- Dark gold visual identity with premium typography
- Fully responsive mobile-first layout
- Animated hero with stats counters and typing text
- Particle-style animated background
- Glassmorphism cards and glowing accents
- Skill radar chart
- Project filtering system
- Scroll progress indicator
- Back-to-top button
- Visitor counter
- Contact form with validation and anti-spam protection
- SQLite-backed message storage
- Admin endpoint for message retrieval
- PWA manifest and service worker
- SEO, Open Graph, and schema markup

## Prerequisites

- Node.js 18 or newer
- npm

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

Then open `http://localhost:3000`.

## API

### `POST /api/contact`

Saves a contact form submission to SQLite.

Expected JSON body:

```json
{
  "fullName": "Your Name",
  "email": "you@example.com",
  "subject": "Project Inquiry",
  "message": "Hello!",
  "company": "",
  "formStartedAt": 1710000000000
}
```

### `GET /api/admin/messages`

Returns stored messages.

Auth via header:

```bash
x-admin-token: dev-maktuporia-admin
```

Or query parameter:

```bash
/api/admin/messages?token=dev-maktuporia-admin
```

### `POST /api/visitor-count`

Increments the visitor counter.

### `GET /api/visitor-count`

Returns the current visitor count.

## Deployment Guide

1. Set `ADMIN_TOKEN` in your hosting environment.
2. Install dependencies with `npm install`.
3. Start the app with `node server.js` or your platform's start command.
4. Point your domain or hosting provider to the running server.
5. Ensure the `data/` directory is writable so SQLite can create `portfolio.db`.

## Notes

- The contact form stores messages in `data/portfolio.db`.
- The resume button downloads the included text resume placeholder.
- If you want a PDF resume later, replace `assets/dev-maktuporia-resume.txt` with a real PDF and keep the button target updated.
