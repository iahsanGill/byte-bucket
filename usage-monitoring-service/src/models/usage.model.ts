import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  dailyUsage: { type: Number, default: 0 }, // Total bandwidth in bytes
  date: { type: Date, default: new Date().setHours(0, 0, 0, 0) }, // Reset daily
});

export const Usage = mongoose.model("Usage", usageSchema);
