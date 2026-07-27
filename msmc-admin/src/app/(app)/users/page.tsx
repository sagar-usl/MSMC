import { listUsers } from "@/lib/users";
import { UserTable } from "@/components/users/UserTable";
import { AddOfficerDialog } from "@/components/users/AddOfficerDialog";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div>
      <PageHeader
        title="Users"
        description="Officers who manage complaints, and citizens who have filed them."
        action={<AddOfficerDialog />}
      />

      <Card>
        <CardContent>
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
