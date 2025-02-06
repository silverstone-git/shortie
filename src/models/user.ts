import mongoose, { Schema } from "mongoose";

export interface IUser {
  googleId: string;
  displayName: string;
  email: string;
  createdAt: Date;
}


const iUserSchema = new Schema<IUser>({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const mongooseModel = mongoose.model<IUser>('Url', iUserSchema);
