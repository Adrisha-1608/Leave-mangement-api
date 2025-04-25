import { Request, Response } from 'express';
import * as leaveService from '../services/leave.service';
import { logger } from '../utils/logger';
import { sendSuccessResponse, sendErrorResponse } from '../common/response'; 
import { SuccessMessages, ErrorMessages } from'../common/statuscodes/status message';
import { HTTP_CODES } from '../common/statuscodes/httpStatusCodes'; 
export const applyLeave = async (req: Request, res: Response) => {
  try {
   // const userId = (req as any).user._id;  
    const { userId,leaveType, startDate, endDate, reason } = req.body; // Use startDate and endDate

    // Log the request
    logger.info(`User ${userId} is applying for leave of type ${leaveType} from ${startDate} to ${endDate}`);
    console.log("User ID:", userId);
    console.log("Leave Type:", leaveType);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Reason:", reason);
    
    const leave = await leaveService.applyLeave(userId, leaveType, startDate, endDate, reason);
    
   
    logger.info(`Leave applied successfully for User ${userId} of type ${leaveType} from ${startDate} to ${endDate}`);

    
    sendSuccessResponse(res, SuccessMessages.APPLICATION_SUBMITTED, leave, HTTP_CODES.CREATED);
  } catch (error) {
    
    logger.error(`Error applying leave for User ${(req as any).user._id}: ${(error as Error).message}`);
    
    sendErrorResponse(res, (error as Error).message, HTTP_CODES.BAD_REQUEST);
  }
};

export const getLeaves = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { type, page, limit } = req.query;

    logger.info(`User ${userId} is fetching leaves with filters: type=${type}, page=${page}, limit=${limit}`);

    const result = await leaveService.getLeaves(userId, type as string, parseInt(page as string), parseInt(limit as string));
   
    logger.info(`User ${userId} fetched ${result.leaves.length} leave(s)`);

    sendSuccessResponse(res, SuccessMessages.APPLICATION_SUBMITTED, result, HTTP_CODES.OK);
  } catch (error) {
    
    logger.error(`Error fetching leaves for User ${(req as any).user._id}: ${(error as Error).message}`);
   
    sendErrorResponse(res, (error as Error).message, HTTP_CODES.BAD_REQUEST);
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const leaveId = req.params.leaveId;

    logger.info(`User ${(req as any).user._id} is fetching leave details for leave ID: ${leaveId}`);

    const leave = await leaveService.getLeaveById(leaveId);
    if (!leave) {
      sendErrorResponse(res, ErrorMessages.NOT_FOUND, HTTP_CODES.NOT_FOUND);
      return;
    }

    // Log successful
    logger.info(`Leave details for User ${(req as any).user._id} retrieved successfully`);
    sendSuccessResponse(res, SuccessMessages.APPLICATION_SUBMITTED, leave, HTTP_CODES.OK);
  } catch (error) {
    logger.error(`Error fetching leave details for User ${(req as any).user._id} and leave ID ${req.params.leaveId}: ${(error as Error).message}`);
    sendErrorResponse(res, (error as Error).message, HTTP_CODES.BAD_REQUEST);
  }
};



// import { Request, Response } from 'express';
// import * as leaveService from '../services/leave.service';
// import { logger } from '../utils/logger';

// export const applyLeave = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user._id;
//     const { type, date, reason } = req.body;

//     // Log the leave application attempt
//     logger.info(`User ${userId} is applying for leave of type ${type} on ${date}`);

//     const leave = await leaveService.applyLeave(userId, type, date, reason);
    
//     logger.info(`Leave applied successfully for User ${userId} of type ${type} on ${date}`);

//     res.status(201).json({ message: 'Leave applied successfully', leave });
//   } catch (error) {
//     // Log the error when leave application fails
//     logger.error(`Error applying leave for User ${(req as any).user._id}: ${(error as Error).message}`);
//     res.status(400).json({ message: (error as Error).message });
//   }
// };

// export const getLeaves = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user._id;
//     const { type, page, limit } = req.query;

//     // Log the request to fetch leaves
//     logger.info(`User ${userId} is fetching leaves with filters: type=${type}, page=${page}, limit=${limit}`);

//     const result = await leaveService.getLeaves(userId, type as string, parseInt(page as string), parseInt(limit as string));
    
//     // Log the result of the leaves fetch
//     logger.info(`User ${userId} fetched ${result.leaves.length} leave(s)`);

//     res.status(200).json(result);
//   } catch (error) {
//     // Log the error if fetching leaves fails
//     logger.error(`Error fetching leaves for User ${(req as any).user._id}: ${(error as Error).message}`);
//     res.status(400).json({ message: (error as Error).message });
//   }
// };

// export const getLeaveById = async (req: Request, res: Response) => {
//   try {
//     const leaveId = req.params.leaveId;

//     // Log the request to fetch leave by ID
//     logger.info(`User ${(req as any).user._id} is fetching leave details for leave ID: ${leaveId}`);

//     const leave = await leaveService.getLeaveById(leaveId);
//     if (!leave) {
//       res.status(404).json({ message: 'Leave not found' });
//       return;
//     }

//     // Log successful retrieval of leave
//     logger.info(`Leave details for User ${(req as any).user._id} retrieved successfully`);

//     res.status(200).json({ leave });
//   } catch (error) {
//     // Log the error if retrieving leave fails
//     logger.error(`Error fetching leave details for User ${(req as any).user._id} and leave ID ${req.params.leaveId}: ${(error as Error).message}`);
//     res.status(400).json({ message: (error as Error).message });
//   }
// };
