/* global process */
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import Hero from './models/Hero.js'
import Criminal from './models/Criminal.js'

const app = express()
const port = process.env.PORT || 4000
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gotham_registry'
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

const hasCloudinaryConfig =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET)

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

app.use(express.json())

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        resolve(result)
      },
    )
    stream.end(buffer)
  })
}

async function destroyCloudinaryImage(publicId) {
  if (!hasCloudinaryConfig || !publicId) {
    return
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  } catch (error) {
    console.error(`Failed to delete Cloudinary image: ${publicId}`, error.message)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'gotham-api' })
})

app.post('/api/uploads/image', upload.single('image'), async (req, res) => {
  if (!hasCloudinaryConfig) {
    return res.status(500).json({
      message: 'Cloudinary is not configured on the server',
    })
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' })
  }

  const category = req.body.category === 'criminals' ? 'criminals' : 'heroes'

  try {
    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      `gotham-registry/${category}`,
    )

    return res.status(201).json({
      image: result.secure_url,
      imagePublicId: result.public_id,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to upload image',
      detail: error.message,
    })
  }
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
  await destroyCloudinaryImage(result.imagePublicId)
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
  await destroyCloudinaryImage(result.imagePublicId)
  return res.status(204).send()
})

app.use((err, _req, res, _next) => {
  void _next
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
