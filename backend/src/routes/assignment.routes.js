import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  regenerateAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', createAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
