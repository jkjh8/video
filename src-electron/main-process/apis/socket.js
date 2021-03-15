const net = require('net')

const clients = []
let server

const tcpServer = {
  read: (port, callback) => {
    server = net.createServer((socket) => {
      socket.on('connect', () => {
        clients.push(socket)
      })
      socket.on('data', (data) => {
        callback(data)
      })
      socket.on('close', () => {
        clients.splice(clients.indexOf(socket), 1)
      })
      socket.on('error', (err) => {
        console.log('socket error: ', JSON.stringify(err))
      })
    })
    server.addListener('connection', (socket) => {
      clients.push(socket)
    })
    server.listen(port, () => {
      server.on('close', () => {
        console.log('Server close')
      })
      server.on('error', (err) => {
        console.log('server error: ', JSON.stringify(err))
      })
    })
  },
  write: (data) => {
    clients.forEach(client => {
      client.write(data)
    })
  },
  close: () => {
    server.close()
  }
}

export default tcpServer
