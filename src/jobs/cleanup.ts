import mongoose from 'mongoose';
import redisClient from '../config/redis'; 
import { logger } from '../utils/logger'; 

export const cleanup = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');

    await redisClient.quit();
    logger.info('Redis connection closed.');

    logger.info('Cleanup completed successfully.');

  } catch (err) {
    logger.error(`Error during cleanup: ${(err as Error).message}`);
  }
};
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, starting cleanup...');
  cleanup().then(() => {
    logger.info('Cleanup finished, shutting down the application.');
    process.exit(0); 
  }).catch((err) => {
    logger.error(`Cleanup failed: ${(err as Error).message}`);
    process.exit(1); 
  });
};
process.on('SIGINT', gracefulShutdown); 
process.on('SIGTERM', gracefulShutdown); 

