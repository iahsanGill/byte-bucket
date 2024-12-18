import { EventEmitter } from "events";

class PubSub extends EventEmitter {
  publish(event: string, data: string) {
    this.emit(event, data);
  }

  subscribe(event: string, listener: (data: string) => void) {
    this.on(event, listener);
  }
}

export const pubsub = new PubSub();
