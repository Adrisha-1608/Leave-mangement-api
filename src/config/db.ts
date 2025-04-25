import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // MongoDB URI - you can use a fallback or from environment variable
    const connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/leave_management';
    
    // Connecting to MongoDB without deprecated options
    await mongoose.connect(connectionString);
    
    // Log successful connection
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    // Log error and terminate the process if connection fails
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

// Export the DB connection function
export default connectDB;
