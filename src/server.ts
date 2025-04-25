import mongoose from 'mongoose';
import app from './app';
import {logger} from './utils/logger'; // Corrected the import for the logger

const PORT = process.env.PORT || 2000;
const MONGO_URI = process.env.MONGO_URI || ''; // Ensure you have your MongoDB URI in environment variables

mongoose.connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`); 
    });
  })
  .catch(err => {
    logger.error(`DB connection error: ${(err as Error).message}`); // Log MongoDB connection errors
  });

