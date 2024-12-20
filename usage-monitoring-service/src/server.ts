import dotenv from "dotenv";
import "./services/usage.event";
import mongoose from "mongoose";

dotenv.config();

mongoose
  .connect(process.env.DB_URL as string, {
    authSource: "admin",
    family: 4,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error.message));
