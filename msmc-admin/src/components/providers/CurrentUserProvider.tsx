"use client";

import { createContext, useContext } from "react";

export interface CurrentUserInfo {
  id: string;
  role: "OFFICER" | "MASTER_ADMIN";
}

const CurrentUserContext = createContext<CurrentUserInfo | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUserInfo;
  children: React.ReactNode;
}) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>;
}

/** The logged-in officer/master-admin — used to gate complaint actions client-side. */
export function useCurrentUser(): CurrentUserInfo {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
