"use client";

import { createContext, useContext, useState } from "react";
import { usePreferences } from "./preferences-provider";
import type { ExploreRange } from "@/lib/explore-performance";

const ExplorePeriodContext = createContext<{
  range: ExploreRange;
  setRange: (range: ExploreRange) => void;
} | null>(null);

/** Keep the selected period while moving between Explore's sector pages. */
export function ExplorePeriodProvider({ children }: { children: React.ReactNode }) {
  const preferences = usePreferences();
  const [selectedRange, setRange] = useState<ExploreRange | null>(null);
  return <ExplorePeriodContext.Provider value={{ range: selectedRange ?? preferences.compareRange, setRange }}>
    {children}
  </ExplorePeriodContext.Provider>;
}

export function useExplorePeriod() {
  const context = useContext(ExplorePeriodContext);
  if (!context) throw new Error("Explore views require ExplorePeriodProvider");
  return context;
}
