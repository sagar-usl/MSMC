"use client";

import { createContext, useContext } from "react";
import type { ActiveOfficer } from "@/lib/officers";

const OfficersContext = createContext<ActiveOfficer[]>([]);

export function OfficersProvider({
  officers,
  children,
}: {
  officers: ActiveOfficer[];
  children: React.ReactNode;
}) {
  return <OfficersContext.Provider value={officers}>{children}</OfficersContext.Provider>;
}

/** Active officers (id + name), fetched once per navigation in the (app) layout. */
export function useOfficers(): ActiveOfficer[] {
  return useContext(OfficersContext);
}
