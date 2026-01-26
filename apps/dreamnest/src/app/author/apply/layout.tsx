export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the author check in the parent layout
  return <>{children}</>;
}
