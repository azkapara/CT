# Control Tower — protected deploy

A login page in front of the Manufacturing Control Tower dashboard. The password
is checked on the server, and the dashboard HTML is never published as a public
file, so there is no URL an outsider can open directly.

## What's in here

```
index.html        the login page (the only public page)
api/login.js      checks username + password, sets a signed session cookie
api/logout.js     clears the cookie
api/dashboard.js  serves the dashboard, but only to a valid session
api/_auth.js      shared helpers (cookie signing, safe comparison)
api/_page.js      GENERATED — the dashboard HTML baked into the function
src/dashboard.html  the dashboard you edit (never deployed)
build.js          copies src/dashboard.html into api/_page.js
vercel.json       maps /dashboard to the protected function
```

## Deploy

1. Push this folder to a GitHub repo, then import it on vercel.com (no framework,
   no build command needed). Or run `npx vercel` from this folder.

2. In Vercel: **Project → Settings → Environment Variables**, add three, for all
   environments (Production, Preview, Development):

   | Name | Value |
   |---|---|
   | `CT_USER` | the username you want |
   | `CT_PASS` | a long password you pick |
   | `SESSION_SECRET` | random string, 32+ characters |

   Generate the secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. Redeploy after adding the variables — Vercel only picks them up on a new build.

Visit the site: you get the login page. After signing in you land on `/dashboard`.
A "Sign out" button sits in the bottom-right corner of the dashboard.

## Updating the dashboard

Edit `src/dashboard.html`, then:

```bash
node build.js          # or: npm run embed
git add api/_page.js
git commit -am "update dashboard"
git push
```

`build.js` re-bakes the HTML into `api/_page.js`. If you skip it, the deployed
dashboard stays on the old version.

Two things this depends on:

- **`api/_page.js` must be committed.** It's generated, but it's the only copy
  that reaches Vercel. Don't add it to `.gitignore`.
- **Vercel must not run a build.** There's no `build` script in `package.json`,
  so Vercel skips the build step and just deploys `index.html` plus `api/`. If
  you ever see `Command "npm run build" exited with 1`, go to **Settings →
  Build & Deployment** and make sure the Build Command override is switched off.

## Why it is built this way

A login screen written only in browser JavaScript is decoration — anyone can read
the password in View Source, or skip the login and request the dashboard file
directly. Here:

- The password lives in Vercel's environment variables, never in the code.
- The session cookie is signed with HMAC-SHA256, so it can't be forged or edited.
- The cookie is `HttpOnly` + `Secure`, so page scripts can't read it.
- The dashboard HTML only exists inside the serverless function. There is no
  static file to guess the URL of.
- Sessions expire after 8 hours.

## Good to know

- This is one shared account. For per-person accounts you'd want a real user
  store — worth doing if this goes beyond you and a few stakeholders.
- There's no lockout after repeated wrong guesses, just a small delay. A long
  password (16+ characters) is what carries the weight here.
- If you're on a Vercel Pro plan, **Settings → Deployment Protection → Password
  Protection** does something similar with zero code. This version exists so you
  get a branded login page and it works on the free plan.
- Keep `CT_PASS` out of chat messages, screenshots and the repo.
