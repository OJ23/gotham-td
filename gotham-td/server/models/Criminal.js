import mongoose from 'mongoose'

const criminalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    alias: { type: String, required: true },
    crimeType: { type: String, required: true },
    zone: { type: String, default: 'Gotham' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    threatLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Extreme'],
      default: 'Medium',
    },
  },
  { timestamps: true },
)

export default mongoose.model('Criminal', criminalSchema)
