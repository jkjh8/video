import { app, BrowserWindow, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import moment from 'moment'

const tempFolder = path.join(app.getPath('userData'), 'tmp')

function filePath (file) {
  const filepath = path.parse(file)
  const ext = filepath.ext.split('.').pop()
  return { file: file, type: `video/${ext}` }
}

export const getFileObj = function (file) {
  return filePath(file)
}

export const open = async function (win) {
  const openFile = await dialog.showOpenDialogSync({
    filters: [
      {
        name: 'Video',
        extensions: ['mp4', 'mov', 'avi', 'webm', 'mkv']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ],
    properties: ['openFile']
  })
  if (openFile && openFile.length > 0) {
    const file = filePath(openFile[0])
    const windows = BrowserWindow.getAllWindows()
    windows.forEach(window => {
      window.webContents.send('file', file)
    })
    return file
  }
}

export const clear = async function () {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(window => {
    window.webContents.send('file', null)
  })
  return null
}

export const openFiles = async function (win) {
  return await dialog.showOpenDialogSync({
    filters: [
      {
        name: 'Video',
        extensions: ['mp4', 'avi', 'webm', 'mkv', 'MKV']
      },
      {
        name: 'All Files',
        extensions: ['*']
      }
    ],
    properties: ['openFile', 'multiSelections']
  })
}

export const oldFileDelete = function () {
  !fs.existsSync(tempFolder) && fs.mkdirSync(tempFolder)
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
