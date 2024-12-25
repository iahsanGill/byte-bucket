import express, { Request, Response } from "express";
import multer from "multer";
import {
  allocateStorage,
  deleteFile,
  getUserStorageDetails,
  uploadFile,
  getAllThumbnails,
  getVideoByThumbnail,
} from "../services/storage.service";
import { authenticate } from "../middleware/auth.middleware";

interface MulterRequest extends Request {
  files: {
    [key: string]: Express.Multer.File[];
  };
}

const router = express.Router();
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Get the signed urls for all thumbnails
router.get("/thumbnails", async (req: Request, res: Response) => {
  const thumbnails = await getAllThumbnails();
  res.status(200).json({ thumbnails });
});

// Stream video by thumbnail name
router.get(
  "/video/:thumbnailName(*).jpg",
  async (req: Request, res: Response) => {
    try {
      const { thumbnailName } = req.params;
      const videoStream = await getVideoByThumbnail(thumbnailName);

      videoStream.pipe(res);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Allocate storage for a new user
router.get("/allocate", authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await allocateStorage(userId);
    res.status(201).json({ message: "Storage allocated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload file and thumbnail
router.post(
  "/upload",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      console.log(req.files);

      const request = req as MulterRequest;
      const file = request.files["video"][0];
      const thumbnail = request.files["thumbnail"][0];

      if (!file || !thumbnail)
        throw new Error("File or thumbnail not uploaded");

      await uploadFile(userId, file, thumbnail);
      res
        .status(200)
        .json({ message: "File and thumbnail uploaded successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete file
router.delete("/delete", authenticate, async (req: Request, res: Response) => {
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
router.get("/details", authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const details = await getUserStorageDetails(userId);
    res.status(200).json(details);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
