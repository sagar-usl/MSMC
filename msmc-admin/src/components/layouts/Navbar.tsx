import { Bell, LogOut, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { logout } from "@/actions/auth.actions";

interface NavbarProps {
  userName: string;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar({ userName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />

        <Input placeholder="Search..." className="pl-10" />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative rounded-full p-2 hover:bg-slate-100">
          <Bell size={22} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <Avatar>
          <AvatarFallback>{initialsOf(userName)}</AvatarFallback>
        </Avatar>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
