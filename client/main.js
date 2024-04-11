const { app, BrowserWindow } = require('electron');

let appWindow;

function initWindow() {
    appWindow = new BrowserWindow({
        // fullscreen: true,
        height: 1080,
        width: 1920,
        webPreferences: {
            nodeIntegration: true,
        },
        icon: './src/assets/gros-ratata.bmp',
    });

    // Electron Build Path
    const path = `file://${__dirname}/dist/client/index.html`;
    appWindow.loadURL(path);

    appWindow.setMenuBarVisibility(false);

    // Disable zoom shortcuts
    appWindow.webContents.on('did-finish-load', () => {
        appWindow.webContents.setZoomFactor(1.0); // Disables zoom
        const js = `
                    document.addEventListener('keydown', (e) => {
                        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
                            e.preventDefault();
                        }
                    });
                    document.addEventListener('wheel', (e) => {
                        if (e.ctrlKey || e.metaKey) {
                            e.preventDefault();
                        }
                    }, { passive: false });
`;
        appWindow.webContents.executeJavaScript(js);
    });

    // Initialize the DevTools.
    // appWindow.webContents.openDevTools()

    appWindow.on('closed', function () {
        appWindow = null;
    });
}

app.on('ready', initWindow);

// Close when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (appWindow === null) {
        initWindow();
    }
});
