import axios from "axios";
import "dotenv/config";
import pool from "../database";
import knex from "../database/knex";

const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID;
const graphApiUrl = "https://graph.facebook.com/v20.0";

interface IMetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
}

interface IMetaCampaign {
  campaign_id: string;
  spend: string;
  clicks: string;
  cpc: string;
  ctr: string;
  cpm: string;
  purchase_roas?: { value: string }[];
  date_start: string;
}

class MetaSyncService {
  public async syncCampaigns() {
    console.log("Buscando campanhas na API do Meta...");

    if (!accessToken || !adAccountId) {
      throw new Error("Credenciais da API do Meta não encontradas no .env");
    }

    try {
      // 1. BUSCAR OS DADOS DA API DO META
      const response = await axios.get(
        `${graphApiUrl}/${adAccountId}/campaigns`,
        {
          params: {
            access_token: accessToken,
            fields: "id,name,status,objective,created_time",
            filtering: `[{field: "effective_status", operator: "IN", value: ["ACTIVE", "PAUSED"]}]`,
          },
        }
      );

      const campaignsFromMeta: IMetaCampaign[] = response.data.data;
      console.log(`${campaignsFromMeta.length} campanhas encontradas na API.`);

      if (campaignsFromMeta.length === 0) {
        console.log("Nenhuma campanha para sincronizar.");
        return;
      }

      // 2. FORMATAR OS DADOS PARA O NOSSO BANCO DE DADOS
      const campaignsToInsert = campaignsFromMeta.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.objective,
        created_time: campaign.created_time,
      }));

      // 3. SALVAR NO BANCO DE DADOS USANDO O KNEX
      console.log("Salvando campanhas no banco de dados...");
      await knex("campaigns")
        .insert(campaignsToInsert)
        .onConflict("id")
        .merge();

      console.log("✅ Campanhas sincronizadas e salvas com sucesso!");
    } catch (error: any) {
      console.error(
        "❌ Erro ao sincronizar campanhas:",
        error.response?.data?.error || error.message
      );
      throw new Error("Falha ao sincronizar campanhas.");
    }
  }
  public async syncInsights() {
    console.log("Buscando insights na API do Meta...");

    if (!accessToken || !adAccountId) {
      throw new Error("Credenciais da API do Meta não encontradas no .env");
    }
    try {
      // 1. BUSCAR DADOS DE PERFORMACE
      const response = await axios.get(
        `${graphApiUrl}/${adAccountId}/insights`,
        {
          params: {
            access_token: accessToken,
            level: "campaign",
            time_increment: 1,
            time_range: { since: "2023-08-01", until: "2023-09-05" },
            fields:
              "campaign_id,spend,clicks,cpc,ctr,cpm,purchase_roas,date_start",
          },
        }
      );

      const insightsFromMeta: IMetaCampaign[] = response.data.data;
      console.log(
        `${insightsFromMeta.length} registros de insights encontrados na API.`
      );

      if (insightsFromMeta.length === 0) {
        console.log("Nenhum insight para sincronizar.");
        return;
      }
      // 2. FORMATAR OS DADOS PARA O NOSSO BANCO DE DADOS
      const insightToInsert = insightsFromMeta.map((insight) => ({
        metric_date: insight.date_start,
        campaign_id: insight.campaign_id,
        spend_cents: Math.round(parseFloat(insight.spend || "0") * 100),
        clicks: parseInt(insight.clicks || "0", 10),
        cpc_cents: Math.round(parseFloat(insight.cpc || "0") * 100),
        ctr: parseFloat(insight.ctr || "0"),
        cpm_cents: Math.round(parseFloat(insight.cpm || "0") * 100),
        roas_value: insight.purchase_roas
          ? parseFloat(insight.purchase_roas[0].value)
          : 0,
      }));
      // 3. SALVAR NO BANCO DE DADOS USANDO O KNEX
      console.log("Salvando insights no banco de dados...");
      await knex("daily_metrics")
        .insert(insightToInsert)
        .onConflict(["metric_date", "campaign_id"])
        .merge();
      console.log("✅ Insights sincronizados e salvos com sucesso!");
    } catch (error: any) {
      console.error(
        "❌ Erro ao sincronizar insights:",
        error.response?.data?.error || error.message
      );
      throw new Error("Falha ao sincronizar insights.");
    }
  }
}

export default MetaSyncService;
