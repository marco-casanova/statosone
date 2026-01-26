import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/nav/navbar";
import { getUserRole } from "@/actions/auth";

export const metadata = {
  title: "Library - DreamNest",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-purple-50">
      <Navbar user={user} role={role || "parent"} />
      <main>{children}</main>
    </div>
  );
}
