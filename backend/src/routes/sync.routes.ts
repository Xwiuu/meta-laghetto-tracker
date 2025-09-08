import { Router } from "express";
import SyncController from "../controllers/SyncController";

const syncRoutes = Router();
const syncController = new SyncController();

syncRoutes.post("/campaigns", syncController.syncAll);

export default syncRoutes;
