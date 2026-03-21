import { redirect } from "next/navigation";

export default async function QuickLogRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/app?view=dashboard`);
}
