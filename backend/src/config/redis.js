import Redis from 'ioredis';

let isRedisMock = false;

export async function checkRedisConnection() {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  console.log(`🔌 Probing Redis server at ${host}:${port}...`);

  const useTls = host.includes('upstash.io') || process.env.REDIS_TLS === 'true';

  return new Promise((resolve) => {
    const tempClient = new Redis({
      host,
      port,
      password,
      maxRetriesPerRequest: null,
      connectTimeout: 1500, // 1.5 second timeout
      lazyConnect: false,
      ...(useTls ? { tls: {} } : {}),
    });

    let resolved = false;

    tempClient.on('connect', () => {
      if (!resolved) {
        resolved = true;
        console.log('📡 Redis is connected. BullMQ queue activated.');
        isRedisMock = false;
        // Cleanly disconnect probe client so it doesn't linger
        try {
          tempClient.disconnect();
        } catch (e) {}
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
    }, 1700);
  });
}

export function getRedisConnection() {
  if (isRedisMock) {
    return null;
  }
  
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;
  const useTls = host.includes('upstash.io') || process.env.REDIS_TLS === 'true';

  const client = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
    ...(useTls ? { tls: {} } : {}),
  });

  // Attach error handler to catch connection resets (ECONNRESET) gracefully
  client.on('error', (err) => {
    console.error(`⚠️ Redis Client Error (${host}:${port}):`, err.message);
  });

  return client;
}

export function isRedisMocked() {
  return isRedisMock;
}
