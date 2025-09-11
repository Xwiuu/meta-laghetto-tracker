import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';

console.log('--- O ARQUIVO dashboard.routes.ts FOI CARREGADO ---');

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get('/kpis', dashboardController.getKpis);
dashboardRoutes.get('/campaigns', dashboardController.getCampaigns);
dashboardRoutes.get('/chart', dashboardController.getChartData);
dashboardRoutes.get('/ai-insight', dashboardController.getAiInsight);
dashboardRoutes.get('/daily-details', dashboardController.getDailyDetails);

export default dashboardRoutes;