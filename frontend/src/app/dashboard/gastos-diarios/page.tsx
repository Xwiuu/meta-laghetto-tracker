"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useDate } from "@/context/DateContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interface SIMPLIFICADA
interface DailyDetail {
  metric_date: string;
  campaign_name: string;
  spend_cents: number;
  clicks: number;
  cpc_cents: number;
  roas_value: number;
}

interface GroupedData {
  [date: string]: DailyDetail[];
}

export default function DailySpendingPage() {
  const { date } = useDate();
  const [data, setData] = useState<DailyDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!date?.from || !date?.to) return;
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Token não encontrado.");
        setIsLoading(false);
        return;
      }

      const apiHeaders = { headers: { Authorization: `Bearer ${token}` } };
      const params = {
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      };

      try {
        const response = await axios.get(
          "http://localhost:3333/api/dashboard/daily-details",
          { ...apiHeaders, params }
        );
        setData(response.data);
        setError("");
      } catch (err) {
        setError("Falha ao buscar os dados.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const groupedData = useMemo(() => {
    return data.reduce((acc: GroupedData, row: DailyDetail) => {
      const dateKey = format(new Date(row.metric_date), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(row);
      return acc;
    }, {} as GroupedData);
  }, [data]);

  const sortedDates = Object.keys(groupedData).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Relatório de Gastos Diários</h1>

      {isLoading ? (
        <p>Carregando dados...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Dia e Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Campanha</TableHead>
                  <TableHead className="text-right">Gasto (R$)</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">CPC (R$)</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum dado encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                )}
                {sortedDates.map((dateKey) => {
                  const dayData = groupedData[dateKey];

                  // A CORREÇÃO ESTÁ AQUI: Usamos Number() para garantir a soma correta
                  const dailyTotalSpend = dayData.reduce(
                    (sum: number, row: DailyDetail) =>
                      sum + Number(row.spend_cents),
                    0
                  );
                  const dailyTotalClicks = dayData.reduce(
                    (sum: number, row: DailyDetail) => sum + Number(row.clicks),
                    0
                  );

                  return (
                    <>
                      <TableRow
                        key={dateKey}
                        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50"
                      >
                        <TableCell
                          colSpan={5}
                          className="font-bold text-lg text-gray-800 dark:text-gray-200"
                        >
                          {format(new Date(dateKey), "dd/MM/yyyy")}
                        </TableCell>
                      </TableRow>
                      {dayData.map((row: DailyDetail, index: number) => (
                        <TableRow key={`${dateKey}-${index}`}>
                          <TableCell className="font-medium pl-8">
                            {row.campaign_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {(Number(row.spend_cents) / 100).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" }
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.clicks}
                          </TableCell>
                          <TableCell className="text-right">
                            {(Number(row.cpc_cents) / 100).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" }
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(row.roas_value || 0).toFixed(2)}x
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-100">
                        <TableCell className="font-bold text-right">
                          Total do Dia:
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          {(dailyTotalSpend / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell className="font-bold text-right">
                          {dailyTotalClicks}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
