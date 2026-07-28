import { listEducationItems } from "@/lib/education";
import { EducationTable } from "@/components/education/EducationTable";
import { AddEducationItemButton } from "@/components/education/AddEducationItemButton";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function EducationPage() {
  const items = await listEducationItems();

  return (
    <div>
      <PageHeader
        title="Education & Scholarship"
        description="Scholarship and education schemes shown in the citizen app's Education & Scholarship screen."
        action={<AddEducationItemButton />}
      />

      <Card>
        <CardContent>
          <EducationTable items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
