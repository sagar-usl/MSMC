import { listDocuments } from "@/lib/documents";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { AddDocumentButton } from "@/components/documents/AddDocumentButton";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function DocumentsPage() {
  const documents = await listDocuments();

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Reports, acts, and policies shown in the citizen app's Documents library."
        action={<AddDocumentButton />}
      />

      <Card>
        <CardContent>
          <DocumentTable documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
}
