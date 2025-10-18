import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId
  nessieId: string
  amount: number
  currency: string
  merchant: string
  mcc?: string
  date: Date
  meta?: {
    units?: number
    unitType?: string
    distanceKm?: number
    description?: string
  }
  normalizedMerchant: string
  country: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nessieId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  merchant: { type: String, required: true },
  mcc: { type: String },
  date: { type: Date, required: true },
  meta: {
    units: { type: Number },
    unitType: { type: String },
    distanceKm: { type: Number },
    description: { type: String }
  },
  normalizedMerchant: { type: String, required: true },
  country: { type: String, required: true, default: 'US' }
}, {
  timestamps: true
})

// Indexes for better query performance
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ nessieId: 1 })
TransactionSchema.index({ merchant: 1 })

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema)

