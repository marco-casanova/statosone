import { AdminDashboard } from "@/components/AdminDashboard";
import { TopNav } from "@/components/TopNav";

/**
 * Admin Dashboard - Analytics and insights for your care network
 * Shows charts for carers, clients, medications, activities, and incidents
 */
export default function AdminPage() {
  return (
    <>
      <TopNav />
      <AdminDashboard />
    </>
  );
}
