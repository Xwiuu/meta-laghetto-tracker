import { Request, Response } from 'express';
import knex from '../database/knex';

class DashboardController {
  public async getKpis(req: Request, res: Response): Promise<Response> {
    const kpis = { totalSpend: 12345, roas: 4.5 };
    return res.json(kpis);
  }

  public async getCampaigns(req: Request, res: Response): Promise<Response> {
    const campaigns = await knex('campaigns').select('*');
    return res.json(campaigns);
  }
}

export default DashboardController;