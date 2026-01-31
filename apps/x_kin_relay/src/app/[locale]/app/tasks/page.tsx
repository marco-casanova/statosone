"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Home, Menu, ChevronDown, Clock, Smile } from "lucide-react";

interface Client {
  id: string;
  full_name: string;
}

interface CategoryItem {
  id: string;
  name: string;
  subcategories?: SubcategoryItem[];
}

interface SubcategoryItem {
  id: string;
  name: string;
  color?: string;
}

interface TaskFormData {
  time: string;
  notes: string;
  subcategory?: string;
}

// Task categories based on the mockup
const TASK_CATEGORIES: CategoryItem[] = [
  { id: "rest", name: "PATRÓN DE DESCANSO" },
  { id: "personal-care", name: "CUIDADO PERSONAL" },
  { id: "hydration", name: "HIDRATACIÓN" },
  { id: "nutrition", name: "NUTRICIÓN" },
  { id: "mobility", name: "MOVILIDAD" },
  { id: "continence", name: "CONTINENCIA/INCONTINENCIA" },
  { id: "activity", name: "ACTIVIDAD" },
  {
    id: "medication",
    name: "ADMINISTRACIÓN DE MEDICAMENTOS",
    subcategories: [],
  },
  {
    id: "behavior",
    name: "PATRÓN DE CONDUCTA",
    subcategories: [
      { id: "aggression", name: "AGRESIÓN", color: "#F97316" },
      { id: "violence", name: "VIOLENCIA", color: "#F97316" },
      { id: "hallucinations", name: "HALUCINACIONES", color: "#F97316" },
    ],
  },
  {
    id: "incident",
    name: "INCIDENTE",
    subcategories: [
      { id: "abrasion", name: "ABRASIÓN", color: "#F97316" },
      { id: "fall", name: "CAÍDA", color: "#F5D547" },
      { id: "laceration", name: "CORTADA/LACERACIÓN", color: "#F97316" },
      { id: "abuse", name: "ABUSO", color: "#F97316" },
    ],
  },
];

