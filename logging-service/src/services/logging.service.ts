import { createLogger, format, transports } from "winston";
import Redis from "ioredis";
import * as path from "path";

console.log(process.env.REDIS_HOST);
export const subscriber = new Redis({
  host: 'redis-13156.c259.us-central1-2.gce.redns.redis-cloud.com',
  port: 13156,
  username: 'default',
  password: 'n5Z53IY1RrldlbmVOLXHhI8OhVm3yh8T',
});

// Get today's date in YYYY-MM-DD format
const getDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Create the logger instance
const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join("logs", `app-${getDate()}.log`), // Logs will be saved here
      maxsize: 5 * 1024 * 1024, // Rotate files > 5 MB
      maxFiles: 5, // Keep the last 5 rotated files
    }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Subscribe to Redis channel for logs
const listenToLoggingChannel = () => {
  subscriber.subscribe("logging-channel", (err, count) => {
    if (err) {
      console.error("Failed to subscribe to logging-channel:", err);
    } else {
      console.log(
        `Subscribed to logging-channel (${count} total subscriptions).`
      );
    }
  });

  subscriber.on("message", (channel, message) => {
    if (channel === "logging-channel") {
      const log = JSON.parse(message);
      const { level, message: logMessage, meta } = log;

      // Log the message based on its level
      logger.log({
        level,
        message: logMessage,
        ...(meta && { meta }),
      });
    }
  });
};

export default listenToLoggingChannel;
