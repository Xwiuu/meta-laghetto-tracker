'use client';
import { FormEvent, useState } from "react";
import { useRouter } from 'next/navigation'; // Importa o hook de navegação
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('supervisor@laghetto.com.br');
  const [password, setPassword] = useState('laghetto123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Inicializa o router

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3333/api/auth/login', {
        email: email,
        password: password,
      });

      const { token } = response.data;
      console.log('Login bem-sucedido! Token:', token);
      
      // MUDANÇA: Salvamos o token no localStorage do navegador
      localStorage.setItem('authToken', token);

      // MUDANÇA: Redirecionamos o usuário para a página do dashboard
      router.push('/dashboard');

    } catch (err) {
      console.error('Erro no login:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || 'Não foi possível fazer login.');
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // O JSX do formulário continua o mesmo
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Laghetto Ads Tracker</CardTitle>
          <CardDescription>Faça login para acessar o painel de controle.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="supervisor@laghetto.com.br"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </main>
  );
}