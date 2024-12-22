import { subscriber } from "../../../shared/redis.util";

const logEvent = (
  level: string,
  message: string,
  meta: Record<string, any> = {}
) => {
  const log = JSON.stringify({ level, message, meta });
  subscriber.publish("logging-channel", log);
};

export default logEvent;
