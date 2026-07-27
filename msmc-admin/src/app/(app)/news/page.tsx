import { listNewsItems } from "@/lib/news";
import { NewsTable } from "@/components/news/NewsTable";
import { AddNewsItemButton } from "@/components/news/AddNewsItemButton";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewsPage() {
  const items = await listNewsItems();

  return (
    <div>
      <PageHeader
        title="News"
        description="Announcements and notices shown in the citizen app's News screen."
        action={<AddNewsItemButton />}
      />

      <Card>
        <CardContent>
          <NewsTable items={items} />
        </CardContent>
      </Card>
    </div>
  );
}
