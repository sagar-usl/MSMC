import { ReactNode } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
  userName: string;
}

export default function AppShell({ children, userName }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <Sidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar userName={userName} />

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
