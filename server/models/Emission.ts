import mongoose, { Document, Schema } from 'mongoose'

export interface IEmission extends Document {
  userId: mongoose.Types.ObjectId
  txId: mongoose.Types.ObjectId
  kg: number
  method: 'unit' | 'specialized' | 'spend'
  confidence: 'high' | 'medium' | 'low'
  category: string
  notes: string[]
  factors?: {
    unitFactor?: number
    spendFactor?: number
    countryMultiplier?: number
  }
  createdAt: Date
  updatedAt: Date
}

const EmissionSchema = new Schema<IEmission>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  txId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  kg: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['unit', 'specialized', 'spend'], 
    required: true 
  },
  confidence: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    required: true 
  },
  category: { type: String, required: true },
  notes: [{ type: String }],
  factors: {
    unitFactor: { type: Number },
    spendFactor: { type: Number },
    countryMultiplier: { type: Number }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
EmissionSchema.index({ userId: 1, createdAt: -1 })
EmissionSchema.index({ txId: 1 })
EmissionSchema.index({ category: 1 })

export const Emission = mongoose.model<IEmission>('Emission', EmissionSchema)

