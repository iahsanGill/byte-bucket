import Redis from "ioredis";

export const redis = new Redis("redis://redis:6379");
export const subscriber = new Redis("redis://redis:6379");
