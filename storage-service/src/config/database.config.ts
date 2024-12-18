import mongoose from "mongoose";

export const connectDB = async (dbUrl: string) => {
  try {
    await mongoose.connect(dbUrl, {
      family: 4,
      authSource: "admin",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
};
