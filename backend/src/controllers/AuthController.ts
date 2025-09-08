import { Request, Response } from "express";
import AuthService from "../services/AuthService";

class AuthController {
  async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const authService = new AuthService();

    try {
      const { token } = await authService.execute({ email, password });
      return response.json({ token });
    } catch (error) {
      if (error instanceof Error) {
        return response.status(401).json({ error: error.message });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  }
}

export default AuthController;
