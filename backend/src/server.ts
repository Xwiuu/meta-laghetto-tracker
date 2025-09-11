import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import syncRoutes from './routes/sync.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);

export { app };