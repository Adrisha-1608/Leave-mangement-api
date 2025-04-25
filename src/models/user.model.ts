import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string; // Optional field for the profile picture
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' }, // Default empty string for no profile picture
});

export const User = model<IUser>('User', userSchema);

  