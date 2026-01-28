import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

const APP_ENV = process.env.APP_ENV ?? 'local'
const NODE_ENV = process.env.NODE_ENV ?? 'development'
const PORT = Number(process.env.PORT ?? 3001)

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000'
const SOCKET_IO_CORS_ORIGIN = process.env.SOCKET_IO_CORS_ORIGIN ?? CORS_ORIGIN

const app = express()
app.use(express.json())
app.use(cors({ origin: CORS_ORIGIN, credentials: true }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, appEnv: APP_ENV, nodeEnv: NODE_ENV, ts: new Date().toISOString() })
})

const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: { origin: SOCKET_IO_CORS_ORIGIN, credentials: true },
})

io.on('connection', (socket) => {
  console.log('[socket.io] connected', socket.id)

  socket.on('disconnect', () => {
    console.log('[socket.io] disconnected', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`LiveListen API listening on http://localhost:${PORT}`)
})
