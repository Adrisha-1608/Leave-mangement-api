import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendSuccessResponse, sendErrorResponse } from '../common/response'; 
import { SuccessMessages, ErrorMessages } from '../common/statuscodes/status message';
import { HTTP_CODES } from '../common/statuscodes/httpStatusCodes'; 
export interface User {
  _id: string;
  email: string; 
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Send error response if the authorization header is missing or malformed
    sendErrorResponse(res, ErrorMessages.AUTHORIZATION_MISSING, HTTP_CODES.UNAUTHORIZED);
    return;
  }

  const token = authHeader.split(' ')[1];
  const realToken = process.env.JWT_SECRET!;

  try {
    // Decode the token using JWT
    const decoded = jwt.verify(token, realToken) as User; 
    req.user = decoded; 
    next();
  } catch (err) {
    sendErrorResponse(res, ErrorMessages.INVALID_TOKEN, HTTP_CODES.UNAUTHORIZED);
    return;
  }
};

