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
import { open, openFiles, getFileObj } from './apis/files'
import { enterFullscreen, sendToWindow } from './apis/function'
import controls from './apis/controls'
import fs from 'fs'
import path from 'path'
import moment from 'moment'

const tempFolder = path.join(__dirname, 'public')

//ffmpeg
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

//gen thumbnail
async function genThumb (file) {
  const filename = `${path.basename(file).split('.')[0]}.png`.replaceAll('%', '')
  const result = fs.existsSync(path.join(tempFolder, filename))
  if (result) {
    status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
    sendToWindow('status', status)
  } else {
    ffmpeg(file)
      .on('end', () => {
        status.thumbnail = `http://localhost:8089/static/${encodeURIComponent(filename)}`
        sendToWindow('status', status)
      })
      .screenshot({
        timestamps: ['00:00:02'],
        filename: filename,
        folder: path.join(__dirname, 'public'),
        size: '640x360'
      })
  }
}

// ond file delete
function oldFileDelete () {
  const files = fs.readdirSync(tempFolder)
  files.forEach(file => {
    const fileState = fs.statSync(path.join(tempFolder, file))
    const relative = moment(fileState.ctime)
    const now = moment().subtract(1, 'weeks')
    if (relative < now) {
      fs.unlinkSync(file)
    }
  })
}

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
            genThumb(status.file.file)
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
          click () { enterFullscreen(mainWindow) }
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
  switch (control.control) {
    case 'next':
      playlist.itemIdx = playlist.itemIdx + 1
      if (playlist.items.length <= playlist.itemIdx) {
        if (!status.loopAll) {
          status.playBtn = false
          sendToWindow('status', status)
        }
        playlist.itemIdx = 0
      }
      status.file = getFileObj(playlist.items[playlist.itemIdx].file)
      mainWindow.webContents.send('file', status.file)
      genThumb(status.file.file)
      break
    case 'previous':
      playlist.itemIdx = playlist.itemIdx - 1
      if (playlist.itemIdx < 0) {
        playlist.itemIdx = playlist.items.length - 1
      }
      status.file = getFileObj(playlist.items[playlist.itemIdx].file)
      mainWindow.webContents.send('file', status.file)
      genThumb(status.file.file)
      break
    case 'itemIdx':
      playlist.itemIdx = control.value
      status.file = getFileObj(playlist.items[control.value].file)
      mainWindow.webContents.send('file', status.file)
      status.isPlaying = false
      genThumb(status.file.file)
      break
    case 'listIdx':
      playlist.listIdx = control.value
      playlist.currListName = playlist.list[control.value].name
      playlist.itemIdx = null
      break
    case 'getItems': {
      const files = await openFiles()
      await db.addListItems(playlist.currListName, files)
      break
    }
    case 'addList':
      await db.addList(control.value)
      break
    case 'delItem':
      await db.delListItem(control.value)
      break
    case 'delItems':
      await db.delListItems(playlist.currListName)
      break
    case 'delList':
      await db.delList(control.value)
      break
    case 'delAll':
      await db.delAll()
      break
  }
  playlist.list = await db.getList()
  playlist.items = await db.getListItems(playlist.currListName)
  sendToWindow('playlist', playlist)
})

ipcMain.on('control', async (event, control) => {
  status = await controls(control, status, mainWindow)
  // mainWindow.webContents.send('getControl', control)
  sendToWindow('status', status)
})

server.listen(8089)
