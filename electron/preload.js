// Preload-Skript läuft in einem isolierten Kontext.
// Hier könnten später sichere IPC-Brücken zur Node-API gebaut werden.
window.addEventListener('DOMContentLoaded', () => {
  // App-Version aus Electron-Prozess ins Fenster injizieren (optional)
  const { ipcRenderer } = require('electron');
});
