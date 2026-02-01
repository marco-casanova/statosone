import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getAvailableSpaces } from "@/actions";
import { BrowseSpacesPage } from "./BrowseSpacesPage";

export const metadata = {
  title: "Browse Spaces - KellerSharer",
};

export default async function BrowseRoute() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const spaces = await getAvailableSpaces();

  return <BrowseSpacesPage profile={profile} spaces={spaces} />;
}
