import express from 'express';
import cors from 'cors'; // <-- 1. IMPORTE O CORS AQUI
import pool from './database';
import authRoutes from './routes/auth.routes';
import syncRoutes from './routes/sync.routes';
import dashboardRoutes from './routes/dashboard.routes'

const app = express();

app.use(cors()); // <-- 2. USE O CORS AQUI (antes de qualquer rota)
app.use(express.json());

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);

export { app };