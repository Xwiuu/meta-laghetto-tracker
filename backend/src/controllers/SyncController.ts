import { Request, Response } from "express";
import MetaSyncService from "../services/MetaSyncService";

class SyncController {
  public async syncAll(
    request: Request,
    response: Response
  ): Promise<Response> {
    const metaSyncService = new MetaSyncService();
    try {
      await metaSyncService.syncCampaigns();
      await metaSyncService.syncInsights();

      return response
        .status(200)
        .json({ message: "Sincronização completa concluída com sucesso." });
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Erro durante a sincronização." });
    }
  }
}

export default SyncController;
