import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL!,
});

redis.on("error", async (error) => {
  console.error(error);

  await redis.disconnect();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await redis.connect();
});

if (!redis.isOpen) {
  redis.connect();
}

export default redis;
