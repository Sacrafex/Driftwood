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

    mainWindow.webContents.on('before-input-event', (event, input) => {
        if ((input.control || input.meta) && input.key.toLowerCase() === 'q') {
            const notification2 = new Notification({
                    title: 'Driftwood',
                    body: 'Cheater. Who told you about Ctrl+Q? You can just use the close button.',
                });
                notification2.show();
            mainWindow.destroy();
        }
    });

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
            if (closeAttempts === 10) {
                const notification = new Notification({
                    title: 'Driftwood',
                    body: 'You have attempted to close Driftwood 10 times. Next time you can just use Ctrl+Q.',
                });
                notification.show();
            } else {
                const notification2 = new Notification({
                    title: 'Driftwood',
                    body: 'Good work, keep going! '+closeAttempts+' so far.',
                });
                notification2.show();
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
