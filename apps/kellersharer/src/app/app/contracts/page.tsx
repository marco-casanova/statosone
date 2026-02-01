import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import { getMyContracts } from "@/actions/contracts";
import { ContractsPage } from "./ContractsPage";

export const metadata = {
  title: "My Contracts - KellerSharer",
};

export default async function ContractsRoute() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const contracts = await getMyContracts();

  return <ContractsPage profile={profile} contracts={contracts} />;
}
