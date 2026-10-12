import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, default: 'operator' },
}, {
  timestamps: true,
});

export const MongoUser = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IScan extends Document {
  userId?: string;
  scanType: 'URL' | 'MESSAGE' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FAKE_NEWS';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  riskScore: number;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' | 'UNKNOWN';
  targetSummary: string;
  data: {
    score: number;
    level: string;
    verdict: string;
    confidence?: number;
    indicators?: Array<{ category: string; description: string; scoreImpact?: number }>;
    recommendation?: string;
    mode?: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

const ScanSchema: Schema = new Schema({
  userId: { type: String, index: true },
  scanType: { 
    type: String, 
    required: true, 
    enum: ['URL', 'MESSAGE', 'IMAGE', 'VIDEO', 'VOICE', 'FAKE_NEWS'],
    index: true 
  },
  status: { 
    type: String, 
    default: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] 
  },
  riskScore: { type: Number, default: 0 },
  verdict: { 
    type: String, 
    default: 'SAFE',
    enum: ['SAFE', 'SUSPICIOUS', 'DANGEROUS', 'UNKNOWN'] 
  },
  targetSummary: { type: String, default: '' },
  data: { type: Schema.Types.Mixed, default: {} },
  metadata: { type: Schema.Types.Mixed, default: {} },
  completedAt: { type: Date }
}, {
  timestamps: true,
});

ScanSchema.index({ userId: 1, createdAt: -1 });

export const MongoScan = mongoose.models.Scan || mongoose.model<IScan>('Scan', ScanSchema);
