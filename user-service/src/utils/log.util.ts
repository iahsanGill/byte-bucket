import Redis from "ioredis";

console.log(process.env.REDIS_HOST);
const subscriber = new Redis({
  host: "redis-13156.c259.us-central1-2.gce.redns.redis-cloud.com",
  port: 13156,
  username: "default",
  password: "n5Z53IY1RrldlbmVOLXHhI8OhVm3yh8T",
});

const logEvent = (
  level: string,
  message: string,
  meta: Record<string, any> = {}
) => {
  const log = JSON.stringify({ level, message, meta });
  subscriber.publish("logging-channel", log);
};

export default logEvent;
