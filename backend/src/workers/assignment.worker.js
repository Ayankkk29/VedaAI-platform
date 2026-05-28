import { Worker } from 'bullmq';
import { getRedisConnection, isRedisMocked } from '../config/redis.js';
import { Assignment, InMemoryDB } from '../models/Assignment.js';
import { generateQuestionPaper } from '../services/ai.service.js';
import { emitAssignmentStatus } from '../sockets/socket.manager.js';
import { getDBStatus } from '../config/db.js';

const QUEUE_NAME = 'assignment-generation';
let bullWorker = null;

// Core processing logic shared by BullMQ worker and local memory queue
export async function processAssignmentJob(assignmentId, params) {
  console.log(`⚙️ Processing assignment generation: ${assignmentId}`);
  
  // 1. Emit Processing Status
  emitAssignmentStatus(assignmentId, 'processing');
  await updateAssignmentStatus(assignmentId, 'processing');

  try {
    // 2. Call AI Service to generate questions
    const generatedPaper = await generateQuestionPaper({
      title: params.title,
      subject: params.subject,
      class: params.class,
      numQuestions: params.numQuestions,
      marksPerQuestion: params.marksPerQuestion,
      difficultyDistribution: params.difficultyDistribution,
      questionTypes: params.questionTypes,
      instructions: params.instructions,
    });

    // 3. Save generated paper to DB and mark as completed
    const { mockMode } = getDBStatus();
    if (mockMode) {
      await InMemoryDB.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        generatedPaper,
      });
    } else {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        generatedPaper,
      });
    }

    console.log(`✅ Success! Generation completed for assignment: ${assignmentId}`);
    
    // 4. Emit Completed Status
    emitAssignmentStatus(assignmentId, 'completed', generatedPaper);

  } catch (error) {
    console.error(`❌ Generation failed for assignment ${assignmentId}: ${error.message}`);
    
    // Update DB and emit status
    await updateAssignmentStatus(assignmentId, 'failed', error.message);
    emitAssignmentStatus(assignmentId, 'failed', undefined, error.message);
  }
}

// Update DB helper
async function updateAssignmentStatus(id, status, errorMessage) {
  const { mockMode } = getDBStatus();
  const updateData = { status, ...(errorMessage ? { errorMessage } : {}) };

  if (mockMode) {
    await InMemoryDB.findByIdAndUpdate(id, updateData);
  } else {
    await Assignment.findByIdAndUpdate(id, updateData);
  }
}

// Initialize BullMQ Worker
export function initWorker() {
  const redis = getRedisConnection();

  if (isRedisMocked() || !redis) {
    console.log('📦 BullMQ Worker: Redis is not available. Background processing will run in-memory.');
    return;
  }

  try {
    bullWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        const { assignmentId, ...params } = job.data;
        await processAssignmentJob(assignmentId, params);
      },
      { connection: redis }
    );

    bullWorker.on('completed', (job) => {
      console.log(`🎉 BullMQ Worker: Job ${job.id} completed successfully.`);
    });

    bullWorker.on('failed', (job, err) => {
      console.error(`❌ BullMQ Worker: Job ${job?.id} failed: ${err.message}`);
    });

    console.log('📡 BullMQ Worker initialized successfully.');
  } catch (error) {
    console.error(`❌ BullMQ Worker initialization error: ${error.message}. Running in-memory.`);
  }
}
