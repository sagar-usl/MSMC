"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth.actions";
import type { NotificationItem } from "@/lib/notifications";

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

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Navbar({ userName }: NavbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  const handleSelect = (item: NotificationItem) => {
    if (!item.read) {
      setUnreadCount((count) => Math.max(0, count - 1));
      setNotifications((items) => items.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      fetch(`/api/notifications/${item.id}/read`, { method: "POST" }).catch(() => {});
    }
    // Only two notification kinds exist today: complaint-related (carries a
    // ticketId) and feedback (doesn't) — route accordingly.
    router.push(item.ticketId ? `/complaints/${encodeURIComponent(item.ticketId)}` : "/feedback");
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-end border-b bg-white px-6">
      <div className="flex items-center gap-5">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full" />}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80">
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-400">No notifications yet</div>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex flex-col items-start gap-0.5 whitespace-normal"
                >
                  <div className="flex w-full items-center gap-2">
                    {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-xs text-slate-500">{item.body}</span>
                  <span className="text-[11px] text-slate-400">{timeAgo(item.createdAt)}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/settings"
          title="Account settings"
          className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-700 text-sm font-semibold text-white shadow-sm ring-2 ring-transparent transition hover:ring-blue-200"
        >
          {initialsOf(userName)}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
          title="Log out"
          onClick={() => setIsLogoutOpen(true)}
        >
          <LogOut size={18} />
        </Button>
      </div>

      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>You&apos;ll need to sign in again to access the admin panel.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isLoggingOut} onClick={handleConfirmLogout}>
              {isLoggingOut ? "Logging out…" : "Log Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
