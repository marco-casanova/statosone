import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { RenterDashboard } from "./RenterDashboard";
import { SearcherDashboard } from "./SearcherDashboard";

export default async function AppPage() {
  const profile = await getProfile();

  // If no profile, redirect to onboarding
  if (!profile) {
    redirect("/onboarding");
  }

  // Render different dashboard based on user type
  if (profile.user_type === "renter") {
    return <RenterDashboard profile={profile} />;
  }

  return <SearcherDashboard profile={profile} />;
}
