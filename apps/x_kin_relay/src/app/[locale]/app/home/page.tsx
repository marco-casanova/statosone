"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  UserPlus,
  ListTodo,
  Users,
  FileText,
  Info,
  LogOut,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  const navItems: NavItem[] = [
    {
      id: "quick-log",
      label: t("home.quick_log") || "QUICK LOG",
      icon: <ClipboardList size={28} />,
      href: `/${locale}/app/quick-log`,
    },
    {
      id: "register",
      label: t("home.register_client") || "REGISTRAR CLIENTE",
      icon: <UserPlus size={28} />,
      href: `/${locale}/app/clients/new`,
    },
    {
      id: "tasks",
      label: t("home.tasks") || "TAREAS",
      icon: <ListTodo size={28} />,
      href: `/${locale}/app/tasks`,
    },
    {
      id: "profiles",
      label: t("home.profiles") || "PERFILES",
      icon: <Users size={28} />,
      href: `/${locale}/app/clients`,
    },
    {
      id: "report",
      label: t("home.report") || "REPORTE",
      icon: <FileText size={28} />,
      href: `/${locale}/app/reports`,
      badge: 1,
    },
    {
      id: "logout",
      label: t("home.logout") || "SALIR",
      icon: <LogOut size={28} />,
      href: `/${locale}/login`,
    },
  ];

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <h1 className="home-title">INICIO</h1>
        <Link href={`/${locale}/app/settings`} className="settings-btn">
          <Settings size={24} />
        </Link>
      </header>

      {/* Navigation Grid */}
      <nav className="home-grid">
        {navItems.map((item) => (
          <Link key={item.id} href={item.href} className="home-item">
            <div className="home-icon">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="home-badge">{item.badge}</span>
              )}
            </div>
            <span className="home-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Indicator (bottom right floating) */}
      <div className="user-indicators">
        <div className="user-avatar user-avatar--a">A</div>
        <div className="user-avatar user-avatar--h">H</div>
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
          position: relative;
        }

        .home-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 0;
          margin-bottom: 32px;
          position: relative;
        }

        .home-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .settings-btn {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .home-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 400px;
          margin: 0 auto;
          padding: 24px 0;
        }

        .home-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .home-icon {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--kinrelay-primary, #f5d547);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .home-item:hover .home-icon {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .home-item:active .home-icon {
          transform: scale(0.98);
        }

        .home-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .home-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 0.3px;
          line-height: 1.3;
          max-width: 80px;
        }

        .user-indicators {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          gap: -8px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: white;
          border: 2px solid white;
        }

        .user-avatar--a {
          background: #3b82f6;
          z-index: 2;
        }

        .user-avatar--h {
          background: #ec4899;
          margin-left: -12px;
          z-index: 1;
        }

        @media (max-width: 360px) {
          .home-grid {
            gap: 24px;
            padding: 16px 0;
          }

          .home-icon {
            width: 64px;
            height: 64px;
          }

          .home-label {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
