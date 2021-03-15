import { enterFullscreen, sendToWindow } from './function'
import { open, clear, getFileObj, openFiles } from './files'
import { BrowserWindow } from 'electron'
import genThumb from './thunbnail'
import db from './db'

async function controls (contr, status, tcpServer) {
  const win1 = BrowserWindow.fromId(1)
  const win2 = BrowserWindow.fromId(2)
  const control = contr.control
  const value = contr.value
  switch (control) {
    case 'open':
      status.file = await open()
      break
    case 'clear':
      status.autoplay = false
      status.file = await clear()
      status.isPlaying = false
      status.playBtn = false
      tcpServer.write('clear')
      break
    case 'mode':
      if (status.mode === 'playlist') {
        status.mode = 'nomal'
      } else {
        status.mode = 'playlist'
      }
      break
    case 'fullscreen':
      status.fullscreen = await enterFullscreen()
      tcpServer.write(`fullscreen,${status.fullscreen}`)
      break
    case 'play':
      if (status.file) {
        sendToWindow('control', { control: 'play' })
        tcpServer.write(`play,${status.file.file}`)
      } else {
        tcpServer.write('err,none_file')
      }
      break
    case 'pause':
      status.autoplay = false
      sendToWindow('control', { control: 'pause' })
      tcpServer.write('pause')
      break
    case 'playBtn':
      status.autoplay = false
      if (status.file) {
        status.playBtn = !status.playBtn
        sendToWindow('control', { control: 'play' })
        tcpServer.write(`play,${status.file.file}`)
      } else {
        status.playBtn = false
        tcpServer.write('err,none_file')
        if (win2) {
          win2.webContents.send('alert', 'Please check file or open file for play')
        }
      }
      break
    case 'changeTime':
      sendToWindow('control', { control: 'changeTime', value: value })
      break
    case 'isPlaying':
      status.isPlaying = value
      break
    case 'duration':
      status.duration = value
      break
    case 'currentTime':
      status.currentTime = value
      break
    case 'ended':
      status.isPlaying = false
      status.playBtn = false
      status.currentTime = 0
      tcpServer.write('end')
      break
    case 'openFile':
      status.file = getFileObj(value)
      status.isPlaying = false
      status.thumbnail = await genThumb(status)
      sendToWindow('file', status.file)
      tcpServer.write(`open,${status.file.file}`)
      break
    case 'loop':
      status.loop = !status.loop
      tcpServer.write(`loop,${status.loop}`)
      break
    case 'loopAll':
      if (status.mode === 'playlist') {
        status.loopAll = !status.loopAll
        tcpServer.write(`loop_all,${status.loopAll}`)
      } else {
        status.loopAll = false
        tcpServer.write(`loop_all,${status.loopAll}`)
      }
      break
    case 'mute':
      status.mute = !status.mute
      tcpServer.write(`mute,${status.mute}`)
      break
    case 'volume':
      status.volume = value
      tcpServer.write(`vol,${status.volume}`)
      break
    case 'flip':
      if (win1) {
        win1.show()
        tcpServer.write('flip')
      }
      break
    case 'next':
      if (status.items.length === 0) {
        status.isPlaying = false
        status.playBtn = false
        break
      }
      status.itemIdx = status.itemIdx + 1
      if (status.items.length <= status.itemIdx) {
        if (!status.loopAll) {
          status.playBtn = false
          status.isPlaying = false
          // sendToWindow('status', status)
        }
        status.itemIdx = 0
      }
      status = await loadFileIndex(status)
      tcpServer.write(`next,list=${status.listIdx},item=${status.itemIdx},file=${status.file.file}`)
      break
    case 'previous':
      if (status.items.length === 0) {
        status.isPlaying = false
        status.playBtn = false
        break
      }
      status.itemIdx = status.itemIdx - 1
      if (status.itemIdx < 0) {
        status.itemIdx = status.items.length - 1
      }
      status = await loadFileIndex(status)
      tcpServer.write(`previous,list=${status.listIdx},item=${status.itemIdx},file=${status.file.file}`)
      break
    case 'itemIdx':
      status.autoplay = false
      if (status.items.length > value) {
        status.itemIdx = value
        status.isPlaying = false
        status = await loadFileIndex(status)
        tcpServer.write(`ci,idx=${status.itemIdx},name=${status.file.file}`)
      } else {
        tcpServer.write('err,items_out_of_range')
      }
      break
    case 'itemIdxTcp':
      if (status.items.length > value) {
        status.itemIdx = value
        status.isPlaying = false
        status = await loadFileIndex(status)
        tcpServer.write(`ci,idx=${status.itemIdx},name=${status.file.file}`)
      } else {
        tcpServer.write('err,items_out_of_range')
      }
      break
    case 'listIdx':
      status.autoplay = false
      if (status.list.length > value) {
        status.listIdx = value
        status.currListName = status.list[value].name
        status.itemIdx = null
        status = await db.refreshDb(status)
        tcpServer.write(`cl,idx=${status.listIdx},name=${status.currListName}`)
      } else {
        tcpServer.write('err,list_out_of_range')
      }
      break
    case 'getItems': {
      const files = await openFiles()
      await db.addListItems(status.currListName, files)
      status = await db.refreshDb(status)
      break
    }
    case 'addItems': {
      await db.addListItems(status.currListName, value)
      status = await db.refreshDb(status)
      break
    }
    case 'addList':
      await db.addList(value)
      status = await db.refreshDb(status)
      break
    case 'delItem':
      await db.delListItem(value)
      status = await db.refreshDb(status)
      break
    case 'delItems':
      await db.delListItems(status.currListName)
      status = await db.refreshDb(status)
      break
    case 'delList':
      await db.delList(value)
      status = await db.refreshDb(status)
      break
    case 'delAll':
      await db.delAll()
      status = await db.refreshDb(status)
      break
  }
  sendToWindow('status', status)
  return status
}

async function loadFileIndex (status) {
  const win = BrowserWindow.fromId(windows.mainWindowId)
  status.file = getFileObj(status.items[status.itemIdx].file)
  status.thumbnail = await genThumb(status)
  win.webContents.send('file', status.file)
  return status
}

export default controls
