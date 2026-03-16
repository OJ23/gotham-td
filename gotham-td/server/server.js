/* global process */
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import Hero from './models/Hero.js'
import Criminal from './models/Criminal.js'
import User from './models/User.js'
import Session from './models/Session.js'
import {
  createSessionForUser,
  hashPassword,
  normalizeEmail,
  requireAuth,
  requireRole,
  sanitizeUser,
  verifyPassword,
} from './auth.js'

const app = express()
const {
  PORT,
  MONGO_URI,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env
const port = PORT || 4000
const mongoUri = MONGO_URI || 'mongodb://127.0.0.1:27017/gotham_registry'
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

const hasCloudinaryConfig =
  Boolean(CLOUDINARY_CLOUD_NAME) &&
  Boolean(CLOUDINARY_API_KEY) &&
  Boolean(CLOUDINARY_API_SECRET)

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
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

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password || '')

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(409).json({ message: 'An account with that email already exists' })
  }

  const isFirstUser = (await User.countDocuments()) === 0
  const user = await User.create({
    name,
    email,
    passwordHash: hashPassword(password),
    role: isFirstUser ? 'super_admin' : 'user',
  })

  user.lastLoginAt = new Date()
  await user.save()

  const { token, expiresAt } = await createSessionForUser(user._id)

  return res.status(201).json({
    token,
    expiresAt,
    user: sanitizeUser(user),
  })
})

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password || '')

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await User.findOne({ email })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  if (user.status !== 'active') {
    return res.status(403).json({ message: 'This account is disabled' })
  }

  user.lastLoginAt = new Date()
  await user.save()

  const { token, expiresAt } = await createSessionForUser(user._id)

  return res.json({
    token,
    expiresAt,
    user: sanitizeUser(user),
  })
})

app.get('/api/auth/me', requireAuth, async (req, res) => {
  return res.json({
    user: sanitizeUser(req.auth.user),
  })
})

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  await Session.deleteOne({ _id: req.auth.sessionId })
  return res.status(204).send()
})

app.post('/api/uploads/image', requireAuth, upload.single('image'), async (req, res) => {
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

app.get('/api/heroes', requireAuth, async (_req, res) => {
  const heroes = await Hero.find().sort({ createdAt: -1 })
  res.json(heroes)
})

app.post('/api/heroes', requireAuth, async (req, res) => {
  const hero = await Hero.create(req.body)
  res.status(201).json(hero)
})

app.patch('/api/heroes/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!hero) {
    return res.status(404).json({ message: 'Hero not found' })
  }

  return res.json(hero)
})

app.delete('/api/heroes/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const result = await Hero.findByIdAndDelete(req.params.id)
  if (!result) {
    return res.status(404).json({ message: 'Hero not found' })
  }
  await destroyCloudinaryImage(result.imagePublicId)
  return res.status(204).send()
})

app.get('/api/criminals', requireAuth, async (_req, res) => {
  const criminals = await Criminal.find().sort({ createdAt: -1 })
  res.json(criminals)
})

app.post('/api/criminals', requireAuth, async (req, res) => {
  const criminal = await Criminal.create(req.body)
  res.status(201).json(criminal)
})

app.patch('/api/criminals/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  const criminal = await Criminal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!criminal) {
    return res.status(404).json({ message: 'Criminal not found' })
  }

  return res.json(criminal)
})

app.delete('/api/criminals/:id', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
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
