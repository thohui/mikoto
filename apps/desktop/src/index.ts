import { app, BrowserWindow } from 'electron';
import path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
import('electron-squirrel-startup').then((electronSquirrelStartup) => {
  if (electronSquirrelStartup && electronSquirrelStartup.default) {
    app.quit();
  }
});

let mainWindow: BrowserWindow | undefined;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Mikoto',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },

    icon: path.join(__dirname, '../assets/icon.ico'),

    frame: false,
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL('https://alpha.mikoto.io/');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const appLock = app.requestSingleInstanceLock();

if (!appLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on('ready', createWindow);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.