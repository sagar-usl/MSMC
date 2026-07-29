import { redirect } from "next/navigation";
import AppShell from "@/components/layouts/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { listActiveOfficers } from "@/lib/officers";
import { OfficersProvider } from "@/components/providers/OfficersProvider";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { NotificationRegistrar } from "@/components/providers/NotificationRegistrar";

// Belt-and-suspenders: proxy.ts already gates these routes at the network
// edge, but Server Actions bypass proxy matchers if a route is ever
// refactored (see proxy.ts's comment), so every entry point re-checks here too.
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OFFICER" && user.role !== "MASTER_ADMIN")) {
    redirect("/login");
  }

  const officers = await listActiveOfficers();

  return (
    <CurrentUserProvider user={{ id: user.id, role: user.role }}>
      <OfficersProvider officers={officers}>
        <NotificationRegistrar />
        <AppShell userName={user.name ?? user.email ?? "Officer"}>{children}</AppShell>
      </OfficersProvider>
    </CurrentUserProvider>
  );
}
