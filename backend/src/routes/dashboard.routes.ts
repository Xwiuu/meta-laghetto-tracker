import { Router } from 'express';
import DashboardController from '../controllers/DashboardController';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.get('/kpis', dashboardController.getKpis);
dashboardRoutes.get('/campaigns', dashboardController.getCampaigns);

export default dashboardRoutes;