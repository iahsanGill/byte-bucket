import mongoose, { Schema, Document } from "mongoose";

export interface IUserStorage extends Document {
  userId: string;
  usedStorage: number;
  totalStorage: number;
}

const UserStorageSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    usedStorage: { type: Number, default: 0 },
    totalStorage: { type: Number, default: 52428800 }, // 50MB in bytes
  },
  { timestamps: true }
);

export const UserStorage = mongoose.model<IUserStorage>(
  "UserStorage",
  UserStorageSchema
);
