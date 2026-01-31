"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Menu, FileText, Download, Share2 } from "lucide-react";

interface Report {
  id: string;
  clientName: string;
  date: string;
  type: string;
  status: "pending" | "completed" | "sent";
}

export default function ReportsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  // Mock reports data
  const [reports] = useState<Report[]>([
    {
      id: "1",
      clientName: "NOMBRE CLIENTE 1",
      date: "2026-01-29",
      type: "Diario",
      status: "pending",
    },
    {
      id: "2",
      clientName: "NOMBRE CLIENTE 2",
      date: "2026-01-28",
      type: "Semanal",
      status: "completed",
    },
    {
      id: "3",
      clientName: "NOMBRE CLIENTE 1",
      date: "2026-01-27",
      type: "Diario",
      status: "sent",
    },
  ]);

  const handleBack = () => {
    router.push(`/${locale}/app/home`);
  };

  const getStatusColor = (status: Report["status"]): string => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#22C55E";
      case "sent":
        return "#3B82F6";
    }
  };

  const getStatusLabel = (status: Report["status"]): string => {
    switch (status) {
      case "pending":
        return "PENDIENTE";
      case "completed":
        return "COMPLETADO";
      case "sent":
        return "ENVIADO";
    }
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <header className="reports-header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="reports-title">REPORTES</h1>
        <button type="button" className="menu-btn">
          <Menu size={24} />
        </button>
      </header>

      {/* Reports List */}
      <div className="reports-content">
        {reports.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} strokeWidth={1} />
            <p>No hay reportes disponibles</p>
          </div>
        ) : (
          <div className="reports-list">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-info">
                  <div className="report-client">{report.clientName}</div>
                  <div className="report-meta">
                    <span className="report-date">{report.date}</span>
                    <span className="report-type">{report.type}</span>
                  </div>
                  <div
                    className="report-status"
                    style={{ color: getStatusColor(report.status) }}
                  >
                    {getStatusLabel(report.status)}
                  </div>
                </div>
                <div className="report-actions">
                  <button className="action-btn" aria-label="Descargar">
                    <Download size={18} />
                  </button>
                  <button className="action-btn" aria-label="Compartir">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Report Button */}
      <div className="reports-footer">
        <button className="generate-btn">GENERAR REPORTE</button>
      </div>

      <style jsx>{`
        .reports-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
          display: flex;
          flex-direction: column;
        }

        .reports-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 24px;
        }

        .back-btn,
        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .reports-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .reports-content {
          flex: 1;
          max-width: 400px;
          margin: 0 auto;
          width: 100%;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          color: var(--kinrelay-text-muted, #6b7280);
          text-align: center;
        }

        .empty-state p {
          margin-top: 16px;
          font-size: 14px;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .report-info {
          flex: 1;
        }

        .report-client {
          font-size: 14px;
          font-weight: 600;
          color: var(--kinrelay-text-primary, #1a1a1a);
          margin-bottom: 4px;
        }

        .report-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }

        .report-date,
        .report-type {
          font-size: 12px;
          color: var(--kinrelay-text-muted, #6b7280);
        }

        .report-status {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .report-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #f5f5f5;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #e5e5e5;
        }

        .reports-footer {
          padding: 24px 0;
          display: flex;
          justify-content: center;
        }

        .generate-btn {
          padding: 14px 32px;
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
          border: none;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
        }

        .generate-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .generate-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
