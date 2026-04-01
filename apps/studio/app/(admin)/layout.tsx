import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { getCurrentStudioAccess } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin | OpusStudio",
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const { clerkId, role: studioRole } = await getCurrentStudioAccess();

  if (!clerkId) {
    redirect("/studio-admin/sign-in");
  }

  if (!studioRole) {
    redirect("/studio-admin/no-access");
  }

  return (
    <ClerkProvider>
      <div className="admin-shell flex h-screen">
        <AdminSidebar role={studioRole} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ClerkProvider>
  );
}