export default function TasksPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/").filter(Boolean)[0] || "en";

  // State
  const [clients, setClients] = useState<Client[]>([
    { id: "1", full_name: "NOMBRE CLIENTE 1" },
    { id: "2", full_name: "NOMBRE CLIENTE 2" },
    { id: "3", full_name: "NOMBRE CLIENTE 3" },
  ]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    clients[1] || null,
  );
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Task form states for different categories
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    concentration: "",
    dose: "",
    time: "07:05",
  });

  const [behaviorForm, setBehaviorForm] = useState({
    subcategory: "",
    time: "07:05",
    antecedent: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    subcategory: "",
    time: "07:05",
    cause: "",
  });

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleGoHome = () => {
    router.push(`/${locale}/app/home`);
  };

  const handleSave = (categoryId: string) => {
    // Handle save logic here
    console.log("Saving for category:", categoryId);
    setExpandedCategory(null);
  };

  const renderCategoryContent = (category: CategoryItem) => {
    switch (category.id) {
      case "medication":
        return (
          <div className="category-form">
            <input
              type="text"
              placeholder="NOMBRE DEL MEDICAMENTO"
              className="form-input"
              value={medicationForm.name}
              onChange={(e) =>
                setMedicationForm({ ...medicationForm, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="CONCENTRACIÓN (500mg, 5%, ...)"
              className="form-input"
              value={medicationForm.concentration}
              onChange={(e) =>
                setMedicationForm({
                  ...medicationForm,
                  concentration: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="DOSIS ADMINISTRADA (2 tabletas, 15ml...)"
              className="form-input"
              value={medicationForm.dose}
              onChange={(e) =>
                setMedicationForm({ ...medicationForm, dose: e.target.value })
              }
            />
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="text"
                  value={medicationForm.time}
                  onChange={(e) =>
                    setMedicationForm({
                      ...medicationForm,
                      time: e.target.value,
                    })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
              <button
                className="save-btn"
                onClick={() => handleSave("medication")}
              >
                GUARDAR ↵
              </button>
            </div>
          </div>
        );

      case "behavior":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {category.subcategories?.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    behaviorForm.subcategory === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      behaviorForm.subcategory === sub.id
                        ? sub.color
                        : undefined,
                  }}
                  onClick={() =>
                    setBehaviorForm({ ...behaviorForm, subcategory: sub.id })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="text"
                  value={behaviorForm.time}
                  onChange={(e) =>
                    setBehaviorForm({ ...behaviorForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
            </div>
            <input
              type="text"
              placeholder="ANTECEDENTE DE LA CONDUCTA"
              className="form-input"
              value={behaviorForm.antecedent}
              onChange={(e) =>
                setBehaviorForm({ ...behaviorForm, antecedent: e.target.value })
              }
            />
            <button className="save-btn" onClick={() => handleSave("behavior")}>
              GUARDAR ↵
            </button>
          </div>
        );

      case "incident":
        return (
          <div className="category-form">
            <div className="subcategory-options">
              {category.subcategories?.map((sub) => (
                <button
                  key={sub.id}
                  className={`subcategory-btn ${
                    incidentForm.subcategory === sub.id ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      incidentForm.subcategory === sub.id
                        ? sub.color
                        : undefined,
                  }}
                  onClick={() =>
                    setIncidentForm({ ...incidentForm, subcategory: sub.id })
                  }
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="form-row">
              <div className="time-picker">
                <input
                  type="text"
                  value={incidentForm.time}
                  onChange={(e) =>
                    setIncidentForm({ ...incidentForm, time: e.target.value })
                  }
                  className="time-input"
                />
                <Clock size={16} className="time-icon" />
              </div>
            </div>
            <input
              type="text"
              placeholder="PROBABLE CAUSA DEL INCIDENTE"
              className="form-input"
              value={incidentForm.cause}
              onChange={(e) =>
                setIncidentForm({ ...incidentForm, cause: e.target.value })
              }
            />
            <button className="save-btn" onClick={() => handleSave("incident")}>
              GUARDAR ↵
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="tasks-page">
      {/* Header */}
      <header className="tasks-header">
        <button className="header-btn" onClick={handleGoHome}>
          <Home size={24} />
        </button>

        <div className="header-center">
          <h1 className="tasks-title">TAREAS</h1>
          <div
            className="client-selector"
            onClick={() => setShowClientDropdown(!showClientDropdown)}
          >
            <span className="client-name">
              ({selectedClient?.full_name || "SELECCIONAR CLIENTE"})
            </span>
            <button className="emoji-btn">
              <Smile size={20} />
            </button>
          </div>
          {showClientDropdown && (
            <div className="client-dropdown">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className={`client-option ${
                    selectedClient?.id === client.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientDropdown(false);
                  }}
                >
                  ({client.full_name})
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="header-btn" onClick={() => setShowMenu(!showMenu)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Task Categories */}
      <div className="tasks-content">
        {TASK_CATEGORIES.map((category) => (
          <div key={category.id} className="task-category">
            <button
              className="category-header"
              onClick={() => handleCategoryToggle(category.id)}
            >
              <span className="category-name">{category.name}</span>
              <ChevronDown
                size={16}
                className={`category-icon ${
                  expandedCategory === category.id ? "expanded" : ""
                }`}
              />
            </button>

            {expandedCategory === category.id && (
              <div className="category-content">
                {renderCategoryContent(category)}
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .tasks-page {
          min-height: 100vh;
          background: var(--kinrelay-bg-primary, #88b9b0);
          padding: 16px;
          padding-top: env(safe-area-inset-top, 16px);
        }

        .tasks-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 16px;
        }

        .header-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          color: var(--kinrelay-text-primary, #1a1a1a);
        }

        .header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .tasks-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: 0.5px;
        }

        .client-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px 12px;
          background: var(--kinrelay-primary, #f5d547);
          border-radius: 8px;
        }

        .client-name {
          font-size: 12px;
          font-weight: 600;
        }

        .emoji-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: var(--kinrelay-primary, #f5d547);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .client-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100;
          min-width: 200px;
          overflow: hidden;
          margin-top: 4px;
        }

        .client-option {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .client-option:hover {
          background: #f5f5f5;
        }

        .client-option.selected {
          background: var(--kinrelay-primary, #f5d547);
        }

        .tasks-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 400px;
          margin: 0 auto;
        }

        .task-category {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 16px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          font-size: 12px;
          font-weight: 500;
          color: var(--kinrelay-text-secondary, #4a4a4a);
          text-transform: uppercase;
        }

        .category-icon {
          transition: transform 0.2s ease;
          color: var(--kinrelay-text-muted, #6b7280);
        }

        .category-icon.expanded {
          transform: rotate(180deg);
        }

        .category-content {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .category-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: none;
          border-bottom: 1px solid #d1d5db;
          background: transparent;
          font-size: 11px;
          color: var(--kinrelay-text-muted, #6b7280);
          text-transform: uppercase;
        }

        .form-input::placeholder {
          color: var(--kinrelay-text-placeholder, #9ca3af);
        }

        .form-input:focus {
          outline: none;
          border-bottom-color: var(--kinrelay-primary, #f5d547);
        }

        .form-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .time-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .time-input {
          width: 50px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }

        .time-input:focus {
          outline: none;
        }

        .time-icon {
          color: var(--kinrelay-text-muted, #6b7280);
        }

        .save-btn {
          padding: 10px 16px;
          background: var(--kinrelay-primary, #f5d547);
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
        }

        .subcategory-options {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .subcategory-btn {
          padding: 10px 14px;
          border: none;
          background: #f5f5f5;
          text-align: left;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .subcategory-btn:hover {
          background: #e5e5e5;
        }

        .subcategory-btn.active {
          color: white;
        }
      `}</style>
    </div>
  );
}
