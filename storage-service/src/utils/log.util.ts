import Redis from "ioredis";

export const subscriber = new Redis(process.env.REDIS_URL);

const logEvent = (
  level: string,
  message: string,
  meta: Record<string, any> = {}
) => {
  const log = JSON.stringify({ level, message, meta });
  subscriber.publish("logging-channel", log);
};

export default logEvent;
