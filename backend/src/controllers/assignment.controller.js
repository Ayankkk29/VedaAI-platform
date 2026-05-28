import { Assignment, InMemoryDB } from '../models/Assignment.js';
import { addAssignmentJob } from '../queues/assignment.queue.js';
import { emitAssignmentStatus } from '../sockets/socket.manager.js';
import { getDBStatus } from '../config/db.js';

// Get all assignments
export async function getAssignments(req, res) {
  try {
    const { mockMode } = getDBStatus();
    let list;
    if (mockMode) {
      list = await InMemoryDB.find();
    } else {
      list = await Assignment.find().sort({ createdAt: -1 });
    }
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Get single assignment
export async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;
    const { mockMode } = getDBStatus();
    let assignment;
    if (mockMode) {
      assignment = await InMemoryDB.findById(id);
    } else {
      assignment = await Assignment.findById(id);
    }

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.status(200).json(assignment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Create assignment and enqueue generation
export async function createAssignment(req, res) {
  try {
    const {
      title,
      subject,
      class: classLevel,
      dueDate,
      instructions,
      numQuestions,
      marksPerQuestion,
      difficultyDistribution,
      questionTypes,
      uploadedFile
    } = req.body;

    // Validate inputs
    if (!title || !subject || !classLevel || !dueDate) {
      return res.status(400).json({ error: 'Title, Subject, Class, and Due Date are required.' });
    }

    const { mockMode } = getDBStatus();
    const initData = {
      title,
      subject,
      class: classLevel,
      dueDate,
      instructions,
      uploadedFile,
      status: 'queued',
    };

    let assignment;
    if (mockMode) {
      assignment = await InMemoryDB.create(initData);
    } else {
      assignment = await Assignment.create(initData);
    }

    const assignmentId = assignment._id.toString();

    // Trigger queue job
    const jobParams = {
      title,
      subject,
      class: classLevel,
      instructions,
      numQuestions: numQuestions || 10,
      marksPerQuestion: marksPerQuestion || 2,
      difficultyDistribution: difficultyDistribution || { easy: 30, moderate: 40, hard: 30 },
      questionTypes: questionTypes || ['mcq', 'short'],
    };

    await addAssignmentJob(assignmentId, jobParams);

    // Emit initial WebSocket update
    emitAssignmentStatus(assignmentId, 'queued');

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Regenerate question paper for an assignment
export async function regenerateAssignment(req, res) {
  try {
    const { id } = req.params;
    const { mockMode } = getDBStatus();
    
    let assignment;
    if (mockMode) {
      assignment = await InMemoryDB.findById(id);
    } else {
      assignment = await Assignment.findById(id);
    }

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Reset status to queued
    const updateData = { status: 'queued', errorMessage: undefined };
    if (mockMode) {
      assignment = await InMemoryDB.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      assignment = await Assignment.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Parse options or generate from default specs
    const jobParams = {
      title: assignment.title,
      subject: assignment.subject,
      class: assignment.class,
      instructions: assignment.instructions,
      numQuestions: req.body.numQuestions || 10,
      marksPerQuestion: req.body.marksPerQuestion || 2,
      difficultyDistribution: req.body.difficultyDistribution || { easy: 30, moderate: 40, hard: 30 },
      questionTypes: req.body.questionTypes || ['mcq', 'short'],
    };

    await addAssignmentJob(id, jobParams);
    emitAssignmentStatus(id, 'queued');

    return res.status(200).json(assignment);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Delete assignment
export async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    const { mockMode } = getDBStatus();
    
    let deleted;
    if (mockMode) {
      deleted = await InMemoryDB.findByIdAndDelete(id);
    } else {
      deleted = await Assignment.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    return res.status(200).json({ message: 'Assignment deleted successfully', id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
