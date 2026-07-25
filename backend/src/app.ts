import express from 'express'
import cors from 'cors'
import { itemsRouter } from './routes/items.js'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/items', itemsRouter)
