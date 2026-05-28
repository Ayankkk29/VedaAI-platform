import Redis from 'ioredis';

let redisClient = null;
let isRedisMock = false;

export async function checkRedisConnection() {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  console.log(`🔌 Probing Redis server at ${host}:${port}...`);

  return new Promise((resolve) => {
    const tempClient = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: null,
      connectTimeout: 1000, // 1 second timeout
      lazyConnect: false,
    });

    let resolved = false;

    tempClient.on('connect', () => {
      if (!resolved) {
        resolved = true;
        console.log('📡 Redis is connected. BullMQ queue activated.');
        redisClient = tempClient;
        isRedisMock = false;
        resolve(true);
      }
    });

    tempClient.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        console.warn(`⚠️ Redis Connection Failed: ${err.message}. Activating local in-memory queue fallback.`);
        isRedisMock = true;
        try {
          tempClient.disconnect();
        } catch (e) {}
        resolve(false);
      }
    });

    // Safety timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('⚠️ Redis Probe Timeout. Activating local in-memory queue fallback.');
        isRedisMock = true;
        try {
          tempClient.disconnect();
        } catch (e) {}
        resolve(false);
      }
    }, 1200);
  });
}

export function getRedisConnection() {
  if (isRedisMock) {
    return null;
  }
  return redisClient;
}

export function isRedisMocked() {
  return isRedisMock;
}
