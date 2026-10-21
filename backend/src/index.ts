
import { Hono } from 'hono'
import { serve, upgradeWebSocket } from '@hono/node-server'
import { WebSocketServer } from 'ws'
import { Client, type ClientChannel } from 'ssh2'
import { readFileSync, realpathSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, sep } from 'node:path'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(cors())

app.get('/terminal', upgradeWebSocket((c) => {
  const ssh = new Client()
  let shell: ClientChannel | undefined
  let cols = 80
  let rows = 24
  let connectionStarted = false
  let socketClosed = false
  const origin = c.req.header('Origin')
  const allowedOrigins = new Set([
    process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    'http://127.0.0.1:3000'
  ])

  function readSshKey(path: string): string {
    const home = homedir()
    const expandedPath = path.startsWith('~/') ? join(home, path.slice(2)) : path
    if (!isAbsolute(expandedPath)) throw new Error('Key path must be absolute')

    const sshDirectory = realpathSync(join(home, '.ssh'))
    const filePath = realpathSync(expandedPath)
    if (!filePath.startsWith(sshDirectory + sep)) {
      throw new Error('Key path must be inside ~/.ssh')
    }

    const file = statSync(filePath)
    if (!file.isFile() || file.size > 64 * 1024) {
      throw new Error('Invalid key file')
    }

    return readFileSync(filePath, 'utf8')
  }

  return {
    onOpen(_event, ws) {
      if (!origin || !allowedOrigins.has(origin)) {
        ws.close(1008, 'Origin not allowed')
        return
      }

      ssh.on('ready', () => {
        if (socketClosed) {
          ssh.end()
          return
        }

        ssh.shell(
          { term: 'xterm-256color', cols, rows },
          (err, stream) => {
            if (err) {
              ws.send(`SSH shell error: ${err.message}\r\n`)
              ssh.end()
              return
            }

            shell = stream

            // VM output -> browser
            stream.on('data', (data: Buffer) => {
              ws.send(data.toString('utf8'))
            })

            stream.on('close', () => {
              ssh.end()
              ws.close()
            })
          }
        )
      })

      ssh.on('error', (err) => {
        console.error('SSH error:', err)
        try {
          ws.send(`SSH connection failed\r\n`)
          ws.close()
        } catch {}
      })

    },

    onMessage(event, ws) {
      if (!origin || !allowedOrigins.has(origin) || socketClosed ||
          typeof event.data !== 'string') return

      try {
        const message = JSON.parse(event.data)

        if (message.type === 'connect' && !connectionStarted) {
          connectionStarted = true

          try {
            if (typeof message.keyPath !== 'string' ||
                !message.keyPath.trim() ||
                message.keyPath.length > 1024) {
              throw new Error('Invalid key input')
            }
            const privateKey = readSshKey(message.keyPath)

            ssh.connect({
              host: '10.151.0.58',
              port: 22,
              username: 'clusteruser',
              privateKey
            })
          } catch (error) {
            console.error('Terminal connection setup failed:', error)
            ws.send('Unable to use the SSH key. Check the key and try again.\r\n')
            ws.close(1008, 'Invalid SSH key')
          }
          return
        }

        if (message.type === 'input' &&
            typeof message.data === 'string') {
          // Browser input -> VM
          shell?.write(message.data)
        }

        if (message.type === 'resize' &&
            Number.isInteger(message.cols) &&
            Number.isInteger(message.rows) &&
            message.cols > 0 && message.cols <= 500 &&
            message.rows > 0 && message.rows <= 200) {
          cols = message.cols
          rows = message.rows
          shell?.setWindow(rows, cols, 0, 0)
        }
      } catch {
        // Ignore invalid messages
      }
    },

    onClose() {
      socketClosed = true
      ssh.end()
    }
  }
}))

const wss = new WebSocketServer({ noServer: true })

serve(
  {
    fetch: app.fetch,
    port: 3001,
    hostname: '127.0.0.1',
    websocket: { server: wss }
  },
  (info) => {
    console.log(`Hono running on http://localhost:${info.port}`)
  }
)
