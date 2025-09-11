import axios from "axios";
import "dotenv/config";
import knex from "../database/knex";
import { subDays, format } from "date-fns";

const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID;
const graphApiUrl = "https://graph.facebook.com/v20.0";

// Nossas interfaces de dados
interface IMetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
}
interface IMetaAdSet {
  id: string;
  name: string;
  status: string;
  campaign_id: string;
  daily_budget?: string;
  created_time: string;
}
interface IMetaInsight {
  campaign_id: string;
  adset_id: string;
  spend: string;
  clicks: string;
  cpc: string;
  ctr: string;
  cpm: string;
  purchase_roas?: { value: string }[];
  actions?: { action_type: string; value: string }[];
  date_start: string;
}

class MetaSyncService {
  public async syncCampaigns() {
    console.log("Buscando campanhas na API do Meta...");
    if (!accessToken || !adAccountId)
      throw new Error("Credenciais da API do Meta não encontradas no .env");

    try {
      const response = await axios.get(
        `${graphApiUrl}/${adAccountId}/campaigns`,
        {
          params: {
            access_token: accessToken,
            fields: "id,name,status,objective,created_time",
            filtering: `[{field: "effective_status", operator: "IN", value: ["ACTIVE", "PAUSED"]}]`,
            limit: 200,
          },
        }
      );
      const campaignsFromMeta: IMetaCampaign[] = response.data.data;
      if (campaignsFromMeta.length === 0)
        return console.log("Nenhuma campanha para sincronizar.");

      const campaignsToInsert = campaignsFromMeta.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        created_time: c.created_time,
      }));
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

  public async syncAdSets() {
    console.log("Buscando Conjuntos de Anúncios na API do Meta...");
    if (!accessToken || !adAccountId)
      throw new Error("Credenciais da API do Meta não encontradas.");

    try {
      const response = await axios.get(`${graphApiUrl}/${adAccountId}/adsets`, {
        params: {
          access_token: accessToken,
          fields: "id,name,status,campaign_id,daily_budget,created_time",
          limit: 200,
        },
      });
      const adSetsFromMeta: IMetaAdSet[] = response.data.data;
      if (adSetsFromMeta.length === 0)
        return console.log("Nenhum conjunto de anúncios para sincronizar.");

      const adSetsToInsert = adSetsFromMeta.map((adSet) => ({
        id: adSet.id,
        name: adSet.name,
        status: adSet.status,
        campaign_id: adSet.campaign_id,
        daily_budget_cents: adSet.daily_budget
          ? parseInt(adSet.daily_budget, 10) * 100
          : 0, // Ajuste para centavos
        created_time: adSet.created_time,
      }));
      await knex("ad_sets").insert(adSetsToInsert).onConflict("id").merge();
      console.log(
        "✅ Conjuntos de Anúncios sincronizados e salvos com sucesso!"
      );
    } catch (error: any) {
      console.error(
        "❌ Erro ao sincronizar Conjuntos de Anúncios:",
        error.response?.data?.error || error.message
      );
      throw new Error("Falha ao sincronizar Conjuntos de Anúncios.");
    }
  }

  public async syncInsights() {
    console.log(
      "Buscando insights de performance na API do Meta, dia a dia..."
    );
    if (!accessToken || !adAccountId)
      throw new Error("Credenciais da API do Meta não encontradas.");

    try {
      const existingCampaigns = await knex("campaigns").select("id");
      const existingCampaignIds = existingCampaigns.map((c) => c.id.toString());
      let allInsights: IMetaInsight[] = [];

      for (let i = 0; i < 35; i++) {
        const targetDate = subDays(new Date(), i);
        const formattedDate = format(targetDate, "yyyy-MM-dd");

        console.log(`Buscando dados para o dia: ${formattedDate}`);
        const response = await axios.get(
          `${graphApiUrl}/${adAccountId}/insights`,
          {
            params: {
              access_token: accessToken,
              level: "adset",
              time_range: { since: formattedDate, until: formattedDate },
              fields:
                "campaign_id,adset_id,spend,clicks,cpc,ctr,cpm,purchase_roas,actions,date_start",
            },
          }
        );

        if (response.data.data && response.data.data.length > 0) {
          allInsights.push(...response.data.data);
        }
      }

      console.log(
        `${allInsights.length} registros de insights encontrados no total.`
      );
      if (allInsights.length === 0)
        return console.log("Nenhum insight para sincronizar.");

      const validInsights = allInsights.filter(
        (i) =>
          i.campaign_id &&
          i.adset_id &&
          i.spend &&
          existingCampaignIds.includes(i.campaign_id)
      );
      if (validInsights.length === 0)
        return console.log("Nenhum insight válido encontrado para salvar.");

      const insightsToInsert = validInsights.map((insight) => {
        let acquisitionsCount = 0;
        if (insight.actions) {
          const acquisitionTypes = [
            "lead",
            "purchase",
            "complete_registration",
          ];
          for (const action of insight.actions) {
            if (
              acquisitionTypes.some((type) => action.action_type.includes(type))
            ) {
              acquisitionsCount += parseInt(action.value, 10);
            }
          }
        }
        return {
          metric_date: insight.date_start,
          campaign_id: insight.campaign_id,
          ad_set_id: insight.adset_id,
          spend_cents: Math.round(parseFloat(insight.spend || "0") * 100),
          clicks: parseInt(insight.clicks || "0", 10),
          cpc_cents: Math.round(parseFloat(insight.cpc || "0") * 100),
          ctr: parseFloat(insight.ctr || "0"),
          cpm_cents: Math.round(parseFloat(insight.cpm || "0") * 100),
          roas_value: insight.purchase_roas
            ? parseFloat(insight.purchase_roas[0].value)
            : 0,
          leads: acquisitionsCount,
        };
      });

      await knex("daily_metrics")
        .insert(insightsToInsert)
        .onConflict(["metric_date", "campaign_id", "ad_set_id"])
        .merge();
      console.log("✅ Insights de performance sincronizados com sucesso!");
    } catch (error: any) {
      console.error(
        "❌ Erro ao sincronizar insights:",
        error.message || error.response?.data?.error
      );
      throw new Error("Falha ao sincronizar insights.");
    }
  }
}

export default MetaSyncService;
