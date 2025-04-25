import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../config/jwt';
import redisClient from '../config/redis';
import { generateOTP } from '../utils/otp';
import { getUserProfile, updateProfile as updateUserProfile, UpdateUserDto } from '../services/user.service';  
import { logger } from '../utils/logger';  
import { sendSuccessResponse, sendErrorResponse } from '../common/response'; // Import response utility
import { SuccessMessages, ErrorMessages } from'../common/statuscodes/status message';; 
import { HTTP_CODES } from '../common/statuscodes/httpStatusCodes'; // Import HTTP status codes

const OTP_EXPIRY = 60 * 5;

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });

    if (existing) {
      logger.warn(`Signup attempt failed: Email already registered - ${email}`);
      sendErrorResponse(res, ErrorMessages.USER_EXISTS, HTTP_CODES.BAD_REQUEST);
      return;
    }

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed });

    logger.info(`User created successfully: ${user._id}`);

    sendSuccessResponse(res, SuccessMessages.REGISTERED, { userId: user._id }, HTTP_CODES.CREATED);
  } catch (err) {
    logger.error(`Signup failed: ${(err as Error).message}`);
    sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Login attempt failed: User not found - ${email}`);
      sendErrorResponse(res, ErrorMessages.INVALID_CREDENTIALS, HTTP_CODES.BAD_REQUEST);
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      logger.warn(`Login attempt failed: Incorrect password for user - ${email}`);
      sendErrorResponse(res, ErrorMessages.INVALID_CREDENTIALS, HTTP_CODES.BAD_REQUEST);
      return;
    }

    //const token = generateToken({ userId: user._id });
    const token = generateToken({ _id: user._id });

    logger.info(`Login successful for user: ${user._id}`);

    sendSuccessResponse(res, SuccessMessages.LOGGED_IN, { token }, HTTP_CODES.OK);
  } catch (err) {
    logger.error(`Login failed: ${(err as Error).message}`);
    sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`Forgot password attempt failed: User not found - ${email}`);
    return sendErrorResponse(res, ErrorMessages.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
  }

  const otp = generateOTP();
  await redisClient.setEx(`otp:${email}`, OTP_EXPIRY, otp);

  // In real app, send OTP via email/SMS here
  logger.info(`OTP sent for password reset to: ${email}`);
  
  return sendSuccessResponse(res, SuccessMessages.NOTIFICATION_SENT, { otp }, HTTP_CODES.OK);  // Return OTP only for dev/debug
};

export const sendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    logger.warn(`OTP send failed: User not found - ${email}`);
    return sendErrorResponse(res, ErrorMessages.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
  }

  const otp = generateOTP();
  await redisClient.setEx(`otp:${email}`, OTP_EXPIRY, otp);

  logger.info(`OTP resent for password reset to: ${email}`);

  return sendSuccessResponse(res, SuccessMessages.NOTIFICATION_SENT, { otp }, HTTP_CODES.OK);
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  const cachedOtp = await redisClient.get(`otp:${email}`);

  if (!cachedOtp) {
    logger.warn(`OTP verification failed: OTP expired or not found for email - ${email}`);
    return sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.BAD_REQUEST);
  }

  if (cachedOtp !== otp) {
    logger.warn(`OTP verification failed: Invalid OTP for email - ${email}`);
    return sendErrorResponse(res, ErrorMessages.INVALID_CREDENTIALS, HTTP_CODES.BAD_REQUEST);
  }

  const hashed = await hashPassword(newPassword);
  await User.findOneAndUpdate({ email }, { password: hashed });

  await redisClient.del(`otp:${email}`); // Invalidate OTP after use

  logger.info(`Password reset successfully for email: ${email}`);

  return sendSuccessResponse(res, SuccessMessages.NOTIFICATION_SENT, {}, HTTP_CODES.OK);
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;  // Extract userId from the authenticated request (JWT verified)
    
    if (!userId) {
      logger.warn('User ID not found in token during profile fetch');
      sendErrorResponse(res, ErrorMessages.FORBIDDEN, HTTP_CODES.UNAUTHORIZED);
      return;
    }

    // Passing all 3 arguments to getUserProfile function
    const user = await getUserProfile(userId, req, res);  // Passing userId, req, and res

    if (!user) {
      logger.warn(`User profile not found: ${userId}`);
      sendErrorResponse(res, ErrorMessages.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
      return;
    }

    logger.info(`User profile retrieved successfully for User: ${userId}`);

    sendSuccessResponse(res, SuccessMessages.REGISTERED, { user }, HTTP_CODES.OK);
  } catch (err) {
    logger.error(`Failed to retrieve user profile: ${(err as Error).message}`);
    sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;  // Extract userId from the authenticated request (JWT verified)
    const userData: UpdateUserDto = req.body;  // Extract the user data from request body
  
    if (!userId) {
      logger.warn('User ID is missing during profile update');
      sendErrorResponse(res, ErrorMessages.FORBIDDEN, HTTP_CODES.BAD_REQUEST);
      return;
    }

    const updatedUser = await updateUserProfile(userId, userData);

    if (!updatedUser) {
      logger.warn(`User not found for update: ${userId}`);
      sendErrorResponse(res, ErrorMessages.USER_NOT_FOUND, HTTP_CODES.NOT_FOUND);
      return;
    }

    logger.info(`User profile updated successfully for User: ${userId}`);

    sendSuccessResponse(res, SuccessMessages.APPLICATION_SUBMITTED, { user: updatedUser }, HTTP_CODES.OK);
  } catch (err) {
    logger.error(`Failed to update user profile for User: ${(req as any).user._id}, Error: ${(err as Error).message}`);
    sendErrorResponse(res, ErrorMessages.INTERNAL_ERROR, HTTP_CODES.INTERNAL_SERVER_ERROR);
  }
};



// import { Request, Response } from 'express';
// interface AuthenticatedRequest extends Request {
//   userId?: string;
// }
// import { User } from '../models/user.model';
// import { hashPassword, comparePassword } from '../utils/hash';
// import { generateToken } from '../config/jwt';
// import redisClient from '../config/redis';
// import { generateOTP } from '../utils/otp';
// import { authMiddleware } from '../middleware/auth.middleware';
// import { getUserProfile, updateProfile as updateUserProfile, UpdateUserDto } from '../services/user.service';  // Import the functions from the user service
// import { logger } from '../utils/logger';  // Import the logger

// const OTP_EXPIRY = 60 * 5;

// export const signup = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, email, password } = req.body;
//     const existing = await User.findOne({ email });

//     if (existing) {
//       logger.warn(`Signup attempt failed: Email already registered - ${email}`);
//       res.status(400).json({ message: 'Email already registered' });
//       return;
//     }

//     const hashed = await hashPassword(password);
//     const user = await User.create({ name, email, password: hashed });

//     logger.info(`User created successfully: ${user._id}`);

//     res.status(201).json({ message: 'User created successfully', userId: user._id });
//   } catch (err) {
//     logger.error(`Signup failed: ${(err as Error).message}`);
//     res.status(500).json({ message: 'Signup failed', error: (err as Error).message });
//   }
// };

// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       logger.warn(`Login attempt failed: User not found - ${email}`);
//       res.status(400).json({ message: 'Invalid credentials' });
//       return;
//     }

//     const isMatch = await comparePassword(password, user.password);
//     if (!isMatch) {
//       logger.warn(`Login attempt failed: Incorrect password for user - ${email}`);
//       res.status(400).json({ message: 'Invalid credentials' });
//       return;
//     }

//     const token = generateToken({ userId: user._id });
//     logger.info(`Login successful for user: ${user._id}`);

//     res.status(200).json({ message: 'Login successful', token });
//   } catch (err) {
//     logger.error(`Login failed: ${(err as Error).message}`);
//     res.status(500).json({ message: 'Login failed', error: (err as Error).message });
//   }
// };

// export const forgetPassword = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
  
//   if (!user) {
//     logger.warn(`Forgot password attempt failed: User not found - ${email}`);
//     return res.status(404).json({ message: 'User not found' });
//   }

//   const otp = generateOTP();
//   await redisClient.setEx(`otp:${email}`, OTP_EXPIRY, otp);
  
//   // In real app, send OTP via email/SMS here
//   logger.info(`OTP sent for password reset to: ${email}`);
  
//   return res.status(200).json({ message: 'OTP sent successfully', otp });  // Return OTP only for dev/debug
// };

// export const sendOTP = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });
  
//   if (!user) {
//     logger.warn(`OTP send failed: User not found - ${email}`);
//     return res.status(404).json({ message: 'User not found' });
//   }

//   const otp = generateOTP();
//   await redisClient.setEx(`otp:${email}`, OTP_EXPIRY, otp);
  
//   logger.info(`OTP resent for password reset to: ${email}`);

//   return res.status(200).json({ message: 'OTP resent successfully', otp });
// };

// export const verifyOTP = async (req: Request, res: Response) => {
//   const { email, otp, newPassword } = req.body;
//   const cachedOtp = await redisClient.get(`otp:${email}`);

//   if (!cachedOtp) {
//     logger.warn(`OTP verification failed: OTP expired or not found for email - ${email}`);
//     return res.status(400).json({ message: 'OTP expired or not found' });
//   }

//   if (cachedOtp !== otp) {
//     logger.warn(`OTP verification failed: Invalid OTP for email - ${email}`);
//     return res.status(400).json({ message: 'Invalid OTP' });
//   }

//   const hashed = await hashPassword(newPassword);
//   await User.findOneAndUpdate({ email }, { password: hashed });

//   await redisClient.del(`otp:${email}`); // Invalidate OTP after use

//   logger.info(`Password reset successfully for email: ${email}`);

//   return res.status(200).json({ message: 'Password reset successfully' });
// };

// export const getProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const userId = (req as any).user.userId;  // Extract userId from the authenticated request (JWT verified)
    
//     if (!userId) {
//       logger.warn('User ID not found in token during profile fetch');
//       res.status(401).json({ message: 'User ID not found in token' });
//       return;
//     }

//     // Passing all 3 arguments to getUserProfile function
//     const user = await getUserProfile(userId, req, res);  // Passing userId, req, and res

//     if (!user) {
//       logger.warn(`User profile not found: ${userId}`);
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     logger.info(`User profile retrieved successfully for User: ${userId}`);

//     res.status(200).json({ user });
//   } catch (err) {
//     logger.error(`Failed to retrieve user profile: ${(err as Error).message}`);
//     res.status(500).json({ message: 'Failed to retrieve user profile', error: (err as Error).message });
//   }
// };

// export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//   try {
//     const userId = req.userId;  // Extract userId from the authenticated request (JWT verified)
//     const userData: UpdateUserDto = req.body;  // Extract the user data from request body
  
//     if (!userId) {
//       logger.warn('User ID is missing during profile update');
//       res.status(400).json({ message: 'User ID is required' });
//       return;
//     }

//     const updatedUser = await updateUserProfile(userId, userData);

//     if (!updatedUser) {
//       logger.warn(`User not found for update: ${userId}`);
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     logger.info(`User profile updated successfully for User: ${userId}`);

//     res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
//   } catch (err) {
//     logger.error(`Failed to update user profile for User: ${(req as any).user._id}, Error: ${(err as Error).message}`);
//     res.status(500).json({ message: 'Failed to update user profile', error: (err as Error).message });
//   }
// };
