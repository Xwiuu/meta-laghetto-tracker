import type { Metadata } from "next";
// Passo 1: Mude a importação de 'Inter' para 'Poppins'
import { Poppins } from "next/font/google";
import "./globals.css";

// Passo 2: Configure a nova fonte
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Importamos diferentes pesos da fonte
});

export const metadata = {
  title: "Laghetto Ads Tracker",
  description: "Plataforma de monitoramento de mídia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Passo 3: Aplique a classe da nova fonte no body */}
      <body className={poppins.className}>{children}</body>
    </html>
  );
}