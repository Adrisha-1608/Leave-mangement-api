import { Leave } from '../models/leave.model';
import { User } from '../models/user.model';
import { isBefore, subDays, startOfDay, endOfDay, isAfter } from 'date-fns';
export const applyLeave = async (userId: string, type: string, startDate: string, endDate: string, reason?: string) => {
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  console.log('Start Date:', startDate, 'End Date:', endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format.');
  }

  if (isBefore(start, subDays(new Date(), 3))) {
    throw new Error('Backdated leave applications older than 3 days are not allowed.');
  }

  if (isAfter(start, end)) {
    throw new Error('End date must be after the start date.');
  }

  const existingLeave = await Leave.findOne({
    userId,
    $or: [
      { startDate: { $gte: startOfDay(start), $lte: endOfDay(start) } },
      { endDate: { $gte: startOfDay(start), $lte: endOfDay(start) } },
      { startDate: { $gte: startOfDay(end), $lte: endOfDay(end) } },
      { endDate: { $gte: startOfDay(end), $lte: endOfDay(end) } }
    ]
  });

  if (existingLeave) {
    throw new Error('Cannot apply for more than one leave on the same day.');
  }
  return Leave.create({ userId, leaveType: type, startDate: start, endDate: end, reason });

};

export const getLeaves = async (userId: string, type?: string, page = 1, limit = 10) => {
  const query: any = { userId };
  if (type) query.type = type;

  const skips = (page - 1) * limit;
  const leaves = await Leave.find(query).skip(skips).limit(limit);
  const total = await Leave.countDocuments(query);
  return { leaves, total, page, pages: Math.ceil(total / limit) };
};

export const getLeaveById = async (leaveId: string) => {
  return Leave.findById(leaveId);
};