import { getAdminStats, getPendingSpaces, getAllUsers } from "@/actions";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const [stats, pendingSpaces, users] = await Promise.all([
    getAdminStats(),
    getPendingSpaces(),
    getAllUsers(),
  ]);

  return (
    <AdminDashboard 
      stats={stats} 
      pendingSpaces={pendingSpaces} 
      users={users}
    />
  );
}
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
  },
  stat: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.5rem",
  },
  statNumber: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
};
