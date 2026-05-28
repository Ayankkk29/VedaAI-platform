import { Queue } from 'bullmq';
import { getRedisConnection, isRedisMocked } from '../config/redis.js';
import { processAssignmentJob } from '../workers/assignment.worker.js';

let bullQueue = null;
const QUEUE_NAME = 'assignment-generation';

export function initQueue() {
  const redis = getRedisConnection();

  if (isRedisMocked() || !redis) {
    console.log('📦 BullMQ: Redis is not available. Using local in-memory Queue.');
    return;
  }

  try {
    bullQueue = new Queue(QUEUE_NAME, {
      connection: redis,
    });
    console.log('📡 BullMQ Queue initialized successfully.');
  } catch (error) {
    console.error(`❌ BullMQ Queue initialization error: ${error.message}. Falling back to in-memory.`);
  }
}

export async function addAssignmentJob(assignmentId, params) {
  if (bullQueue) {
    await bullQueue.add(assignmentId, { assignmentId, ...params }, {
      attempts: 2,
      backoff: 5000,
    });
    console.log(`➕ Added assignment ${assignmentId} to BullMQ queue.`);
  } else {
    console.log(`➕ Added assignment ${assignmentId} to Local Mock Queue.`);
    
    // Process asynchronously in the background using setTimeout to mock BullMQ delay
    setTimeout(async () => {
      try {
        await processAssignmentJob(assignmentId, params);
      } catch (err) {
        console.error(`❌ Error in local background job processing: ${err.message}`);
      }
    }, 1500); // 1.5 seconds delay
  }
}
