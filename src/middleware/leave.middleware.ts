import { Request, Response, NextFunction } from 'express';

export const validateLeaveData = (req: Request, res: Response, next: NextFunction) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  next();
};
