import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/nav/navbar";
import { getUserRole, isAuthor } from "@/actions/auth";

export const metadata = {
  title: "Author Dashboard - DreamNest",
};

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/author");
  }

  const role = await getUserRole();

  // Check if user has author role (but allow access to apply page)
  const hasAuthorRole = await isAuthor();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Navbar user={user} role={role || "parent"} />
      <main>{children}</main>
    </div>
  );
}
