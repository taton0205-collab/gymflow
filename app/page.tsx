import { ProductShell } from "@/components/product-shell";
import { Dashboard } from "@/features/dashboard/dashboard";

export default function Home() {
  return (
    <ProductShell>
      <Dashboard />
    </ProductShell>
  );
}
