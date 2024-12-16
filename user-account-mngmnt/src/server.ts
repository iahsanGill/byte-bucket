import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      family: 4,
      authSource: "admin",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectToMongoDB();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User Account Management Service running on port ${PORT}`);
});
