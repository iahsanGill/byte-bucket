import { videosBucket, thumbnailsBucket } from "../utils/gcp.util";
import logEvent from "../utils/log.util";
import { UserStorage } from "../models/user-storage.model";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";

const DAILY_BANDWIDTH_LIMIT = 100 * 1024 * 1024; // 100MB

const redis = new Redis(process.env.REDIS_URL);

export const checkStorageLimit = async (userId: string, fileSize: number) => {
  const userStorage = await UserStorage.findOne({ userId });
  if (!userStorage) {
    logEvent("error", "User storage not found", { userId });
    throw new Error("User storage not found");
  }

  if (userStorage.usedStorage + fileSize > userStorage.totalStorage) {
    logEvent("error", "Storage limit reached", { userId, fileSize });
    throw new Error("Storage limit reached");
  }

  return userStorage;
};

export const checkBandwidthLimit = async (userId: string, fileSize: number) => {
  const cachedUsage = await redis.get(`usage:${userId}`);
  const currentUsage = cachedUsage ? parseInt(cachedUsage) : 0;

  if (currentUsage + fileSize > DAILY_BANDWIDTH_LIMIT) {
    logEvent("error", "Bandwidth limit exceeded", { userId, fileSize });
    throw new Error("Bandwidth limit exceeded.");
  }
};

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

export const uploadFile = async (
  userId: string,
  video: Express.Multer.File,
  thumbnail: Express.Multer.File
) => {
  const videoExt = video.originalname.split(".").pop();
  const thumbnailExt = thumbnail.originalname.split(".").pop();
  const videoId = uuidv4();

  const fileBlob = videosBucket.file(`${videoId}.${videoExt}`);
  const thumbnailBlob = thumbnailsBucket.file(
    `${videoId}-thumbnail.${thumbnailExt}`
  );

  const fileBlobStream = fileBlob.createWriteStream();
  const thumbnailBlobStream = thumbnailBlob.createWriteStream();

  fileBlobStream.end(video.buffer);
  thumbnailBlobStream.end(thumbnail.buffer);

  await Promise.all([
    new Promise((resolve, reject) => {
      fileBlobStream.on("finish", resolve);
      fileBlobStream.on("error", reject);
    }),
    new Promise((resolve, reject) => {
      thumbnailBlobStream.on("finish", resolve);
      thumbnailBlobStream.on("error", reject);
    }),
  ]);

  logEvent("info", "Files uploaded", { userId });
};

export const deleteFile = async (userId: string, videoId: string) => {
  const file = videosBucket.file(`${videoId}.mp4`);
  const [fileExists] = await file.exists();

  if (!fileExists) {
    logEvent("error", "File not found", { userId, videoId });
    throw new Error("File not found");
  }

  // Regular expression for common image extensions
  const thumbnailPrefix = `${videoId}-thumbnail`;
  const thumbnailExtensions = /\.(jpg|jpeg|png|gif)$/i;

  // List all files in the thumbnails bucket
  const [thumbnails] = await thumbnailsBucket.getFiles({
    prefix: thumbnailPrefix,
  });

  // Find the thumbnail with the correct extension
  const thumbnailFile = thumbnails.find((file) =>
    thumbnailExtensions.test(file.name)
  );

  if (!thumbnailFile) {
    logEvent("error", "Thumbnail not found", { userId, videoId });
    throw new Error("Thumbnail not found");
  }

  // Get the size of the original file
  const [fileMetadata] = await file.getMetadata();
  const fileSize = fileMetadata.size as number;

  // Delete the video file and thumbnail
  await Promise.all([file.delete(), thumbnailFile.delete()]);

  logEvent("info", "File and thumbnail deleted", { userId, videoId });
  return fileSize;
};

export const getAllThumbnails = async () => {
  const [files] = await thumbnailsBucket.getFiles();
  const thumbnails = await Promise.all(
    files.map(async (file) => {
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60, // 1 hour
      });
      return { name: file.name, url };
    })
  );

  logEvent("info", "Fetched all thumbnails", { count: thumbnails.length });
  return thumbnails;
};

export const getVideoById = async (videoId: string) => {
  const videoFile = videosBucket.file(`${videoId}.mp4`);

  const [exists] = await videoFile.exists();
  if (!exists) {
    logEvent("error", "Video not found", { videoId });
    throw new Error("Video not found");
  }

  return videoFile.createReadStream();
};

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
