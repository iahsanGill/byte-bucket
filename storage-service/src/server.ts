import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/database.config";
import storageRoutes from "./routes/storage.routes";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", storageRoutes);

connectDB(process.env.DB_URL as string);

app.listen(PORT, () => {
  console.log(`User Storage Management Service running on port ${PORT}`);
});
