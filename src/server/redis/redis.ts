import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: "nqa5Lphae0VWMhmCXWa9mvqQWcw2dnou",
  socket: {
    host: "redis-13832.c328.europe-west3-1.gce.redns.redis-cloud.com",
    port: 13832,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (client.isOpen) {
    return client;
  }
  await client.connect();
  return client;
};
