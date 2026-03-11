import { redirect } from "next/navigation";

/**
 * Legacy home launcher route.
 * Redirect to dashboard so the old tile menu screen is no longer shown.
 */
export default async function AppHomeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/app?view=dashboard`);
}
