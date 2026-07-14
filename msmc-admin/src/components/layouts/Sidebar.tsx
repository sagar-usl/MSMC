"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAVIGATION } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 border-r bg-white lg:block">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-blue-800">MSMC</h1>

        <p className="text-sm text-slate-500">Government of Maharashtra</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 transition",

                    pathname === item.href
                      ? "bg-blue-700 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon size={20} />

                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
