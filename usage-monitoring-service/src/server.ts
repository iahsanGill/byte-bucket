import dotenv from "dotenv";
import express from "express";
import "./services/usage.event";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.DB_URL as string, {
    authSource: "admin",
    family: 4,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.listen(process.env.PORT || 3003, () =>
  console.log(`Usage Monitoring Service is running on port ${process.env.PORT}`)
);
