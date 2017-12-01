
const { app, BrowserWindow } = require('electron')
const path = require('path')
const Menu = require('electron').Menu
const MenuItem = require('electron').MenuItem
const url = require('url')
const ipc = require('electron').ipcMain

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var maximized = false;


function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 450,

        height: 400,
        frame: false,
        icon: __dirname + '/Nevis Logo.png',
        show: false,
    })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.


        win = null
    })
    win.on('resize', () => {
        win.webContents.send('resize', win.getSize())
    })
    win.on('ready-to-show', function () {
        win.show();
        win.webContents.send('resize', win.getSize())
        win.focus();
    });


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }

})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

var template = [{
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
},
{
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
},
{
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
}]
const ContextMenu = Menu.buildFromTemplate(template)
app.on('browser-window-created', function (event, win) {
    win.webContents.on('context-menu', function (e, params) {
        ContextMenu.popup(win, params.x, params.y)
    })
})

ipc.on('window', function (event, arg) {
    if (arg == 'maximize') {

        if (maximized == false) {
            win.maximize();
            maximized = true;
            event.sender.send('window', 'maximized')
        }
        else {
            win.unmaximize();
            maximized = false;
            event.sender.send('window', 'minimized')
        }

    }
    else if (arg == 'minimize') {
        win.minimize()
    }


})
ipc.on('resize', function (event, arg) {
    event.sender.send('resize', win.getSize())
})