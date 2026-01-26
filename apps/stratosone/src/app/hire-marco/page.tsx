import { redirect } from "next/navigation";

// Redirect old /hire-marco URL to new /founder-led URL
export default function HireMarcoPage() {
  redirect("/founder-led");
}
