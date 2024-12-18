import { redis, subscriber } from "../../../shared/redis.util";
import { UserStorage } from "../models/user-storage.model";
import { bucket } from "../utils/gcp.util";

const DAILY_BANDWIDTH_LIMIT = 100 * 1024 * 1024; // 100MB

const logEvent = (
  level: string,
  message: string,
  meta: Record<string, any> = {}
) => {
  const log = JSON.stringify({ level, message, meta });
  redis.publish("logging-channel", log);
};

// Allocate storage for a new user
export const allocateStorage = async (userId: string) => {
  const existingStorage = await UserStorage.findOne({ userId });
  if (existingStorage) {
    logEvent("error", "Storage already allocated", { userId });
    throw new Error("Storage already allocated");
  }

  const newStorage = new UserStorage({ userId });
  await newStorage.save();
  logEvent("info", "Storage allocated", { userId });
};

// Upload file
export const uploadFile = async (userId: string, file: Express.Multer.File) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) {
    logEvent("error", "User storage not found", { userId });
    throw new Error("User storage not found");
  }

  const fileSize = file.size;

  if (userStorage.usedStorage + fileSize > userStorage.totalStorage) {
    logEvent("error", "Storage limit reached", { userId, fileSize });
    throw new Error("Storage limit reached");
  }

  // Check Redis Cache for Bandwidth Usage
  const cachedUsage = await redis.get(`usage:${userId}`);
  const currentUsage = cachedUsage ? parseInt(cachedUsage) : 0;

  if (currentUsage + fileSize > DAILY_BANDWIDTH_LIMIT) {
    logEvent("error", "Bandwidth limit exceeded", { userId, fileSize });
    throw new Error("Bandwidth limit exceeded.");
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

  subscriber.publish("file-channel", JSON.stringify({ userId, fileSize }));
  logEvent("info", "File uploaded", { userId, fileSize });
};

// Delete file
export const deleteFile = async (userId: string, fileName: string) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) {
    logEvent("error", "User storage not found", { userId });
    throw new Error("User storage not found");
  }

  // Check if file exists in GCP bucket
  const file = bucket.file(`${userId}/${fileName}`);
  const [exists] = await file.exists();
  if (!exists) {
    logEvent("error", "File not found", { userId, fileName });
    throw new Error("File not found");
  }

  // Get file size
  const [metadata] = await file.getMetadata();
  const fileSize = metadata.size as number;

  // Delete file from GCP bucket
  await file.delete();

  // Update storage usage
  userStorage.usedStorage -= fileSize;
  await userStorage.save();

  subscriber.publish("file-channel", JSON.stringify({ userId, fileSize }));
  logEvent("info", "File deleted", { userId, fileName, fileSize });

  console.log("File deleted event published");
};

// Fetch user storage details
export const getUserStorageDetails = async (userId: string) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) {
    logEvent("error", "User storage not found", { userId });
    throw new Error("User storage not found");
  }

  const usagePercentage =
    (userStorage.usedStorage / userStorage.totalStorage) * 100;

  logEvent("info", "Fetched user storage details", { userId, usagePercentage });

  return {
    used: userStorage.usedStorage,
    total: userStorage.totalStorage,
    percentageUsed: usagePercentage.toFixed(2),
    isNearLimit: usagePercentage >= 80,
  };
};
