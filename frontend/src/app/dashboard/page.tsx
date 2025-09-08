'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Definindo a "forma" dos dados da campanha
interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Pega o token salvo no login
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Token não encontrado. Faça o login novamente.');
        setIsLoading(false);
        return;
      }

      try {
        // Faz a chamada para o nosso novo endpoint no backend
        const response = await axios.get('http://localhost:3333/api/dashboard/campaigns', {
          headers: {
            Authorization: `Bearer ${token}`, // <-- Autenticação!
          },
        });
        setCampaigns(response.data);
      } catch (err) {
        setError('Falha ao buscar os dados das campanhas.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  if (isLoading) {
    return <p>Carregando dados...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
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
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.status}</TableCell>
                  <TableCell>{campaign.objective}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}   