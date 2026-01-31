"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";

interface ToggleGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="kinrelay-toggle-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`kinrelay-toggle-option ${
            value === option.value ? "kinrelay-toggle-option--active" : ""
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const days = [
    { value: "L", label: "L" },
    { value: "M", label: "M" },
    { value: "X", label: "M" },
    { value: "J", label: "J" },
    { value: "V", label: "V" },
    { value: "S", label: "S" },
    { value: "D", label: "D" },
  ];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div className="kinrelay-day-selector">
      {days.map((day) => (
        <button
          key={day.value}
          type="button"
          className={`kinrelay-day ${
            selectedDays.includes(day.value) ? "kinrelay-day--active" : ""
          }`}
          onClick={() => toggleDay(day.value)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

interface TimeSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function TimeSelector({ options, value, onChange }: TimeSelectorProps) {
  return (
    <div className="kinrelay-time-selector">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`kinrelay-time ${
            value === option ? "kinrelay-time--active" : ""
          }`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  // Settings state
  const [securityTimeout, setSecurityTimeout] = useState("30m");
  const [language, setLanguage] = useState("ESPAÑOL");
  const [soundEnabled, setSoundEnabled] = useState("ACTIVO");
  const [volumeUnit, setVolumeUnit] = useState("ml");
  const [reportDays, setReportDays] = useState(["X", "V"]);
  const [reportTime, setReportTime] = useState("13:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState("ACTIVAS");

  const handleBack = () => {
    router.push(`/${locale}/app?view=dashboard`);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="settings-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={handleBack}
          aria-label="Volver"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="settings-title">AJUSTES</h1>
        <div style={{ width: 40 }} /> {/* Spacer for centering */}
      </header>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Security Timeout */}
        <div className="settings-section">
          <div className="settings-label">
            SEGURIDAD
            <button
              type="button"
              className="info-btn"
              aria-label="Información sobre seguridad"
            >
              <Info size={14} />
            </button>
          </div>
          <ToggleGroup
            options={[
              { value: "15m", label: "15m" },
              { value: "30m", label: "30m" },
              { value: "60m", label: "60m" },
              { value: "90m", label: "90m" },
            ]}
            value={securityTimeout}
            onChange={setSecurityTimeout}
          />
        </div>

        {/* Languages */}
        <div className="settings-section">
          <div className="settings-label">IDIOMAS</div>
          <ToggleGroup
            options={[
              { value: "ESPAÑOL", label: "ESPAÑOL" },
              { value: "ENGLISH", label: "ENGLISH" },
              { value: "DEUTSCH", label: "DEUTSCH" },
            ]}
            value={language}
            onChange={setLanguage}
          />
        </div>

        {/* Sounds */}
        <div className="settings-section">
          <div className="settings-label">SONIDOS</div>
          <ToggleGroup
            options={[
              { value: "ACTIVO", label: "ACTIVO" },
              { value: "INACTIVO", label: "INACTIVO" },
            ]}
            value={soundEnabled}
            onChange={setSoundEnabled}
          />
        </div>

        {/* Volume Unit */}
        <div className="settings-section">
          <div className="settings-label">VOLUMEN</div>
          <ToggleGroup
            options={[
              { value: "ml", label: "ml" },
              { value: "fl oz", label: "fl oz" },
            ]}
            value={volumeUnit}
            onChange={setVolumeUnit}
          />
        </div>

        {/* Report Reminder */}
        <div className="settings-section">
          <div className="settings-label">RECORDATORIO DEL REPORTE</div>
          <DaySelector selectedDays={reportDays} onChange={setReportDays} />
          <div style={{ marginTop: 12 }}>
            <TimeSelector
              options={["10:00", "13:00", "16:00", "19:00"]}
              value={reportTime}
              onChange={setReportTime}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-label">
            NOTIFICACIONES
            <button
              type="button"
              className="info-btn"
              aria-label="Información sobre notificaciones"
            >
              <Info size={14} />
            </button>
          </div>
          <ToggleGroup
            options={[
              { value: "ACTIVAS", label: "ACTIVAS" },
              { value: "INACTIVAS", label: "INACTIVAS" },
            ]}
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 24px;
        }

        .settings-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .settings-content {
          max-width: 400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-btn {
          background: none;
          border: 1px solid currentColor;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: inherit;
          padding: 0;
        }

        /* Override toggle group styles for this page */
        :global(.kinrelay-toggle-group) {
          display: flex;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 9999px;
          padding: 3px;
          gap: 2px;
        }

        :global(.kinrelay-toggle-option) {
          flex: 1;
          min-height: 36px;
          padding: 8px 12px;
          border: none;
          border-radius: 9999px;
          background: transparent;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        :global(.kinrelay-toggle-option--active) {
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
        }

        :global(.kinrelay-day-selector) {
          display: flex;
          gap: 4px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 4px;
        }

        :global(.kinrelay-day) {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(.kinrelay-day--active) {
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
        }

        :global(.kinrelay-time-selector) {
          display: flex;
          gap: 4px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 4px;
        }

        :global(.kinrelay-time) {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        :global(.kinrelay-time--active) {
          background: var(--kinrelay-primary, #f5d547);
          color: var(--kinrelay-primary-text, #1a1a1a);
        }
      `}</style>
    </div>
  );
}
