import Redis from "ioredis";
import { Usage } from "../models/usage.model";

const redis = new Redis(process.env.REDIS_URL);
const subscriber = new Redis(process.env.REDIS_URL);

subscriber.on("message", async (channel, message) => {
  try {
    console.log(`Received message from ${channel}: ${message}`);
    const { userId, fileSize } = JSON.parse(message);

    const usage = await Usage.findOneAndUpdate(
      { userId, date: new Date().setHours(0, 0, 0, 0) },
      { $inc: { dailyUsage: fileSize } },
      { upsert: true, new: true }
    );

    await redis.set(`usage:${userId}`, Math.max(0, usage.dailyUsage));
  } catch (error) {
    console.error("Error processing message:", error.message);
  }
});

subscriber.subscribe("file-channel", (err, count) => {
  if (err) {
    console.error("Failed to subscribe to file-channel:", err);
  } else {
    console.log(`Subscribed to file-channel (${count} total subscriptions).`);
  }
});
