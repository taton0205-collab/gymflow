import { ProductShell } from "@/components/product-shell";
import { MemberProfile } from "@/features/members/member-profile";

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <ProductShell>
      <MemberProfile memberId={id} />
    </ProductShell>
  );
}
