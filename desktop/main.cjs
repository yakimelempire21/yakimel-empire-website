// YAKIMEL OS — desktop app for Windows (Electron).
//
// Opens the live Command Center (yakimelempire.com/admin) in its own window,
// adds a tray icon, Windows notifications and "start with Windows". The app
// itself holds no business data: everything stays on the server, so updating
// the website updates the app.

const { app, BrowserWindow, Menu, Notification, Tray, nativeImage, session, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const SITE = process.env.YAKIMEL_OS_URL || "https://www.yakimelempire.com";
const START_URL = `${SITE}/admin`;
const ALLOWED_ORIGINS = new Set([new URL(SITE).origin, "https://www.yakimelempire.com", "https://yakimelempire.com"]);
const POLL_MS = 45_000;
const APP_ID = "com.yakimelempire.os";

let win = null;
let tray = null;
let quitting = false;
let unread = 0;
let lastCheck = null; // server timestamp of the last notification check

const statePath = () => path.join(app.getPath("userData"), "window-state.json");
const asset = (name) => path.join(__dirname, "build", name);

// ---------------------------------------------------------------------------
// Single instance: a second launch just brings the window back.
// ---------------------------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => showWindow());
}

app.setAppUserModelId(APP_ID); // needed for Windows notifications

function isAllowed(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? ALLOWED_ORIGINS.has(u.origin) : u.protocol === "file:" || u.origin === new URL(SITE).origin;
  } catch {
    return false;
  }
}

function openExternal(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:" || u.protocol === "tel:") {
      shell.openExternal(url);
    }
  } catch {
    /* ignore malformed links */
  }
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), "utf8"));
  } catch {
    return { width: 1440, height: 900, maximized: false };
  }
}

function saveState() {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getNormalBounds();
  try {
    fs.writeFileSync(statePath(), JSON.stringify({ ...bounds, maximized: win.isMaximized() }));
  } catch {
    /* not critical */
  }
}

function createWindow() {
  const state = loadState();
  win = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width || 1440,
    height: state.height || 900,
    minWidth: 1024,
    minHeight: 680,
    title: "YAKIMEL OS",
    icon: asset("icon.png"),
    backgroundColor: "#07080b",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  if (state.maximized) win.maximize();

  win.once("ready-to-show", () => win.show());
  win.on("resize", saveState);
  win.on("move", saveState);
  win.on("focus", () => win.flashFrame(false));

  // Closing the window keeps YAKIMEL OS running in the tray (for notifications).
  win.on("close", (event) => {
    if (quitting) return;
    event.preventDefault();
    win.hide();
    showTrayHintOnce();
  });

  const wc = win.webContents;

  // Only YAKIMEL OS pages open inside the app; everything else opens in the browser.
  wc.setWindowOpenHandler(({ url }) => {
    if (isAllowed(url) && /\/admin\/documents\/[^/]+\/download$/.test(new URL(url).pathname)) {
      wc.downloadURL(url); // uses the signed-in session; Windows asks where to save
    } else if (isAllowed(url) && new URL(url).pathname.startsWith("/admin")) {
      wc.loadURL(url);
    } else {
      openExternal(url);
    }
    return { action: "deny" };
  });
  const guard = (event, url) => {
    if (!isAllowed(url)) {
      event.preventDefault();
      openExternal(url);
    }
  };
  wc.on("will-navigate", guard);
  wc.on("will-redirect", guard);

  // No connection → friendly offline page with a retry button.
  wc.on("did-fail-load", (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3 /* aborted */) return;
    win.loadFile(path.join(__dirname, "offline.html"), { query: { retry: url || START_URL } });
  });

  wc.on("page-title-updated", (e) => {
    e.preventDefault();
    win.setTitle(unread ? `YAKIMEL OS (${unread})` : "YAKIMEL OS");
  });

  win.loadURL(START_URL);
}

function showWindow(url) {
  if (!win || win.isDestroyed()) createWindow();
  if (url) win.webContents.loadURL(url);
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

// ---------------------------------------------------------------------------
// Tray
// ---------------------------------------------------------------------------
let hintShown = false;
function showTrayHintOnce() {
  if (hintShown || !Notification.isSupported()) return;
  hintShown = true;
  new Notification({
    title: "YAKIMEL OS is still running",
    body: "It stays in the tray to notify you. Right-click the tray icon to quit.",
    icon: asset("icon.png"),
    silent: true,
  }).show();
}

function refreshTray() {
  if (!tray) return;
  tray.setToolTip(unread ? `YAKIMEL OS — ${unread} unread` : "YAKIMEL OS");
  const startsWithWindows = app.getLoginItemSettings().openAtLogin;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open YAKIMEL OS", click: () => showWindow() },
      {
        label: unread ? `Notifications (${unread})` : "Notifications",
        click: () => showWindow(`${SITE}/admin/notifications`),
      },
      { type: "separator" },
      {
        label: "Start with Windows",
        type: "checkbox",
        checked: startsWithWindows,
        click: (item) => {
          app.setLoginItemSettings({ openAtLogin: item.checked, args: ["--hidden"] });
          refreshTray();
        },
      },
      { type: "separator" },
      {
        label: "Quit YAKIMEL OS",
        click: () => {
          quitting = true;
          app.quit();
        },
      },
    ]),
  );
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(asset("tray.png")).resize({ width: 16, height: 16 }));
  tray.on("click", () => showWindow());
  refreshTray();
}

// ---------------------------------------------------------------------------
// Windows notifications: ask the server for new unread notifications.
// Uses the same sign-in cookie as the window, so nothing extra to log into.
// ---------------------------------------------------------------------------
async function checkNotifications() {
  try {
    const url = new URL(`${SITE}/api/admin/notifications`);
    if (lastCheck) url.searchParams.set("after", lastCheck);
    const res = await session.defaultSession.fetch(url.toString(), { cache: "no-store", credentials: "include" });
    if (!res.ok) return; // signed out or offline — try again later
    const data = await res.json();

    if (lastCheck && Notification.isSupported()) {
      for (const item of [...data.items].reverse()) {
        const n = new Notification({
          title: item.title,
          body: item.body || "",
          icon: asset("icon.png"),
        });
        n.on("click", () => showWindow(item.href && item.href.startsWith("/admin") ? `${SITE}${item.href}` : `${SITE}/admin/notifications`));
        n.show();
      }
      if (data.items.length && win && !win.isFocused()) win.flashFrame(true);
    }

    lastCheck = data.now;
    if (data.unread !== unread) {
      unread = data.unread;
      refreshTray();
      if (win && !win.isDestroyed()) win.setTitle(unread ? `YAKIMEL OS (${unread})` : "YAKIMEL OS");
    }
  } catch {
    /* offline — next poll will retry */
  }
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------
app.whenReady().then(() => {
  // The site never needs camera, microphone, location, etc.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, done) => {
    done(permission === "clipboard-sanitized-write" || permission === "fullscreen");
  });

  // Keep the usual shortcuts (reload, zoom, copy/paste) without showing a menu bar.
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { label: "Edit", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
      {
        label: "View",
        submenu: [
          { role: "reload" },
          { role: "forceReload" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
          { role: "toggleDevTools", visible: !app.isPackaged },
        ],
      },
    ]),
  );

  createTray();
  createWindow();
  if (process.argv.includes("--hidden")) win.hide(); // started with Windows → stay in the tray

  checkNotifications();
  setInterval(checkNotifications, POLL_MS);
});

app.on("before-quit", () => {
  quitting = true;
  saveState();
});

// Stay alive in the tray when the window is closed.
app.on("window-all-closed", (e) => e.preventDefault());
