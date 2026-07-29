import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRowActions } from "./UserRowActions";
import type { User } from "@/generated/prisma/client";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No users yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name ?? <span className="text-muted-foreground">Unnamed</span>}</TableCell>
            <TableCell>{user.email ?? user.phone ?? "—"}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                  user.role === "MASTER_ADMIN"
                    ? "border-purple-200 bg-purple-100 text-purple-800"
                    : user.role === "OFFICER"
                      ? "border-blue-200 bg-blue-100 text-blue-800"
                      : "border-slate-200 bg-slate-100 text-slate-700"
                }`}
              >
                {user.role === "MASTER_ADMIN" ? "Master Admin" : user.role === "OFFICER" ? "Officer" : "Citizen"}
              </span>
            </TableCell>
            <TableCell>
              {user.role === "OFFICER" || user.role === "MASTER_ADMIN" ? (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                    user.isActive
                      ? "border-green-200 bg-green-100 text-green-800"
                      : "border-red-200 bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>{user.lastLoginAt ? user.lastLoginAt.toISOString().slice(0, 10) : "Never"}</TableCell>
            <TableCell>
              <UserRowActions user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
