import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveType extends Document {
  leaveType: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema: Schema = new Schema(
  {
    leaveType: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
);

const LeaveType = mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export default LeaveType;
