import express from "express";
import multer from "multer";
import {
  allocateStorage,
  deleteFile,
  getUserStorageDetails,
  uploadFile,
} from "../services/storage.service";
import { authenticate } from "../middleware/auth.middleware";

const router = express.Router();
const upload = multer();

// Allocate storage for a new user
router.get("/allocate", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    await allocateStorage(userId);
    res.status(201).json({ message: "Storage allocated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload file
router.post(
  "/upload",
  upload.single("file"),
  authenticate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const file = req.file;

      if (!file) throw new Error("No file uploaded");

      await uploadFile(userId, file);
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete file
router.delete("/delete", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileName } = req.body;

    await deleteFile(userId, fileName);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user storage details
router.get("/details", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const details = await getUserStorageDetails(userId);
    res.status(200).json(details);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
