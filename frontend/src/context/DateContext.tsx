// src/context/DateContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateContextType {
  date: DateRange;
  setDate: (value: DateRange) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  // Valor inicial: últimos 30 dias
  const [date, setDate] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <DateContext.Provider value={{ date, setDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error("useDate deve estar dentro de DateProvider");
  return ctx;
};
