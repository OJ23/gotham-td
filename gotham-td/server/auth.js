import { Buffer } from 'node:buffer'
import crypto from 'crypto'
import Session from './models/Session.js'
import User from './models/User.js'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password, storedHash = '') {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) {
    return false
  }

  const derivedKey = crypto.scryptSync(password, salt, 64)
  const storedKey = Buffer.from(key, 'hex')
  if (derivedKey.length !== storedKey.length) {
    return false
  }

  return crypto.timingSafeEqual(derivedKey, storedKey)
}

export function createSessionToken() {
  return crypto.randomBytes(48).toString('base64url')
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  }
}

export async function createSessionForUser(userId) {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
    lastUsedAt: new Date(),
  })

  return { token, expiresAt }
}

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return ''
  }

  return header.slice('Bearer '.length).trim()
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req)
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const session = await Session.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return res.status(401).json({ message: 'Session is invalid or expired' })
    }

    const user = await User.findById(session.userId)
    if (!user || user.status !== 'active') {
      await Session.deleteOne({ _id: session._id })
      return res.status(401).json({ message: 'User account is unavailable' })
    }

    session.lastUsedAt = new Date()
    await session.save()

    req.auth = {
      token,
      sessionId: session._id,
      user,
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!roles.includes(req.auth.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    return next()
  }
}
