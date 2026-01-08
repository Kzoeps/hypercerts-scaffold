import HypercertDetailsView from "@/components/hypercert-detail-view";
import { getAuthenticatedRepo } from "@/lib/atproto-session";

export default async function HypercertViewPage({
  params,
}: {
  params: Promise<{ hypercertUri: string }>;
}) {
  const { hypercertUri } = await params;
  const decodedUri = decodeURIComponent(hypercertUri);

  const personalRepo = await getAuthenticatedRepo();
  if (!personalRepo) return <div>Please log in to view hypercerts.</div>;

  const cert = await personalRepo.hypercerts.get(decodedUri);
  if (!cert?.record) return <div>Record not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <HypercertDetailsView hypercertUri={decodedUri} record={cert.record} />
    </div>
  );
}
