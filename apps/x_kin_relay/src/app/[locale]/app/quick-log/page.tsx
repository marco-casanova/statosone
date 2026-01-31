"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HelpCircle,
  Settings,
  Droplets,
  AlertTriangle,
  Circle,
  AlertCircle,
  UserX,
  Shield,
  Stethoscope,
  User,
  Home,
  Bell,
  Target,
  ChevronRight,
} from "lucide-react";

interface QuickAction {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface Category {
  id: string;
  name: string;
  subtypes: number;
  icon: React.ReactNode;
  iconBg: string;
}

const quickActions: QuickAction[] = [
  {
    id: "hydration",
    name: "Hydration",
    category: "Adl",
    icon: <Droplets size={22} />,
    iconBg: "#3B82F6",
  },
  {
    id: "fall",
    name: "Fall",
    category: "Safety",
    icon: <AlertTriangle size={22} />,
    iconBg: "#F59E0B",
  },
  {
    id: "other",
    name: "Other",
    category: "Service",
    icon: <Circle size={10} fill="currentColor" />,
    iconBg: "#6B5B3E",
  },
  {
    id: "access-problem",
    name: "Access Problem",
    category: "Service",
    icon: <Circle size={10} fill="currentColor" />,
    iconBg: "#6B5B3E",
  },
  {
    id: "missing-client",
    name: "Missing Client",
    category: "Safety",
    icon: <Circle size={10} fill="currentColor" />,
    iconBg: "#8B5A3C",
  },
];

const categories: Category[] = [
  {
    id: "safety",
    name: "Safety",
    subtypes: 11,
    icon: <Shield size={26} />,
    iconBg: "#7C3E25",
  },
  {
    id: "health-observation",
    name: "Health Observation",
    subtypes: 22,
    icon: <Stethoscope size={26} />,
    iconBg: "#1E4D3D",
  },
  {
    id: "adl",
    name: "Adl",
    subtypes: 14,
    icon: <User size={26} />,
    iconBg: "#2E3E5C",
  },
  {
    id: "environment",
    name: "Environment",
    subtypes: 3,
    icon: <Home size={26} />,
    iconBg: "#2D5148",
  },
  {
    id: "service",
    name: "Service",
    subtypes: 5,
    icon: <Bell size={26} />,
    iconBg: "#5C5123",
  },
  {
    id: "engagement",
    name: "Engagement",
    subtypes: 10,
    icon: <Target size={26} />,
    iconBg: "#4E3B5C",
  },
];

export default function QuickLogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";
  const [selectedAction, setSelectedAction] = useState<string | null>("fall");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [autoExpand, setAutoExpand] = useState(true);

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionId === selectedAction ? null : actionId);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleClear = () => {
    setSelectedAction(null);
    setSelectedCategory(null);
  };

  return (
    <div className="quick-log-page">
      <div className="quick-log-panel">
        <header className="quick-log-header">
          <h1>
            Quick Log
            <button className="help-btn" aria-label="Help">
              <HelpCircle size={20} />
            </button>
          </h1>
        </header>

        <section className="quick-actions-section">
          <div className="section-header">
            <h2>QUICK ACTIONS</h2>
            <button className="settings-btn" aria-label="Settings">
              <Settings size={20} />
            </button>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`quick-action-card ${selectedAction === action.id ? "selected" : ""}`}
                onClick={() => handleActionClick(action.id)}
              >
                <div
                  className="action-icon"
                  style={{ backgroundColor: action.iconBg }}
                >
                  {action.icon}
                </div>
                <div className="action-info">
                  <span className="action-name">{action.name}</span>
                  <span className="action-category">{action.category}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="categories-section">
          <h2>CATEGORIES</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: category.iconBg }}
                >
                  {category.icon}
                </div>
                <div className="category-info">
                  <span className="category-name">{category.name}</span>
                  <span className="category-subtypes">
                    {category.subtypes} subtypes
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="filter-section">
          <button className="filter-btn filter-main">
            Filter by category / subtype / recipient
          </button>
          <button className="filter-btn" onClick={handleClear}>
            Clear
          </button>
          <button className="filter-btn">Reload</button>
          <label className="auto-expand-toggle">
            <input
              type="checkbox"
              checked={autoExpand}
              onChange={(e) => setAutoExpand(e.target.checked)}
            />
            Auto expand
          </label>
        </div>
      </div>

      <section className="log-entries">
        <div className="log-entry">
          <div
            className="log-entry-icon"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <Droplets size={20} />
          </div>
          <div className="log-entry-info">
            <span className="log-entry-category">Adl</span>
            <span className="log-entry-title">hydration</span>
            <span className="log-entry-time">Jan 29, 05:54 PM</span>
          </div>
          <button className="log-entry-action">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <style jsx>{`
        .quick-log-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 24px 20px;
        }

        .quick-log-panel {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 32px 28px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .quick-log-header {
          margin-bottom: 28px;
        }

        .quick-log-header h1 {
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1a1a1a;
        }

        .help-btn {
          background: transparent;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .help-btn:hover {
          border-color: rgba(0, 0, 0, 0.2);
          color: #374151;
        }

        .quick-actions-section {
          margin-bottom: 28px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .section-header h2,
        .categories-section h2 {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #6b7280;
          text-transform: uppercase;
        }

        .settings-btn {
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .settings-btn:hover {
          color: #374151;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        @media (min-width: 1200px) {
          .quick-actions-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }

        .quick-action-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-action-card:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .quick-action-card.selected {
          border-color: var(--kinrelay-primary, #f5d547);
          background: rgba(245, 213, 71, 0.1);
        }

        .quick-action-card:first-child {
          border-color: #3b82f6;
        }

        .quick-action-card:nth-child(2) {
          border-color: #f59e0b;
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .action-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }

        .action-name {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .action-category {
          font-size: 13px;
          color: #374151;
        }

        .categories-section h2 {
          margin-bottom: 16px;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }

        @media (min-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .categories-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        .category-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .category-card:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .category-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .category-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .category-name {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .category-subtypes {
          font-size: 13px;
          color: #6b7280;
        }

        .filter-section {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .filter-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .filter-btn:hover {
          background: #e2e8f0;
          border-color: #cbd5e1;
        }

        .filter-main {
          flex: 1;
          min-width: 250px;
        }

        .auto-expand-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          margin-left: auto;
        }

        .auto-expand-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--kinrelay-primary, #f5d547);
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-entry {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .log-entry:hover {
          background: #fff;
          border-color: rgba(0, 0, 0, 0.12);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .log-entry-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .log-entry-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .log-entry-category {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .log-entry-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .log-entry-time {
          font-size: 13px;
          color: #9ca3af;
        }

        .log-entry-action {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .log-entry-action:hover {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
