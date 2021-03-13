import { BrowserWindow } from 'electron'

export const enterFullscreen = function () {
  const win = BrowserWindow.fromId(1)
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
    if (window) {
      window.webContents.send(addr, status)
    }
  })
}
