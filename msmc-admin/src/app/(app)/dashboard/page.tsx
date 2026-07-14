import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-2 text-slate-600">
          Welcome to MSMC Administration Portal.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Complaints</CardDescription>

            <CardTitle>1,458</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-green-600">+25 Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Hearings Today</CardDescription>

            <CardTitle>18</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-blue-600">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Documents</CardDescription>

            <CardTitle>362</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-orange-600">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active Users</CardDescription>

            <CardTitle>642</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-purple-600">Registered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
