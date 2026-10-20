# MedTrace

MedTrace is a medicine-tracking demo built with React, Vite, and Tailwind CSS. Visitors can look up a medicine by serial number; the demo admin can review a medicine's history and add tracking events.

## Run locally

```sh
npm install
npm run dev
```

Use one of these sample serial numbers:

- `MT-2025-084291`
- `MT-2025-017536`
- `MT-2025-063804`

Demo admin credentials:

- Email: `admin@medtrace.com`
- Password: `admin123`

## Demo limitations

This project has no backend. The demo credentials are visible in the client application, so the login is not security protection. Medicine records are stored in the current browser's localStorage and are not shared or backed up. Do not use this demo for real accounts, patient information, or medicine-safety decisions. A production version needs server-side authentication, authorization, validated APIs, and a shared database.

## Checks

```sh
npm run build
npm run lint
```
