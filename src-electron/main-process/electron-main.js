import { app, BrowserWindow, nativeTheme, Menu, ipcMain } from 'electron'
import db from './apis/db'

let status = {
  isPlaying: false,
  mode: 'normal',
  currentList: '',
  currentListFile: null,
  file: null,
  duration: 0,
  currentTime: 0,
  loop: false,
  loopAll: false,
  fullscreen: false,
  mute: false,
  volume: 100,
  playBtn: false,
  thumbnail: ''
}

let playlist = {
  list: [],
  items: [],
  listIdx: 0,
  itemIdx: 0,
  currListName: ''
}

import server from './web'
import { open, oldFileDelete } from './apis/files'
import { enterFullscreen, sendToWindow } from './apis/function'
import controls from './apis/controls'
import playlistPrc from './apis/playlist'
import genThumb from './apis/thunbnail'
import tcp from './apis/socket'

tcp.read(12303, (res) => {
  tcp.write(res)
})

tcp.read(9988, (res) => {
  tcp.write(res)
})

oldFileDelete()

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow
let controlWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  mainWindow.loadURL(process.env.APP_URL)
  mainWindow.on('closed', () => { app.quit() })
  mainWindow.on('enter-full-screen', () => {
    mainWindow.setMenuBarVisibility(false)
    status.fullscreen = true
    sendToWindow(controlWindow, status)
  })
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setMenuBarVisibility(true)
    status.fullscreen = false
    sendToWindow(controlWindow, status)
  })
  console.log(mainWindow.id)
}

function createControlWindow () {
  if (!controlWindow) {
    controlWindow = new BrowserWindow({
      width: 1000,
      height: 600,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    })
    controlWindow.on('ready-to-show', () => {
      ipcMain.on('time', (event, time) => {
        if (controlWindow) {
          controlWindow.webContents.send('time', time)
        }
        status.currentTime = time
      })
    })
  }
  controlWindow.loadURL(process.env.APP_URL + '/#/control')
  // controlWindow.setMenu(null)
  controlWindow.on('closed', () => {
    controlWindow = null
  })
  console.log(controlWindow.id)
}

Menu.setApplicationMenu(
  Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'CommandOrControl+O',
          async click () {
            status.file = await open(mainWindow)
            status = await genThumb(status)
          }
        },
        {
          label: 'OpenControlWindow',
          accelerator: 'F4',
          click () { createControlWindow() }
        },
        {
          label: 'Exit',
          accelerator: 'CommandOrControl+F4',
          click () { app.quit() }
        }
      ]
    },
    {
      label: 'Function',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click () { status.fullscreen = enterFullscreen() }
        },
        { role: 'toggleDevTools' }
      ]
    }
  ])
)

app.on('ready', async () => {
  await createWindow()
  playlist.list = await db.getList()
  playlist.currListName = playlist.list[0].name
  playlist.items = await db.getListItems(playlist.currListName)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('getStatus', (event) => { event.returnValue = status })
ipcMain.on('getPlaylist', (event) => { event.returnValue = playlist })

ipcMain.on('playlist', async (event, control) => {
  console.log(control)
  playlist = await playlistPrc(control, status, playlist, mainWindow, controlWindow)
  sendToWindow('playlist', playlist)
})

ipcMain.on('control', async (event, control) => {
  status = await controls(control, status, playlist, mainWindow, controlWindow)
  // mainWindow.webContents.send('getControl', control)
  sendToWindow('status', status)
})

server.listen(8089)
