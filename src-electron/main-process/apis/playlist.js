import { openFiles, getFileObj } from './files'
import { sendToWindow } from './function'
import genThumb from './thunbnail'
import db from './db'

async function playlistPrc (control, status, playlist, win, win2) {
  switch (control.control) {
    case 'next':
      playlist.itemIdx = playlist.itemIdx + 1
      if (playlist.items.length <= playlist.itemIdx) {
        if (!status.loopAll) {
          status.playBtn = false
          status.isPlaying = false
          sendToWindow('status', status)
        }
        playlist.itemIdx = 0
      }
      status.file = getFileObj(playlist.items[playlist.itemIdx].file)
      win.webContents.send('file', status.file)
      status = await genThumb(status)
      break
    case 'previous':
      playlist.itemIdx = playlist.itemIdx - 1
      if (playlist.itemIdx < 0) {
        playlist.itemIdx = playlist.items.length - 1
      }
      status.file = getFileObj(playlist.items[playlist.itemIdx].file)
      win.webContents.send('file', status.file)
      status = await genThumb(status)
      break
    case 'itemIdx':
      playlist.itemIdx = control.value
      status.file = getFileObj(playlist.items[control.value].file)
      win.webContents.send('file', status.file)
      status.isPlaying = false
      status = await genThumb(status)
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
  return playlist
}

export default playlistPrc
