const { app, BrowserWindow, ipcMain, session, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
                                   webPreferences: {
                                       nodeIntegration: true,
                                   contextIsolation: false,
                                   webviewTag: true,
                                   allowRunningInsecureContent: true,
                                   webSecurity: false,
                                   enableRemoteModule: true
                                   }
    });

    session.defaultSession.clearCache().catch(() => {});
    session.defaultSession.clearStorageData().catch(() => {});

    mainWindow.loadFile('index.html');

    setTimeout(() => {
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Yes'],
                title: 'Resource Warning',
                message: 'Program taking up too much resources. Terminate?',
            }).then(() => {
                app.exit();
            });
        }
    }, 150000000);
}

ipcMain.on('create-tab', (event, url) => {
    if (mainWindow) {
        mainWindow.webContents.send('create-new-tab', url);
    }
});

app.whenReady().then(createWindow);

// For the losers that use mac if I decide to export it
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
