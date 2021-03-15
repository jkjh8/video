import { app, nativeTheme, ipcMain } from 'electron'
import { createMainWindow } from './apis/windows'
import server from './web'
import { oldFileDelete } from './apis/files'
import controls from './apis/controls'
import tcp from './apis/socket'
import db from './apis/db'
import fs from 'fs'

require('./apis/menu')

let status = {
  mode: 'noaml',
  autoplay: false,
  isPlaying: false,
  file: null,
  duration: 0,
  currentTime: 0,
  loop: false,
  loopAll: false,
  fullscreen: false,
  mute: false,
  volume: 100,
  playBtn: false,
  thumbnail: '',
  list: [],
  items: [],
  listIdx: 0,
  itemIdx: 0,
  currListName: ''
}

const windows = {
  mainWindow: null,
  mainWindowId: null,
  controlWindow: null,
  controlWindowId: null,
  apiWindow: null
}

global.status = status
global.windows = windows

tcp.read(1339, async (res) => {
  const comm = res.toString().split(',')
  const contr = {
    control: comm[0],
    value: comm[1],
    value2: comm[2]
  }
  console.log(contr)
  switch (contr.control) {
    case 'play':
      if (status.file) {
        if (!status.isPlaying) {
          status = await controls(contr, status, tcp)
        } else {
          tcp.write('err,isplaying')
        }
      } else {
        tcp.write('err,none_file')
      }
      break
    case 'pause':
      status = await controls(contr, status, tcp)
      break
    case 'cl':
      status = await controls({ control: 'listIdx', value: Number(contr.value) }, status, tcp)
      break
    case 'ci':
      status = await controls({ control: 'itemIdx', value: Number(contr.value) }, status, tcp)
      break
    case 'pf':
      if (await fs.existsSync(contr.value)) {
        status.autoplay = true
        status = await controls({ control: 'openFile', value: contr.value }, status, tcp)
        // status = await controls({ control: 'play' }, status, tcp)
      }
      break
    case 'pp':
      status = await controls({ control: 'listIdx', value: Number(contr.value) }, status, tcp)
      status.autoplay = true
      status = await controls({ control: 'itemIdxTcp', value: Number(contr.value2) }, status, tcp)
      break
    default:
      status = await controls(contr, status, tcp)
      break
  }
})

oldFileDelete()

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

if (process.env.PROD) {
  global.__statics = __dirname
}

app.on('ready', async () => {
  await createMainWindow()
  db.refreshDb(status, true)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (windows.mainWindow === null) {
    createMainWindow()
  }
})

ipcMain.on('getStatus', (event) => { event.returnValue = status })

ipcMain.on('control', async (event, control) => {
  status = await controls(control, status, tcp)
})

server.listen(8089)
