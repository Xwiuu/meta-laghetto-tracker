import { Request, Response } from "express";
import knex from "../database/knex";
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicialização do Gemini AI
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error(
    "Chave API do gemini não encontrada. Verifique suas variáveis de ambiente."
  );
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Constante para o Orçamento Mensal
const MONTHLY_BUDGET = 20000;

class DashboardController {
  /**
   * Busca os KPIs principais, tanto para o período selecionado quanto para o orçamento mensal.
   */
  public async getKpis(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;

      // --- 1. Cálculos para o Período Selecionado no Calendário ---
      const dateFilteredQuery = knex("daily_metrics");
      if (startDate && endDate) {
        dateFilteredQuery.whereBetween("metric_date", [
          startDate as string,
          endDate as string,
        ]);
      }

      const kpisDoPeriodo = await dateFilteredQuery
        .sum({ totalSpendCents: "spend_cents" })
        .avg({ averageRoas: "roas_value" })
        .sum({ totalLeads: "leads" })
        .first();

      const totalSpendPeriodo =
        (Number(kpisDoPeriodo?.totalSpendCents) || 0) / 100;
      const totalLeadsPeriodo = Number(kpisDoPeriodo?.totalLeads) || 0;
      const cpaMedioPeriodo =
        totalLeadsPeriodo > 0 ? totalSpendPeriodo / totalLeadsPeriodo : 0;

      // --- 2. Cálculos Fixos para o Orçamento (Sempre do Mês Atual) ---
      const today = new Date();
      const primeiroDiaDoMes = startOfMonth(today);
      const ultimoDiaDoMes = endOfMonth(today);

      const gastoMensalResult = await knex("daily_metrics")
        .whereBetween("metric_date", [primeiroDiaDoMes, ultimoDiaDoMes])
        .sum({ monthlySpendCents: "spend_cents" })
        .first();

      const gastoHojeResult = await knex("daily_metrics")
        .whereRaw("metric_date = CURRENT_DATE") // Forma mais segura de pegar a data de "hoje"
        .sum({ todaySpendCents: "spend_cents" })
        .first();

      const diasNoMes = getDaysInMonth(today);
      const gastoDiarioPlanejado = MONTHLY_BUDGET / diasNoMes;

      // --- 3. Monta o Objeto de Resposta Final ---
      const responseData = {
        period: {
          totalSpend: totalSpendPeriodo,
          averageRoas: Number(kpisDoPeriodo?.averageRoas || 0).toFixed(2),
          averageCpa: cpaMedioPeriodo,
        },
        budget: {
          monthlyBudget: MONTHLY_BUDGET,
          monthlySpend:
            (Number(gastoMensalResult?.monthlySpendCents) || 0) / 100,
          todaySpend: (Number(gastoHojeResult?.todaySpendCents) || 0) / 100,
          plannedDailySpend: gastoDiarioPlanejado,
        },
      };

      return res.json(responseData);
    } catch (error) {
      console.error("Erro ao buscar KPIs:", error);
      return res.status(500).json({ message: "Erro ao buscar KPIs" });
    }
  }

  /**
   * Busca as campanhas que tiveram atividade no período selecionado.
   */
  public async getCampaigns(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      const campaignsQuery = knex("campaigns").orderBy("name", "asc");

      if (startDate && endDate) {
        campaignsQuery.whereIn("id", function () {
          this.distinct("campaign_id")
            .from("daily_metrics")
            .whereBetween("metric_date", [
              startDate as string,
              endDate as string,
            ]);
        });
      }
      const campaigns = await campaignsQuery;
      return res.json(campaigns);
    } catch (error) {
      console.error("Erro ao buscar Campanhas:", error);
      return res.status(500).json({ message: "Erro ao buscar Campanhas" });
    }
  }

  /**
   * Busca e formata os dados diários para o gráfico de performance.
   */
  public async getChartData(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      const query = knex("daily_metrics")
        .select(knex.raw("metric_date::date"))
        .sum({ total_spend_cents: "spend_cents" })
        .avg({ average_roas: "roas_value" })
        .groupBy("metric_date")
        .orderBy("metric_date", "asc");

      if (startDate && endDate) {
        query.whereBetween("metric_date", [
          startDate as string,
          endDate as string,
        ]);
      }

      const data = (await query) as {
        metric_date: Date;
        total_spend_cents: string;
        average_roas: string;
      }[];

      const formattedData = data.map((row) => ({
        date: format(new Date(row.metric_date), "dd/MM"),
        Gasto: Number(row.total_spend_cents || 0) / 100,
        ROAS: parseFloat(Number(row.average_roas || 0).toFixed(2)),
      }));
      return res.json(formattedData);
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar dados do gráfico" });
    }
  }

  /**
   * Busca os detalhes de gastos diários para o relatório.
   */
  public async getDailyDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      const query = knex("daily_metrics")
        .join("campaigns", "daily_metrics.campaign_id", "=", "campaigns.id")
        .select(
          "daily_metrics.metric_date",
          "campaigns.name as campaign_name",
          "daily_metrics.spend_cents",
          "daily_metrics.clicks",
          "daily_metrics.cpc_cents",
          "daily_metrics.roas_value"
        )
        .orderBy("metric_date", "desc");

      if (startDate && endDate) {
        query.whereBetween("metric_date", [
          startDate as string,
          endDate as string,
        ]);
      }
      const data = await query;
      return res.json(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes diários:", error);
      return res
        .status(500)
        .json({ message: "Erro ao buscar detalhes diários" });
    }
  }

  /**
   * Gera um insight automatizado usando a IA do Gemini.
   */
  public async getAiInsight(req: Request, res: Response): Promise<Response> {
    try {
      const { startDate, endDate } = req.query;
      const query = knex("daily_metrics");
      if (startDate && endDate) {
        query.whereBetween("metric_date", [
          startDate as string,
          endDate as string,
        ]);
      }

      type CampaignPerformance = {
        name: string;
        totalSpend: string;
        averageRoas: string;
        totalClicks: string;
        totalLeads: string;
      };

      const campaignPerformance = (await query
        .join("campaigns", "daily_metrics.campaign_id", "=", "campaigns.id")
        .select("campaigns.name")
        .sum({ totalSpend: "spend_cents" })
        .avg({ averageRoas: "roas_value" })
        .sum({ totalClicks: "clicks" })
        .sum({ totalLeads: "leads" })
        .groupBy("campaigns.name")) as CampaignPerformance[];

      if (campaignPerformance.length === 0) {
        return res.json({
          insight: "Não há dados suficientes para gerar um insight.",
        });
      }

      const typedPerformanceData = campaignPerformance.map((c) => ({
        name: c.name,
        totalSpend: Number(c.totalSpend || 0),
        averageRoas: Number(c.averageRoas || 0),
        totalClicks: Number(c.totalClicks || 0),
        totalLeads: Number(c.totalLeads || 0),
      }));

      const prompt = `
        Você é um analista de marketing digital sênior da rede de hotéis Laghetto. 
        Sua tarefa é analisar os dados de performance de diferentes tipos de campanhas e gerar um insight acionável em uma única frase, focando no que foi mais relevante no período.

        Contexto das campanhas Laghetto:
        - Campanhas de 'Vendas' focam em ROAS.
        - Campanhas de 'Tráfego' focam em gerar cliques a um baixo CPC.
        - Campanhas de 'Geração de Cadastros' focam em gerar leads a um baixo CPA.

        Dados do período para análise:
        ${JSON.stringify(
          typedPerformanceData.map((c) => ({
            nome_campanha: c.name,
            gasto_total_reais: (c.totalSpend / 100).toFixed(2),
            roas_medio: c.averageRoas.toFixed(2),
            leads_totais: c.totalLeads,
            cpa_reais:
              c.totalLeads > 0
                ? (c.totalSpend / 100 / c.totalLeads).toFixed(2)
                : "0.00",
          })),
          null,
          2
        )}

        Qual o insight mais importante? Seja conciso e foque na performance (boa ou má) mais relevante.
      `;

      let insightText =
        "O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.";

      try {
        console.log("Enviando prompt inteligente para a API do Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        insightText = response.text();
        console.log("Insight recebido do Gemini:", insightText);
      } catch (geminiError) {
        console.warn(
          "AVISO: A chamada para a API do Gemini falhou, a usar mensagem padrão.",
          geminiError
        );
      }

      return res.json({ insight: insightText });
    } catch (error) {
      console.error("Erro ao preparar dados para o insight:", error);
      return res
        .status(500)
        .json({ message: "Erro ao preparar dados para a IA" });
    }
  }
}

export default DashboardController;
