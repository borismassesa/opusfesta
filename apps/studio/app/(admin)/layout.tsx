import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import type { StudioRole } from "@/lib/studio-types";

export const metadata = {
  title: "Admin | OpusFesta Studio",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/admin/sign-in");
  }

  const meta = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
  const studioRole = (meta?.studio_role as StudioRole) || null;

  if (!studioRole) {
    redirect("/");
  }

  return (
    <ClerkProvider>
      <div className="admin-shell flex h-screen bg-gray-50">
        <AdminSidebar role={studioRole} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ClerkProvider>
  );
}
