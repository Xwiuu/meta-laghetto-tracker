import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers"; // 1. CORREÇÃO: Usar importação relativa
import { LoadingProvider } from "@/context/LoadingContext";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
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
      <body className={poppins.className}>
        <LoadingProvider>
          <LoadingOverlay />
          <Providers>{children}</Providers>
        </LoadingProvider>
        {/* 2. CORREÇÃO: Removido o hífen da tag de fecho */}
      </body>
    </html>
  );
}
