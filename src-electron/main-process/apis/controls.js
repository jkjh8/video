import { enterFullscreen, sendToWindow } from './function'
import { open, clear, getFileObj } from './files'

async function controls (contr, status, win, win2) {
  const control = contr.control
  const value = contr.value
  switch (control) {
    case 'open':
      status.file = await open(win)
      break
    case 'clear':
      status.file = await clear()
      status.isPlaying = false
      status.playBtn = false
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
      break
    case 'play':
      sendToWindow('control', { control: 'play' })
      break
    case 'playBtn':
      if (status.file) {
        status.playBtn = !status.playBtn
        sendToWindow('control', { control: 'play' })
        // win.webContents.send('control', { control: 'play' })
      } else {
        status.playBtn = false
        win2.webContents.send('alert', 'Please check file or open file for play')
      }
      break
    case 'changeTime':
      win.webContents.send('control', { control: 'changeTime', value: value })
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
      break
    case 'openFile':
      status.file = getFileObj(value)
      status.isPlaying = false
      win.webContents.send('file', status.file)
      break
    case 'loop':
      status.loop = !status.loop
      break
    case 'loopAll':
      status.loopAll = !status.loopAll
      break
    case 'mute':
      status.mute = !status.mute
      break
    case 'volume':
      status.volume = value
      break
    case 'flip':
      win.show()
      break
  }
  return status
}

export default controls
