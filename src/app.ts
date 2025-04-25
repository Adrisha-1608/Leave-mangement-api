import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/v1/user.routes';
import leaveRoutes from './routes/v1/leave.routes';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/users', userRoutes);
app.use('/api/user/leave', leaveRoutes);

export default app;
