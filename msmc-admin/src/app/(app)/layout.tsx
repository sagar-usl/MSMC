import { redirect } from "next/navigation";
import AppShell from "@/components/layouts/AppShell";
import { getCurrentUser } from "@/lib/auth";

// Belt-and-suspenders: proxy.ts already gates these routes at the network
// edge, but Server Actions bypass proxy matchers if a route is ever
// refactored (see proxy.ts's comment), so every entry point re-checks here too.
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OFFICER") {
    redirect("/login");
  }

  return <AppShell userName={user.name ?? user.email ?? "Officer"}>{children}</AppShell>;
}
