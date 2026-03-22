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
    mapPoint: {
      x: { type: Number, default: null },
      y: { type: Number, default: null },
    },
    threatLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Extreme'],
      default: 'Medium',
    },
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdByName: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('Criminal', criminalSchema)
