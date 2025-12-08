// app/admin/items/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

export default function AdminItemsRedirectPage() {
  // arahkan ke halaman baru yang memang kita pakai
  redirect("/admin/product-items");
}
