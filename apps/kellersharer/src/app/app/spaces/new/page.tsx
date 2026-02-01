import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { NewSpaceForm } from "./NewSpaceForm";

export const metadata = {
  title: "Add New Space - KellerSharer",
};

export default async function NewSpacePage() {
  const profile = await getProfile();
  
  if (!profile) {
    redirect("/onboarding");
  }
  
  if (profile.user_type !== "renter") {
    redirect("/app");
  }

  return <NewSpaceForm profile={profile} />;
}
