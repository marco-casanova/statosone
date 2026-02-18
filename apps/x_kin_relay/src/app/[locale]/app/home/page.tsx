"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  ClipboardList,
  Users,
  FileText,
  LogOut,
  BarChart3,
  Heart,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  accent?: string;
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  const navItems: NavItem[] = [
    {
      id: "quick-log",
      label: "Quick Log",
      description: "Log care tasks fast",
      icon: <ClipboardList size={26} strokeWidth={1.8} />,
      href: `/${locale}/app?view=dashboard`,
      accent: "#F5D547",
    },
    {
      id: "network",
      label: "Care Network",
      description: "Find carers & families",
      icon: <Heart size={26} strokeWidth={1.8} />,
      href: `/${locale}/app?view=network`,
      accent: "#88B9B0",
    },
    {
      id: "data",
      label: "Data",
      description: "Clients, meds & circles",
      icon: <Users size={26} strokeWidth={1.8} />,
      href: `/${locale}/app?view=data`,
      accent: "#7CB7E4",
    },
    {
      id: "admin",
      label: "Analytics",
      description: "Reports & insights",
      icon: <BarChart3 size={26} strokeWidth={1.8} />,
      href: `/${locale}/admin`,
      badge: 1,
      accent: "#C4A1E0",
    },
    {
      id: "reports",
      label: "Handover",
      description: "Shift reports & PDFs",
      icon: <FileText size={26} strokeWidth={1.8} />,
      href: `/${locale}/app/reports`,
      accent: "#E8A87C",
    },
    {
      id: "logout",
      label: "Logout",
      description: "Sign out",
      icon: <LogOut size={26} strokeWidth={1.8} />,
      href: `/${locale}/login`,
      accent: "#9CA3AF",
    },
  ];

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="brand-section">
          <div className="brand-logo">K</div>
          <div>
            <h1 className="brand-name">Kin Relay</h1>
            <p className="brand-subtitle">Home Care Hub</p>
          </div>
        </div>
        <Link href={`/${locale}/app/settings`} className="settings-btn">
          <Settings size={20} />
        </Link>
      </header>

      {/* Welcome card */}
      <div className="welcome-card">
        <span className="welcome-emoji">👋</span>
        <div>
          <p className="welcome-title">Welcome back</p>
          <p className="welcome-text">
            Manage care tasks, carers, and reports — all in one place.
          </p>
        </div>
      </div>

      {/* Navigation Grid */}
      <nav className="home-grid">
        {navItems.map((item) => (
          <Link key={item.id} href={item.href} className="nav-card">
            <div
              className="nav-icon"
              style={{ background: item.accent || "#F5D547" }}
            >
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
            <div className="nav-text">
              <span className="nav-label">{item.label}</span>
              <span className="nav-desc">{item.description}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Indicator */}
      <div className="user-indicators">
        <div className="user-avatar user-avatar--a">A</div>
        <div className="user-avatar user-avatar--h">H</div>
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(
            180deg,
            #88b9b0 0%,
            #7aaea5 50%,
            #6da19a 100%
          );
          padding: 20px;
          padding-top: env(safe-area-inset-top, 20px);
          position: relative;
        }

        .home-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0 24px;
        }

        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #f5d547;
          color: #1a1a1a;
          font-size: 22px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(245, 213, 71, 0.35);
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
          letter-spacing: -0.3px;
        }

        .brand-subtitle {
          font-size: 12px;
          margin: 0;
          color: rgba(26, 26, 26, 0.6);
          font-weight: 500;
        }

        .settings-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1a1a;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .settings-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .welcome-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: 18px;
          padding: 18px 20px;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .welcome-emoji {
          font-size: 32px;
          flex-shrink: 0;
        }

        .welcome-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
        }

        .welcome-text {
          font-size: 13px;
          margin: 4px 0 0;
          color: rgba(26, 26, 26, 0.65);
          line-height: 1.4;
        }

        .home-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          max-width: 480px;
          margin: 0 auto;
        }

        .nav-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 18px;
          padding: 18px 16px;
          text-decoration: none;
          color: #1a1a1a;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .nav-card:hover {
          background: rgba(255, 255, 255, 0.75);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .nav-card:active {
          transform: scale(0.98);
        }

        .nav-icon {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #1a1a1a;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .nav-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .nav-label {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.2;
        }

        .nav-desc {
          font-size: 11px;
          color: rgba(26, 26, 26, 0.55);
          font-weight: 500;
          line-height: 1.3;
        }

        .user-indicators {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: white;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .user-avatar--a {
          background: #3b82f6;
          z-index: 2;
        }

        .user-avatar--h {
          background: #ec4899;
          margin-left: -10px;
          z-index: 1;
        }

        @media (max-width: 380px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 600px) {
          .home-grid {
            grid-template-columns: repeat(3, 1fr);
            max-width: 720px;
          }
        }
      `}</style>
    </div>
  );
}
