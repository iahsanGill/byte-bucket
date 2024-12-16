import { UserStorage } from "../models/user-storage.model";
import { bucket } from "../utils/gcp.util";

// Allocate storage for a new user
export const allocateStorage = async (userId: string) => {
  const existingStorage = await UserStorage.findOne({ userId });
  if (existingStorage) throw new Error("Storage already allocated");

  const newStorage = new UserStorage({ userId });
  await newStorage.save();
};

// Upload file
export const uploadFile = async (userId: string, file: Express.Multer.File) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) throw new Error("User storage not found");

  const fileSize = file.size;

  if (userStorage.usedStorage + fileSize > userStorage.totalStorage) {
    throw new Error("Storage limit reached");
  }

  // Upload file to GCP bucket
  const blob = bucket.file(`${userId}/${file.originalname}`);
  const blobStream = blob.createWriteStream();

  blobStream.end(file.buffer);
  await new Promise((resolve, reject) => {
    blobStream.on("finish", resolve);
    blobStream.on("error", reject);
  });

  // Update storage usage
  userStorage.usedStorage += fileSize;
  await userStorage.save();
};

// Fetch user storage details
export const getUserStorageDetails = async (userId: string) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) throw new Error("User storage not found");

  const usagePercentage =
    (userStorage.usedStorage / userStorage.totalStorage) * 100;

  return {
    used: userStorage.usedStorage,
    total: userStorage.totalStorage,
    percentageUsed: usagePercentage.toFixed(2),
    isNearLimit: usagePercentage >= 80,
  };
};
