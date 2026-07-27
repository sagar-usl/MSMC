import { listInitiatives } from "@/lib/initiatives";
import { InitiativeTable } from "@/components/initiatives/InitiativeTable";
import { AddInitiativeButton } from "@/components/initiatives/AddInitiativeButton";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function InitiativesPage() {
  const initiatives = await listInitiatives();

  return (
    <div>
      <PageHeader
        title="Initiatives"
        description="District-level programs shown in the citizen app's Initiatives screen."
        action={<AddInitiativeButton />}
      />

      <Card>
        <CardContent>
          <InitiativeTable initiatives={initiatives} />
        </CardContent>
      </Card>
    </div>
  );
}
