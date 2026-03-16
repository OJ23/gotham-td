import mongoose from 'mongoose'

const heroSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    alias: { type: String, required: true },
    role: { type: String, required: true },
    power: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    city: { type: String, default: 'Gotham' },
  },
  { timestamps: true },
)

export default mongoose.model('Hero', heroSchema)
