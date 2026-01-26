"use client";
import React, { useState, useEffect } from "react";
import { IncidentCategory, CATEGORY_TO_SUBTYPES } from "../types/schema";
import { iconFor, a11yLabel } from "./activityIcons";

export interface QuickAction {
  category: IncidentCategory;
  subtype: string;
  label: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { category: "adl", subtype: "hydration", label: "Hydration" },
  { category: "safety", subtype: "falls", label: "Fall" },
];

const STORAGE_KEY = "kr_quick_actions";

export function loadQuickActions(): QuickAction[] {
  if (typeof window === "undefined") return DEFAULT_QUICK_ACTIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_QUICK_ACTIONS;
}

export function saveQuickActions(actions: QuickAction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

// Format helpers
function formatCategory(c: string) {
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
function formatSubtype(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Category colors
const categoryColors: Record<string, { color: string; bg: string }> = {
  safety: { color: "#F97316", bg: "rgba(249, 115, 22, 0.18)" },
  health_observation: { color: "#2DD4BF", bg: "rgba(45, 212, 191, 0.18)" },
  adl: { color: "#60A5FA", bg: "rgba(96, 165, 250, 0.18)" },
  environment: { color: "#34D399", bg: "rgba(52, 211, 153, 0.18)" },
  service: { color: "#FBBF24", bg: "rgba(251, 191, 36, 0.18)" },
  engagement: { color: "#C084FC", bg: "rgba(192, 132, 252, 0.18)" },
};

interface Props {
  onClose: () => void;
  onSave: (actions: QuickAction[]) => void;
  currentActions: QuickAction[];
}

export function QuickActionsManager({
  onClose,
  onSave,
  currentActions,
}: Props) {
  const [actions, setActions] = useState<QuickAction[]>(currentActions);
  const [addMode, setAddMode] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<IncidentCategory | null>(null);

  function addAction(category: IncidentCategory, subtype: string) {
    const exists = actions.some(
      (a) => a.category === category && a.subtype === subtype
    );
    if (exists) return;
    const newAction: QuickAction = {
      category,
      subtype,
      label: formatSubtype(subtype),
    };
    setActions([...actions, newAction]);
    setAddMode(false);
    setSelectedCategory(null);
  }

  function removeAction(idx: number) {
    setActions(actions.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const newActions = [...actions];
    [newActions[idx - 1], newActions[idx]] = [
      newActions[idx],
      newActions[idx - 1],
    ];
    setActions(newActions);
  }

  function moveDown(idx: number) {
    if (idx === actions.length - 1) return;
    const newActions = [...actions];
    [newActions[idx], newActions[idx + 1]] = [
      newActions[idx + 1],
      newActions[idx],
    ];
    setActions(newActions);
  }

  function handleSave() {
    saveQuickActions(actions);
    onSave(actions);
    onClose();
  }

  const categories = Object.keys(CATEGORY_TO_SUBTYPES) as IncidentCategory[];

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <h3 style={title}>Manage Quick Actions</h3>
          <button onClick={onClose} style={closeBtn}>
            ×
          </button>
        </div>

        <div style={content}>
          {/* Current actions list */}
          <div style={sectionLabel}>Your Quick Actions ({actions.length})</div>
          {actions.length === 0 ? (
            <div style={emptyMsg}>No quick actions. Add some below!</div>
          ) : (
            <div style={actionsList}>
              {actions.map((action, idx) => {
                const colors = categoryColors[action.category] || {
                  color: "#6C7CFF",
                  bg: "rgba(108,124,255,0.18)",
                };
                return (
                  <div
                    key={`${action.category}-${action.subtype}-${idx}`}
                    style={{
                      ...actionItem,
                      background: colors.bg,
                      borderColor: colors.color,
                    }}
                  >
                    <span
                      style={{
                        ...iconBadge,
                        background: colors.bg,
                        color: colors.color,
                      }}
                    >
                      {iconFor(action.category, action.subtype)}
                    </span>
                    <div style={actionInfo}>
                      <span style={actionLabel}>{action.label}</span>
                      <span style={actionCat}>
                        {formatCategory(action.category)}
                      </span>
                    </div>
                    <div style={actionBtns}>
                      <button
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        style={orderBtn}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(idx)}
                        disabled={idx === actions.length - 1}
                        style={orderBtn}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeAction(idx)}
                        style={removeBtn}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new action */}
          {!addMode ? (
            <button onClick={() => setAddMode(true)} style={addBtn}>
              + Add Quick Action
            </button>
          ) : (
            <div style={addSection}>
              <div style={sectionLabel}>Select Category</div>
              <div style={catGrid}>
                {categories.map((cat) => {
                  const colors = categoryColors[cat] || {
                    color: "#6C7CFF",
                    bg: "rgba(108,124,255,0.18)",
                  };
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        ...catBtn,
                        background: isSelected ? colors.color : colors.bg,
                        color: isSelected ? "#fff" : colors.color,
                        borderColor: colors.color,
                      }}
                    >
                      <span>{iconFor(cat)}</span>
                      <span>{formatCategory(cat)}</span>
                    </button>
                  );
                })}
              </div>

              {selectedCategory && (
                <>
                  <div style={sectionLabel}>Select Subtype</div>
                  <div style={subtypeGrid}>
                    {CATEGORY_TO_SUBTYPES[selectedCategory].values.map(
                      (sub) => {
                        const alreadyAdded = actions.some(
                          (a) =>
                            a.category === selectedCategory && a.subtype === sub
                        );
                        const colors = categoryColors[selectedCategory] || {
                          color: "#6C7CFF",
                          bg: "rgba(108,124,255,0.18)",
                        };
                        return (
                          <button
                            key={sub}
                            onClick={() => addAction(selectedCategory, sub)}
                            disabled={alreadyAdded}
                            style={{
                              ...subBtn,
                              background: alreadyAdded ? "#1E2530" : colors.bg,
                              color: alreadyAdded ? "#666" : colors.color,
                              borderColor: alreadyAdded ? "#333" : colors.color,
                              opacity: alreadyAdded ? 0.5 : 1,
                              cursor: alreadyAdded ? "not-allowed" : "pointer",
                            }}
                          >
                            <span>{iconFor(selectedCategory, sub)}</span>
                            <span>{formatSubtype(sub)}</span>
                            {alreadyAdded && (
                              <span style={addedTag}>Added</span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  setAddMode(false);
                  setSelectedCategory(null);
                }}
                style={cancelBtn}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={footer}>
          <button onClick={onClose} style={cancelBtnFooter}>
            Cancel
          </button>
          <button onClick={handleSave} style={saveBtn}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const overlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 20,
};

const modal: React.CSSProperties = {
  background: "#141A23",
  borderRadius: 18,
  width: "100%",
  maxWidth: 600,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  border: "1px solid #2A3342",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 24px",
  borderBottom: "1px solid #2A3342",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  color: "#fff",
};

const closeBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#B6C0D1",
  fontSize: 28,
  cursor: "pointer",
  padding: 0,
  lineHeight: 1,
};

const content: React.CSSProperties = {
  padding: 24,
  overflowY: "auto",
  flex: 1,
};

const sectionLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#B6C0D1",
  marginBottom: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const emptyMsg: React.CSSProperties = {
  color: "#666",
  fontSize: 15,
  padding: "20px 0",
  textAlign: "center",
};

const actionsList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginBottom: 20,
};

const actionItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  borderRadius: 14,
  border: "2px solid",
};

const iconBadge: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
};

const actionInfo: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const actionLabel: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: "#fff",
};

const actionCat: React.CSSProperties = {
  fontSize: 13,
  color: "#B6C0D1",
};

const actionBtns: React.CSSProperties = {
  display: "flex",
  gap: 6,
};

const orderBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#1E2530",
  border: "1px solid #2A3342",
  color: "#B6C0D1",
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const removeBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "rgba(239, 68, 68, 0.2)",
  border: "1px solid rgba(239, 68, 68, 0.4)",
  color: "#EF4444",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const addBtn: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: 14,
  background: "#1E2530",
  border: "2px dashed #2A3342",
  color: "#6C7CFF",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 10,
};

const addSection: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  background: "#1E2530",
  borderRadius: 14,
};

const catGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 10,
  marginBottom: 20,
};

const catBtn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: "14px 10px",
  borderRadius: 12,
  border: "2px solid",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const subtypeGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const subBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid",
  fontSize: 14,
  fontWeight: 500,
  position: "relative",
};

const addedTag: React.CSSProperties = {
  position: "absolute",
  right: 8,
  fontSize: 10,
  textTransform: "uppercase",
  opacity: 0.7,
};

const cancelBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  background: "transparent",
  border: "1px solid #2A3342",
  color: "#B6C0D1",
  fontSize: 14,
  cursor: "pointer",
  marginTop: 10,
};

const footer: React.CSSProperties = {
  display: "flex",
  gap: 12,
  padding: "16px 24px",
  borderTop: "1px solid #2A3342",
};

const cancelBtnFooter: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  background: "#1E2530",
  border: "1px solid #2A3342",
  color: "#B6C0D1",
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  background: "#6C7CFF",
  border: "none",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
};
