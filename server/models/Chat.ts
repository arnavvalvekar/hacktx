import mongoose, { Document, Schema } from 'mongoose'

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId
  question: string
  answer: string
  context?: {
    txId?: mongoose.Types.ObjectId
    category?: string
    period?: string
    emissionsSummary?: any
  }
  createdAt: Date
  updatedAt: Date
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  context: {
    txId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    category: { type: String },
    period: { type: String },
    emissionsSummary: { type: Schema.Types.Mixed }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
ChatSchema.index({ userId: 1, createdAt: -1 })

export const Chat = mongoose.model<IChat>('Chat', ChatSchema)

