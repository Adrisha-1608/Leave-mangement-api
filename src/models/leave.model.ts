import mongoose, { Document, Schema } from 'mongoose';

export interface LeaveDocument extends Document {
  userId: mongoose.Types.ObjectId;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  createdAt: Date;
}

const leaveSchema = new Schema<LeaveDocument>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  leaveType: { type: String, enum: ['Planned Leave', 'Emergency Leave'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Leave = mongoose.model<LeaveDocument>('Leave', leaveSchema);
