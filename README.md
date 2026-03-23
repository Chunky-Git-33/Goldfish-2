# Better Goldfishing V2.1

A solo Commander practice tool based on the Better Goldfishing V2.1 ruleset.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App structure and layout |
| `style.css` | All styling |
| `app.js` | All game logic |
| `manifest.json` | PWA install manifest |
| `sw.js` | Service worker — enables offline use |

---

## How to Deploy on GitHub Pages

### Step 1 — Create a GitHub repo
1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it `goldfishing` (or anything you like)
4. Set it to **Public**
5. Click **Create repository**

### Step 2 — Upload the files
1. On your new repo page click **Add file → Upload files**
2. Drag and drop all 5 files:
   - `index.html`
   - `style.css`
   - `app.js`
   - `manifest.json`
   - `sw.js`
3. Click **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to your repo **Settings** tab
2. Scroll down to **Pages** in the left sidebar
3. Under **Source** select **Deploy from a branch**
4. Set branch to **main** and folder to **/ (root)**
5. Click **Save**

### Step 4 — Access your app
After about 60 seconds your app will be live at:
```
https://YOUR-USERNAME.github.io/goldfishing/
```

---

## Install as a Phone App (PWA)

Once the site is live you can install it to your home screen:

**iPhone (Safari):**
1. Open the URL in Safari
2. Tap the Share button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

**Android (Chrome):**
1. Open the URL in Chrome
2. Tap the three-dot menu
3. Tap **Add to Home Screen** or **Install App**

Once installed it works fully offline.

---

## Icons

The app references `icon-192.png` and `icon-512.png` for the home screen icon.
You can create simple placeholder icons or use any image editor to make 192×192
and 512×512 PNG files and upload them to the repo. Without them the app still
works — you just won't have a custom home screen icon.
