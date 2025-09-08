import { Router } from "express";
import AuthController from "../controllers/AuthController";

const authRoutes = Router();

const authControllerInstance = new AuthController();

authRoutes.post("/login", authControllerInstance.login);

export default authRoutes;
