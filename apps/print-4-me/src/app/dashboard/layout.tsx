"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/Toast";
import { AuthWatcher } from "@/components/AuthWatcher";
import {
  Printer,
  LayoutDashboard,
  Box,
  ShoppingBag,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!hasSupabase || !supabase) {
        router.replace("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Check admin status
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace("/");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/models", label: "My Models", icon: Box },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/custom-design", label: "Custom Design", icon: Palette },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuthWatcher />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-forge-500 to-flow-500 rounded-lg flex items-center justify-center">
                  <Printer className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Print-4-Me
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-forge-50 text-forge-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link */}
              {isAdmin && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Admin
                    </p>
                    <Link
                      href="/admin"
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                        pathname.startsWith("/admin")
                          ? "bg-purple-50 text-purple-600"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  </div>
                </>
              )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 mr-4"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
