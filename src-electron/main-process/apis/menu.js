
import { Menu } from 'electron'

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
            status = await genThumb(status)
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
        },
        { role: 'toggleDevTools' }
      ]
    }
  ])
)
