"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Bot } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDate } from "@/context/DateContext";
import { useLoading } from "@/context/LoadingContext";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces de dados
interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}
interface ChartData {
  date: string;
  Gasto: number;
  ROAS: number;
}
interface Kpis {
  period: {
    totalSpend: number;
    averageRoas: string;
    averageCpa: number;
  };
  budget: {
    monthlyBudget: number;
    monthlySpend: number;
    todaySpend: number;
    plannedDailySpend: number;
  };
}

export default function DashboardPage() {
  const { date, setDate } = useDate();
  const { setIsLoading } = useLoading();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiInsight, setAiInsight] = useState("");

  const [error, setError] = useState("");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!date?.from || !date?.to) return;

      setIsLoading(true);
      setError("");
      setInitialDataLoaded(false);

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Token não encontrado. Faça o login novamente.");
        setIsLoading(false);
        return;
      }

      const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };
      const params = {
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      };

      try {
        const [campaignsResponse, kpisResponse, chartResponse] =
          await Promise.all([
            axios.get("http://localhost:3333/api/dashboard/campaigns", {
              ...apiHeaders,
              params,
            }),
            axios.get("http://localhost:3333/api/dashboard/kpis", {
              ...apiHeaders,
              params,
            }),
            axios.get("http://localhost:3333/api/dashboard/chart", {
              ...apiHeaders,
              params,
            }),
          ]);

        setCampaigns(campaignsResponse.data);
        setKpis(kpisResponse.data);
        setChartData(chartResponse.data);
        setInitialDataLoaded(true);
      } catch (err) {
        console.error("Erro ao buscar dados essenciais:", err);
        setError("Falha ao buscar os dados principais do dashboard.");
        setIsLoading(false);
        return;
      }

      try {
        const insightResponse = await axios.get(
          "http://localhost:3333/api/dashboard/ai-insight",
          { ...apiHeaders, params }
        );
        setAiInsight(insightResponse.data.insight);
      } catch (err) {
        console.warn("Aviso: Falha ao buscar o insight de IA.", err);
        setAiInsight("O serviço de IA está com instabilidade no momento.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date, setIsLoading]);

  const budgetProgress = kpis
    ? (kpis.budget.monthlySpend / kpis.budget.monthlyBudget) * 100
    : 0;
  const dailyPacing =
    kpis && kpis.budget.plannedDailySpend > 0
      ? kpis.budget.todaySpend / kpis.budget.plannedDailySpend
      : 0;
  let pacingStatus = { text: "No Ritmo", color: "text-green-600" };
  if (dailyPacing > 1.1) {
    pacingStatus = { text: "Acima do Ritmo", color: "text-red-600" };
  } else if (dailyPacing > 0 && dailyPacing < 0.9) {
    pacingStatus = { text: "Abaixo do Ritmo", color: "text-yellow-600" };
  } else if (
    kpis?.budget.todaySpend === 0 &&
    (kpis?.budget.plannedDailySpend || 0) > 0
  ) {
    pacingStatus = { text: "Sem Gasto Hoje", color: "text-gray-500" };
  }

  if (error) {
    return (
      <Card className="m-8 text-center p-8">
        <CardTitle className="text-red-600">Ocorreu um Erro</CardTitle>
        <CardDescription>{error}</CardDescription>
      </Card>
    );
  }

  if (!initialDataLoaded) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Escolha um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {aiInsight && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-300">
                Insight Automatizado
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-400">
                Análise gerada pelo Gemini.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-800 dark:text-gray-300">
              {aiInsight}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Investimento (Período)
            </CardTitle>
            <span className="text-lg">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.period.totalSpend.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS Médio</CardTitle>
            <span className="text-lg">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.period.averageRoas && kpis.period.averageRoas !== "0.00"
                ? `${kpis.period.averageRoas}x`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPA Médio</CardTitle>
            <span className="text-lg">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.period.averageCpa.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Orçamento Mensal (
              {kpis?.budget.monthlyBudget.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              )
            </CardTitle>
            <CardDescription
              className={`text-xs font-semibold ${pacingStatus.color}`}
            >
              {pacingStatus.text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {kpis?.budget.monthlySpend.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <Progress value={budgetProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Gasto hoje:{" "}
              {kpis?.budget.todaySpend.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Diária</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(value: number) =>
                  `R$${value.toLocaleString("pt-BR")}`
                }
                width={80}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value: number) => `${value}x`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Gasto")
                    return [
                      value.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }),
                      "Gasto",
                    ];
                  if (name === "ROAS") return [`${value.toFixed(2)}x`, "ROAS"];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Gasto"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Gasto (R$)"
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ROAS"
                stroke="#82ca9d"
                strokeWidth={2}
                name="ROAS (x)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campanhas no Período</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Objetivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>{campaign.status}</TableCell>
                    <TableCell>{campaign.objective}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Nenhuma campanha com dados no período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
