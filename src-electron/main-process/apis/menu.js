
import { app, Menu } from 'electron'
import { open } from './files'
import genThumb from './thunbnail'
import { enterFullscreen } from './function'
import { createControlWindow, createApiWindow } from './windows'

Menu.setApplicationMenu(
  Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'CommandOrControl+O',
          async click () {
            status.file = await open()
            status.thumbnail = await genThumb(status)
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
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Api',
          accelerator: 'F1',
          click () { createApiWindow() }
        },
        { role: 'toggleDevTools' }
      ]
    }
  ])
)
