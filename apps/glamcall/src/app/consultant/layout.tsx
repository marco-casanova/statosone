import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Phone,
  DollarSign,
  User,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";

/**
 * Consultant Dashboard Layout
 * In production, this would verify consultant authentication
 */
export default async function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock consultant data for demo
  const consultant = {
    name: "Elena Rodriguez",
    email: "elena@glamcall.io",
    status: "approved",
    photo_url: null,
  };

  const navItems = [
    { href: "/consultant", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/consultant/availability", icon: Calendar, label: "Availability" },
    { href: "/consultant/calls", icon: Phone, label: "My Calls" },
    { href: "/consultant/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/consultant/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-glam-gradient flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GlamCall</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-glam-50 hover:text-glam-700 transition-colors font-medium"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-glam-gradient flex items-center justify-center text-white font-bold">
              {consultant.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {consultant.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {consultant.email}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultant Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {consultant.name.split(" ")[0]}!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
