import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendSuccessResponse, sendErrorResponse } from '../common/response'; // Import response utility
import { SuccessMessages, ErrorMessages } from'../common/statuscodes/status message';
import { HTTP_CODES } from '../common/statuscodes/httpStatusCodes'; // Importing HTTP status codes

const leaveApplicationSchema = Joi.object({
  leaveType: Joi.string().valid('Planned Leave', 'Emergency Leave').required(),
  startDate: Joi.date().iso().greater('now').required(), // Start date must be a future date
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(), // End date must be after start date
  reason: Joi.string().optional().allow(''), // Optional, but can be an empty string
});

export const validateLeaveApplication = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = leaveApplicationSchema.validate(req.body);
  
  if (error) {
    
    sendErrorResponse(res, ErrorMessages.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST);
  } else {
    next();
  }
};

const updateLeaveSchema = Joi.object({
  leaveStatus: Joi.string().valid('Approved', 'Rejected').required(),
});

export const validateUpdateLeave = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateLeaveSchema.validate(req.body);
  
  if (error) {
    sendErrorResponse(res, ErrorMessages.MISSING_FIELDS, HTTP_CODES.BAD_REQUEST);
  } else {
    next();
  }
};
