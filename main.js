
const { app, BrowserWindow } = require('electron')
const path = require('path')
const Menu = require('electron').Menu
const MenuItem = require('electron').MenuItem
const url = require('url')
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const globalShortcut = require('electron').globalShortcut
const fs = require('fs');
const shell = require('electron').shell

let win
var maximized = false;


function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 550,
        height: 400,
        frame: false,
        icon: __dirname + '/Nevis Logo.png',
        show: false,
        minHeight: 95,
        minWidth: 160
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

app.on('ready', function () {
    createWindow()

})

app.on('will-quit', function () {
    globalShortcut.unregisterAll()
})
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

ipc.on('open-course-file-dialog', function (event) {

    dialog.showOpenDialog({
        title: 'Nevis - Import Courses',

        filters: [
            { name: 'Nevis JSON', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    }, function (files) {
        if (files) event.sender.send('course-file', files)
    })
})

ipc.on('select-database', function (event) {

    dialog.showOpenDialog({
        title: 'Nevis - Select Database',
        icon: './nevis.ico',
        filters: [
            { name: 'Database', extensions: ['db'] },
            { name: 'JSON', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'promptToCreate']
    }, function (files) {
        if (files) event.sender.send('database-file', files)
    })
})
ipc.on('html-single-file-save', function (event) {

    dialog.showSaveDialog({
        title: 'Nevis - Save HTML results',
        icon: './nevis.ico',
        filters: [
            { name: 'HTML', extensions: ['html'] },
            { name: 'All Files', extensions: ['*'] }
        ],
    },
        function (file) {
            if (file) event.sender.send('html-file', file)
        })
})

var pdfData = ""
var pdfPath = ""

ipc.on('pdf-results-start', function (event, data) {

    pdfData = data
    dialog.showSaveDialog({
        title: 'Nevis - Save PDF results',
        icon: './nevis.ico',
        filters: [
            { name: 'PDF', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
        ],
    },
        function (file) {
            pdfPath = file
            let winPDF = new BrowserWindow({ width: 400, height: 320, frame: false, icon: __dirname + './Nevis Logo.png', show: false })
            winPDF.loadURL(path.join('file://', __dirname, '/pdf.html'))
            winPDF.on('close', function () { winPDF = null })

        })
})




ipc.on('pdf-window-ready', function (event, arg) {
    event.sender.send('pdf-contents', pdfData)


})

ipc.on('pdf-window-loaded', function (event, arg) {
    const winPDF = BrowserWindow.fromWebContents(event.sender)

    winPDF.webContents.printToPDF({
        'printBackground': true,
        'pageSize': 'A4'
    }, function (error, data) {
        if (error) throw error
        fs.writeFile(pdfPath, data, function (error) {
            if (error) {
                throw error
            }
            shell.openExternal('file://' + pdfPath)
            winPDF.close()
        })
    })

})
