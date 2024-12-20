import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/database.config";
import storageRoutes from "./routes/storage.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api", storageRoutes);

connectDB(process.env.DB_URL as string);

app.listen(PORT, () => {
  console.log(`User Storage Management Service running on port ${PORT}`);
});
