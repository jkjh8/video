import { app, BrowserWindow } from 'electron'

export const createMainWindow = function () {
  windows.mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION
    }
  })
  windows.mainWindow.loadURL(process.env.APP_URL)

  windows.mainWindow.on('show', () => {
    if (status.fullscreen) {
      windows.mainWindow.setFullScreen(true)
    }
  })

  windows.mainWindow.on('ready-to-show', () => {
    windows.mainWindowId = windows.mainWindow.id
  })

  windows.mainWindow.on('closed', () => { app.quit() })

  windows.mainWindow.on('enter-full-screen', () => {
    windows.mainWindow.setMenuBarVisibility(false)
    // status.fullscreen = true
    // sendToWindow('status', status)
  })

  windows.mainWindow.on('leave-full-screen', () => {
    windows.mainWindow.setMenuBarVisibility(true)
    // status.fullscreen = false
    // sendToWindow('status', status)
  })
}

export const createControlWindow = function () {
  if (!windows.controlWindow) {
    windows.controlWindow = new BrowserWindow({
      width: 1200,
      height: 600,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    })

    windows.controlWindow.loadURL(process.env.APP_URL + '/#/control')

    windows.controlWindow.on('ready-to-show', () => {
      windows.controlWindow.Id = windows.controlWindow.id
    })

    windows.controlWindow.on('closed', () => {
      windows.controlWindow = null
      windows.controlWindowId = null
    })
  } else {
    windows.controlWindow.show()
  }
}

export const createApiWindow = function () {
  if (!windows.apiWindow) {
    windows.apiWindow = new BrowserWindow({
      width: 600,
      height: 600,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    })

    windows.apiWindow.loadURL(process.env.APP_URL + '/#/api')
    windows.apiWindow.setMenu(null)

    windows.apiWindow.on('closed', () => {
      windows.apiWindow = null
    })
  } else {
    windows.apiWindow.show()
  }
}
