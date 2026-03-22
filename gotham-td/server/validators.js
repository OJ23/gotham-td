import { body, param, validationResult } from 'express-validator'

const MAP_WIDTH = 1600
const MAP_HEIGHT = 2241

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value
}

function normalizeText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback
  }
  return value.trim()
}

function sanitizeMapPoint(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  const x = Number(value.x)
  const y = Number(value.y)

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
  }
}

function isValidMapPoint(value) {
  if (value == null) {
    return true
  }

  return (
    typeof value === 'object' &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    value.x >= 0 &&
    value.x <= MAP_WIDTH &&
    value.y >= 0 &&
    value.y <= MAP_HEIGHT
  )
}

export function handleValidationErrors(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    return next()
  }

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }))

  return res.status(400).json({
    message: errors[0]?.message || 'Invalid request data',
    errors,
  })
}

export const validateRegister = [
  body('name')
    .customSanitizer(trimString)
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .customSanitizer((value) => String(value || '').trim().toLowerCase())
    .isEmail()
    .withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
  handleValidationErrors,
]

export const validateLogin = [
  body('email')
    .customSanitizer((value) => String(value || '').trim().toLowerCase())
    .isEmail()
    .withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required'),
  handleValidationErrors,
]

export const validateMongoIdParam = [
  param('id').isMongoId().withMessage('A valid record id is required'),
  handleValidationErrors,
]

export const validateMapPointPayload = [
  body('mapPoint')
    .customSanitizer(sanitizeMapPoint)
    .custom(isValidMapPoint)
    .withMessage('Map point must contain valid x and y coordinates inside the map bounds'),
  handleValidationErrors,
]

export const validateHeroPayload = [
  body('name')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 100 })
    .withMessage('Hero name is required'),
  body('alias')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 100 })
    .withMessage('Hero alias is required'),
  body('role')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 120 })
    .withMessage('Hero role is required'),
  body('power')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 160 })
    .withMessage('Hero power is required'),
  body('description')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isLength({ max: 1200 })
    .withMessage('Description must be 1200 characters or fewer'),
  body('image')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL'),
  body('imagePublicId')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isLength({ max: 255 })
    .withMessage('Image public id is too long'),
  body('city')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value, 'Gotham'))
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or fewer'),
  body('mapPoint')
    .optional({ values: 'falsy' })
    .customSanitizer(sanitizeMapPoint)
    .custom(isValidMapPoint)
    .withMessage('Map point must contain valid x and y coordinates inside the map bounds'),
  handleValidationErrors,
]

export const validateCriminalPayload = [
  body('name')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 100 })
    .withMessage('Criminal name is required'),
  body('alias')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 100 })
    .withMessage('Criminal alias is required'),
  body('crimeType')
    .customSanitizer(trimString)
    .isLength({ min: 1, max: 120 })
    .withMessage('Crime type is required'),
  body('zone')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value, 'Gotham'))
    .isLength({ max: 100 })
    .withMessage('Zone must be 100 characters or fewer'),
  body('description')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isLength({ max: 1200 })
    .withMessage('Description must be 1200 characters or fewer'),
  body('image')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL'),
  body('imagePublicId')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value))
    .isLength({ max: 255 })
    .withMessage('Image public id is too long'),
  body('threatLevel')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value, 'Medium'))
    .isIn(['Low', 'Medium', 'High', 'Extreme'])
    .withMessage('Threat level must be Low, Medium, High, or Extreme'),
  body('mapPoint')
    .optional({ values: 'falsy' })
    .customSanitizer(sanitizeMapPoint)
    .custom(isValidMapPoint)
    .withMessage('Map point must contain valid x and y coordinates inside the map bounds'),
  handleValidationErrors,
]

export const validateImageUpload = [
  body('category')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => normalizeText(value, 'heroes'))
    .isIn(['heroes', 'criminals'])
    .withMessage('Upload category must be heroes or criminals'),
  handleValidationErrors,
]
