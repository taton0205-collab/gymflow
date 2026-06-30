import { ProductShell } from "@/components/product-shell";
import { MemberProfile } from "@/features/members/member-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return (
    <ProductShell>
      <MemberProfile memberId={id} />
    </ProductShell>
  );
}
