import { BrowserWindow } from 'electron'

export const enterFullscreen = function (win) {
  if (win && win.isFullScreen()) {
    win.setFullScreen(false)
    return false
  } else {
    win.setFullScreen(true)
    return true
  }
}

export const sendToWindow = function (addr, status) {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(window => {
    window.webContents.send(addr, status)
  })
}
