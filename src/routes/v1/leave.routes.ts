import { Router } from 'express';
import * as leaveController from '../../controllers/leave.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateLeaveApplication, validateUpdateLeave } from '../../middleware/validation.middleware';

const router = Router();

router.post('/', authMiddleware, leaveController.applyLeave);
router.get('/', authMiddleware, leaveController.getLeaves);
router.get('/:leaveId', authMiddleware, leaveController.getLeaveById);

export default router;
