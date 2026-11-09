# YAKIMEL OS — Windows desktop app

A Windows app that opens the YAKIMEL OS Command Center (`yakimelempire.com/admin`) in its own window.

- Shows Windows notifications for new website requests, tasks, tickets and payments.
- Stays in the system tray (bottom-right, next to the clock) when you close the window, so notifications keep arriving. Right-click the tray icon → **Quit** to close it completely.
- Can start with Windows: right-click the tray icon → **Start with Windows**.
- Shows an offline screen and reconnects on its own when the internet drops.
- Stores no business data on the computer; everything stays on the server. Updating the website updates the app; you only need a new installer if this folder changes.

## Installing it on a computer

1. Copy `dist/YAKIMEL-OS-Setup-1.0.1.exe` to the computer (USB, Google Drive, email…).
2. Run it. The installer isn't code-signed yet, so Windows may show **"Windows protected your PC"**. Click **More info → Run anyway**.
3. Sign in with your YAKIMEL OS email and password.

## Building a new installer (only when this folder changes)

On Windows, from this `desktop` folder:

```
npm install
npm run dist
```

The installer is created in `desktop/dist/`. Before rebuilding, raise `version` in `package.json` (for example 1.0.1).

## Code signing (optional, later)

A code-signing certificate (from about $200/year) removes the "Windows protected your PC" warning. Once you have one, add it to the `win` section of `package.json`.
