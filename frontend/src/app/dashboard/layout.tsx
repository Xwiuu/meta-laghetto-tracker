"use client";

import { ReactNode, use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DateProvider } from "@/context/DateContext";
import { BarChart, FileText, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

// CORREÇÃO: Trocamos os parênteses por chavetas para permitir a lógica
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Visão Geral", icon: BarChart },
    {
      href: "/dashboard/gastos-diarios",
      label: "Gastos Diários",
      icon: FileText,
    },
  ];

  // Adicionamos o 'return' explícito para o JSX
  return (
    <aside
      className={cn(
        "h-screen bg-white dark:bg-gray-900 p-4 flex flex-col transition-all duration-300 shadow-md",
        isCollapsed ? "w-20 items-center" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center mb-10 h-8",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {/* CORREÇÃO: O título só aparece quando NÃO está encolhido */}
        {!isCollapsed && <h2 className="text-xl font-bold">Laghetto Ads</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <PanelLeftClose className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-col space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-500 hover:text-white dark:text-gray-300",
              pathname === link.href && "bg-blue-600 text-white",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5" />
            {!isCollapsed && (
              <span className="ml-4 font-medium">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DateProvider>
      <div className="flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto h-screen">{children}</main>
      </div>
    </DateProvider>
  );
}
