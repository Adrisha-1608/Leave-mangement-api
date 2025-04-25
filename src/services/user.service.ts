import { Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

import { User } from '../models/user.model';  
import { hashPassword, comparePassword } from '../utils/hash'; 
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '../common/response'; // Import response utility
import { SuccessMessages, ErrorMessages } from'../common/statuscodes/status message';
import { HTTP_CODES } from '../common/statuscodes/httpStatusCodes'; // Importing HTTP status codes

export const getUserProfile = async (userId: string, req: Request, res: Response) => {
    try {
     
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        sendErrorResponse(res, ErrorMessages.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
        return null;
      }
      
      return user;  
    } catch (err) {
      sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
      return null; 
    }
  };
  
export const updateProfile = async (userId: string, userData: UpdateUserDto): Promise<User | null> => {
    try {
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true }).select('-password');
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to update user profile');
      }
      throw new Error('Failed to update user profile');
    }
  };
export const verifyPassword = async (storedPassword: string, providedPassword: string): Promise<boolean> => {
    const isMatch = await comparePassword(providedPassword, storedPassword);
    return isMatch;
  };
