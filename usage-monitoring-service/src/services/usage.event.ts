import { redis, subscriber } from "../../../shared/redis.util";
import { Usage } from "../models/usage.model";

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

subscriber.subscribe("file-channel", (err) => {
  if (err) {
    console.error("Error subscribing to file channel:", err);
  } else {
    console.log(`Subscribed to file channel. Listening for updates...`);
  }
});
