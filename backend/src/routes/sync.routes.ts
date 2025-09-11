import { Router } from 'express';
import SyncController from '../controllers/SyncController';

const syncRoutes = Router();
const syncController = new SyncController();

// A rota chama o método syncAll
syncRoutes.post('/campaigns', syncController.syncAll);

export default syncRoutes;