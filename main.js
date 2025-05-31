const { app, BrowserWindow, ipcMain, session, dialog, Notification } = require('electron');
const path = require('path');

let mainWindow;
let startTime = Date.now();

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

    mainWindow.loadFile('index.html');

    session.defaultSession.clearCache().catch(() => {});
    session.defaultSession.clearStorageData().catch(() => {});

    mainWindow.webContents.on('input-event', (event, input) => {
        if ((input.control || input.meta) && input.key.toLowerCase() === 'q') {
            forceClose();
        }
    });

    ipcMain.webContents?.on?.('input-event', (event, input) => {
        if ((input.control || input.meta) && input.key.toLowerCase() === 'q') {
            forceClose();
        }
    });

    function forceClose() {
        mainWindow.destroy();
        new Notification({
            title: 'Driftwood',
            body: 'Cheater. Who told you about Ctrl+Q? Just click the dang button.'
        }).show();
    }

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
            const message = closeAttempts === 10
                ? 'You tried 10 times. Next time use Ctrl+Q.'
                : `Good work, keep going! ${closeAttempts} so far.`;
            new Notification({ title: 'Driftwood', body: message }).show();
        }
    });

    setInterval(() => {
        const minutes = Math.floor((Date.now() - startTime) / 60000);
        new Notification({
            title: 'Touch Grass Alert',
            body: `You've been browsing for ${minutes} minutes. Grass is missing you.`
        }).show();
    }, 30 * 60 * 1000);

    setInterval(() => {
        const colors = ['pink', 'blue', 'green', 'orange', 'gray', 'red', 'purple'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        mainWindow.webContents.send('change-theme-color', color);
    }, 60 * 1000);

    setInterval(() => {
        new Notification({
            title: 'Procrastinometer',
            body: 'Wow. Still here. Truly inspirational levels of doing nothing.'
        }).show();
    }, 10 * 60 * 1000);

    setTimeout(() => {
        new Notification({
            title: 'Brain Battery Low',
            body: 'You’ve been here 2 hours. Touch sunlight immediately.'
        }).show();
    }, 2 * 60 * 60 * 1000);

    setTimeout(() => {
        mainWindow.webContents.executeJavaScript(`
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'black';
            overlay.style.opacity = 0.9;
            overlay.style.zIndex = 999999;
            overlay.style.color = 'white';
            overlay.style.fontSize = '32px';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.innerText = 'Intervention time. Go outside.';
            document.body.appendChild(overlay);
        `);
    }, 3 * 60 * 60 * 1000);
}

ipcMain.on('create-tab', (event, url) => {
    if (mainWindow) {
        mainWindow.webContents.send('create-new-tab', url);
    }
});

// Planning to add support for WebLLM in the future to add customized messages and features

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