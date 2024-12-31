import Redis from "ioredis";
import { Usage } from "../models/usage.model";

console.log(process.env.REDIS_HOST);
const redis = new Redis({
  host: "redis-13156.c259.us-central1-2.gce.redns.redis-cloud.com",
  port: 13156,
  username: "default",
  password: "n5Z53IY1RrldlbmVOLXHhI8OhVm3yh8T",
});
const subscriber = new Redis({
  host: "redis-13156.c259.us-central1-2.gce.redns.redis-cloud.com",
  port: 13156,
  username: "default",
  password: "n5Z53IY1RrldlbmVOLXHhI8OhVm3yh8T",
});

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
