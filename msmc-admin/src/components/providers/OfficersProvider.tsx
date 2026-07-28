"use client";

import { createContext, useContext } from "react";

const OfficersContext = createContext<string[]>([]);

export function OfficersProvider({
  officers,
  children,
}: {
  officers: string[];
  children: React.ReactNode;
}) {
  return <OfficersContext.Provider value={officers}>{children}</OfficersContext.Provider>;
}

/** Names of active officers, fetched once per navigation in the (app) layout. */
export function useOfficers(): string[] {
  return useContext(OfficersContext);
}
