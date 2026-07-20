interface ComplaintDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailsPage({
  params,
}: ComplaintDetailsProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Complaint Details</h1>

      <p className="mt-4">Complaint ID: {id}</p>
    </div>
  );
}
