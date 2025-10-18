import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  auth0Id: string
  email: string
  name: string
  nessieCustomerId?: string
  nessieAccountId?: string
  preferences?: {
    currency: string
    country: string
    notifications: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nessieCustomerId: { type: String },
  nessieAccountId: { type: String },
  preferences: {
    currency: { type: String, default: 'USD' },
    country: { type: String, default: 'US' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
})

export const User = mongoose.model<IUser>('User', UserSchema)

