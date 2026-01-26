import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/nav/navbar";
import { getUserRole, isAdmin } from "@/actions/auth";

export const metadata = {
  title: "Admin Dashboard - DreamNest",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  const role = await getUserRole();
  const hasAdminRole = await isAdmin();

  if (!hasAdminRole) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar user={user} role={role || "parent"} />
      <main>{children}</main>
    </div>
  );
}
