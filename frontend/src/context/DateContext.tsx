"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateContextType {
  date: DateRange | undefined;
  setDate: (range: DateRange | undefined) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  return (
    <DateContext.Provider value={{ date, setDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
}
