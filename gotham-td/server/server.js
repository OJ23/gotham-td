import express from 'express'
import mongoose from 'mongoose'
import Hero from './models/Hero.js'
import Criminal from './models/Criminal.js'

const app = express()
const port = process.env.PORT || 4000
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gotham_registry'

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'gotham-api' })
})

app.get('/api/heroes', async (_req, res) => {
  const heroes = await Hero.find().sort({ createdAt: -1 })
  res.json(heroes)
})

app.post('/api/heroes', async (req, res) => {
  const hero = await Hero.create(req.body)
  res.status(201).json(hero)
})

app.delete('/api/heroes/:id', async (req, res) => {
  const result = await Hero.findByIdAndDelete(req.params.id)
  if (!result) {
    return res.status(404).json({ message: 'Hero not found' })
  }
  return res.status(204).send()
})

app.get('/api/criminals', async (_req, res) => {
  const criminals = await Criminal.find().sort({ createdAt: -1 })
  res.json(criminals)
})

app.post('/api/criminals', async (req, res) => {
  const criminal = await Criminal.create(req.body)
  res.status(201).json(criminal)
})

app.delete('/api/criminals/:id', async (req, res) => {
  const result = await Criminal.findByIdAndDelete(req.params.id)
  if (!result) {
    return res.status(404).json({ message: 'Criminal not found' })
  }
  return res.status(204).send()
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error', detail: err.message })
})

async function start() {
  try {
    await mongoose.connect(mongoUri)
    console.log(`Connected to MongoDB: ${mongoUri}`)
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()