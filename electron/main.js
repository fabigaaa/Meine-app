const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Im Dev-Modus (kein dist-Ordner) laden wir von expo start --web
const isDev = !fs.existsSync(path.join(__dirname, '../dist'));

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Needed for local file:// assets
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Meine App',
    backgroundColor: '#0D1117',
    show: false,
    titleBarStyle: 'default',
  });

  if (isDev) {
    // Entwicklung: Expo Web Dev Server
    win.loadURL('http://localhost:8081');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Produktion: statischer Export aus dist/
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath);
  }

  // Fenster erst zeigen wenn Inhalt geladen ist (kein weißes Flackern)
  win.once('ready-to-show', () => {
    win.show();
  });

  // Externe Links im Standard-Browser öffnen
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  return win;
}

// ── Menü anpassen ────────────────────────────────────────────────────

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'Datei',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit', label: 'Beenden' },
      ],
    },
    {
      label: 'Bearbeiten',
      submenu: [
        { role: 'undo', label: 'Rückgängig' },
        { role: 'redo', label: 'Wiederholen' },
        { type: 'separator' },
        { role: 'cut', label: 'Ausschneiden' },
        { role: 'copy', label: 'Kopieren' },
        { role: 'paste', label: 'Einfügen' },
        { role: 'selectAll', label: 'Alles auswählen' },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'reload', label: 'Neu laden' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Originalgröße' },
        { role: 'zoomIn', label: 'Vergrößern' },
        { role: 'zoomOut', label: 'Verkleinern' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Vollbild' },
        ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools', label: 'Dev Tools' }] : []),
      ],
    },
    {
      label: 'Fenster',
      submenu: [
        { role: 'minimize', label: 'Minimieren' },
        { role: 'zoom', label: 'Maximieren' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── App-Lifecycle ────────────────────────────────────────────────────

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
