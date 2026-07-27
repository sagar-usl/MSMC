import { getCurrentUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { InfoField } from "@/components/common/InfoField";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your account details and security." />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoField label="Name">{user?.name ?? "—"}</InfoField>
            <InfoField label="Email">{user?.email ?? "—"}</InfoField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
