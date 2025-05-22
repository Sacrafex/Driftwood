const { app, BrowserWindow, ipcMain, session, dialog, Notification } = require('electron');
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
            enableRemoteModule: true,
            webgl: true
        }
    });

    session.defaultSession.clearCache().catch(() => {});
    session.defaultSession.clearStorageData().catch(() => {});

    mainWindow.loadFile('index.html');

    let closeAttempts = 0;
    mainWindow.on('close', (e) => {
        if (closeAttempts < 10) {
            e.preventDefault();
            dialog.showMessageBoxSync(mainWindow, {
                type: 'question',
                buttons: ['No', 'Yes'],
                defaultId: 0,
                cancelId: 0,
                title: 'Wait!',
                message: `Are you sure you want to close Driftwood? (${closeAttempts + 1}/10)`
            });
            closeAttempts++;
            if (closeAttempts >= 10) {
                mainWindow.destroy();
            }
        }
    });
}

ipcMain.on('create-tab', (event, url) => {
    if (mainWindow) {
        mainWindow.webContents.send('create-new-tab', url);
    }
});

app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true);
    });
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
