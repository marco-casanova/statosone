"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

// ───────── Types ─────────

export interface EquipmentItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

export type EquipmentContext = "transfer" | "ambulation";

interface EquipmentOption {
  id: string;
  label: string;
  group: string;
  contexts: EquipmentContext[];
}

interface Props {
  context: EquipmentContext;
  value: EquipmentItem[];
  onChange: (next: EquipmentItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// ───────── Predefined equipment catalogue ─────────

const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  // ── Transfer ──
  // No equipment
  { id: "none", label: "None", group: "No equipment", contexts: ["transfer"] },
  // Manual assists
  {
    id: "gait_belt",
    label: "Gait belt",
    group: "Manual assists",
    contexts: ["transfer"],
  },
  {
    id: "slide_board",
    label: "Slide board",
    group: "Manual assists",
    contexts: ["transfer"],
  },
  {
    id: "slide_sheet",
    label: "Slide sheet",
    group: "Manual assists",
    contexts: ["transfer"],
  },
  {
    id: "pivot_turn_disc",
    label: "Pivot/turn disc",
    group: "Manual assists",
    contexts: ["transfer"],
  },
  {
    id: "swivel_cushion",
    label: "Swivel cushion",
    group: "Manual assists",
    contexts: ["transfer"],
  },
  // Supports & rails
  {
    id: "grab_bars",
    label: "Grab bars",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  {
    id: "handrail_tr",
    label: "Handrail",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  {
    id: "toilet_safety_frame",
    label: "Toilet safety frame",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  {
    id: "bed_rail",
    label: "Bed rail",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  {
    id: "transfer_pole",
    label: "Transfer pole",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  {
    id: "bed_trapeze",
    label: "Bed trapeze",
    group: "Supports & rails",
    contexts: ["transfer"],
  },
  // Mechanical lifts
  {
    id: "full_body_lift",
    label: "Full-body lift (Hoyer lift)",
    group: "Mechanical lifts",
    contexts: ["transfer"],
  },
  {
    id: "ceiling_track_lift",
    label: "Ceiling/track lift",
    group: "Mechanical lifts",
    contexts: ["transfer"],
  },
  {
    id: "sit_to_stand_lift",
    label: "Sit-to-stand lift",
    group: "Mechanical lifts",
    contexts: ["transfer"],
  },
  {
    id: "lift_chair",
    label: "Lift chair",
    group: "Mechanical lifts",
    contexts: ["transfer"],
  },
  // Wheelchairs used for transfer
  {
    id: "manual_wheelchair_tr",
    label: "Manual wheelchair",
    group: "Wheelchairs used for transfer",
    contexts: ["transfer"],
  },
  {
    id: "power_wheelchair_tr",
    label: "Power wheelchair",
    group: "Wheelchairs used for transfer",
    contexts: ["transfer"],
  },
  {
    id: "transport_wheelchair",
    label: "Transport wheelchair",
    group: "Wheelchairs used for transfer",
    contexts: ["transfer"],
  },
  // Bathroom transfer aids
  {
    id: "commode_chair",
    label: "Commode chair",
    group: "Bathroom transfer aids",
    contexts: ["transfer"],
  },
  {
    id: "raised_toilet_seat",
    label: "Raised toilet seat",
    group: "Bathroom transfer aids",
    contexts: ["transfer"],
  },
  {
    id: "shower_chair",
    label: "Shower chair",
    group: "Bathroom transfer aids",
    contexts: ["transfer"],
  },
  {
    id: "tub_transfer_bench",
    label: "Tub transfer bench",
    group: "Bathroom transfer aids",
    contexts: ["transfer"],
  },
  {
    id: "bath_board",
    label: "Bath board",
    group: "Bathroom transfer aids",
    contexts: ["transfer"],
  },

  // ── Ambulation / walk ──
  // No device
  {
    id: "none_amb",
    label: "None",
    group: "No device",
    contexts: ["ambulation"],
  },
  // Canes
  {
    id: "single_point_cane",
    label: "Single-point cane",
    group: "Canes",
    contexts: ["ambulation"],
  },
  {
    id: "quad_cane",
    label: "Quad cane",
    group: "Canes",
    contexts: ["ambulation"],
  },
  // Crutches
  {
    id: "axillary_crutches",
    label: "Axillary crutches",
    group: "Crutches",
    contexts: ["ambulation"],
  },
  {
    id: "forearm_crutches",
    label: "Forearm crutches",
    group: "Crutches",
    contexts: ["ambulation"],
  },
  // Walkers
  {
    id: "standard_walker",
    label: "Standard walker",
    group: "Walkers",
    contexts: ["ambulation"],
  },
  {
    id: "two_wheel_walker",
    label: "2-wheel walker",
    group: "Walkers",
    contexts: ["ambulation"],
  },
  {
    id: "rollator",
    label: "Rollator (4-wheel walker)",
    group: "Walkers",
    contexts: ["ambulation"],
  },
  {
    id: "platform_walker",
    label: "Platform walker",
    group: "Walkers",
    contexts: ["ambulation"],
  },
  {
    id: "gait_trainer",
    label: "Gait trainer",
    group: "Walkers",
    contexts: ["ambulation"],
  },
  // Mobility alternatives
  {
    id: "manual_wheelchair_amb",
    label: "Manual wheelchair",
    group: "Mobility alternatives",
    contexts: ["ambulation"],
  },
  {
    id: "power_wheelchair_amb",
    label: "Power wheelchair",
    group: "Mobility alternatives",
    contexts: ["ambulation"],
  },
  {
    id: "mobility_scooter",
    label: "Mobility scooter",
    group: "Mobility alternatives",
    contexts: ["ambulation"],
  },
  // Orthoses / support
  {
    id: "afo",
    label: "AFO (ankle-foot orthosis)",
    group: "Orthoses / support",
    contexts: ["ambulation"],
  },
  {
    id: "kafo",
    label: "KAFO (knee-ankle-foot orthosis)",
    group: "Orthoses / support",
    contexts: ["ambulation"],
  },
  {
    id: "knee_brace",
    label: "Knee brace",
    group: "Orthoses / support",
    contexts: ["ambulation"],
  },
  {
    id: "prosthesis",
    label: "Prosthesis",
    group: "Orthoses / support",
    contexts: ["ambulation"],
  },
  {
    id: "orthopedic_shoes",
    label: "Orthopedic shoes",
    group: "Orthoses / support",
    contexts: ["ambulation"],
  },
  // Other
  {
    id: "portable_oxygen",
    label: "Portable oxygen",
    group: "Other",
    contexts: ["ambulation"],
  },
  {
    id: "body_weight_support_harness",
    label: "Body-weight support harness",
    group: "Other",
    contexts: ["ambulation"],
  },
];

// ───────── Helpers ─────────

function toKebab(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isDuplicate(list: EquipmentItem[], label: string): boolean {
  const lower = label.toLowerCase();
  return list.some((item) => item.label.toLowerCase() === lower);
}

// ───────── Component ─────────

export function EquipmentMultiSelect({
  context,
  value,
  onChange,
  placeholder,
  disabled = false,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const listboxId = "equipment-listbox";

  // Filter options for this context, excluding already-selected items
  const filteredOptions = useMemo(() => {
    const selectedIds = new Set(value.map((v) => v.id));
    const query = inputValue.toLowerCase();
    return EQUIPMENT_OPTIONS.filter(
      (o) =>
        o.contexts.includes(context) &&
        !selectedIds.has(o.id) &&
        o.label.toLowerCase().includes(query),
    );
  }, [context, value, inputValue]);

  // Group filtered options for display
  const groupedOptions = useMemo(() => {
    const groups: { label: string; items: EquipmentOption[] }[] = [];
    const seen = new Set<string>();
    for (const opt of filteredOptions) {
      if (!seen.has(opt.group)) {
        seen.add(opt.group);
        groups.push({ label: opt.group, items: [] });
      }
      groups.find((g) => g.label === opt.group)!.items.push(opt);
    }
    return groups;
  }, [filteredOptions]);

  // Flat list for keyboard nav
  const flatOptions = filteredOptions;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keep highlighted index in range
  useEffect(() => {
    if (highlightedIndex >= flatOptions.length) {
      setHighlightedIndex(Math.max(flatOptions.length - 1, -1));
    }
  }, [flatOptions.length, highlightedIndex]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listboxRef.current) return;
    const el = listboxRef.current.querySelector(
      `[data-option-index="${highlightedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const addItem = useCallback(
    (item: EquipmentItem) => {
      if (isDuplicate(value, item.label)) return;
      onChange([...value, item]);
      setInputValue("");
      setHighlightedIndex(-1);
    },
    [value, onChange],
  );

  const removeItem = useCallback(
    (id: string) => {
      onChange(value.filter((v) => v.id !== id));
    },
    [value, onChange],
  );

  const addCustom = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (isDuplicate(value, trimmed)) {
        setInputValue("");
        return;
      }
      addItem({
        id: `custom:${toKebab(trimmed)}`,
        label: trimmed,
        isCustom: true,
      });
    },
    [value, addItem],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < flatOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : flatOptions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
        const opt = flatOptions[highlightedIndex];
        addItem({ id: opt.id, label: opt.label });
      } else {
        addCustom(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeItem(value[value.length - 1].id);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function handleOptionClick(opt: EquipmentOption) {
    addItem({ id: opt.id, label: opt.label });
    inputRef.current?.focus();
  }

  // Build flat-option index for keyboard highlight
  let globalIdx = -1;
  const activeDescendant =
    highlightedIndex >= 0 ? `eq-option-${highlightedIndex}` : undefined;

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      {/* Tags + input row */}
      <div
        style={{
          ...tagRowStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {value.map((item) => (
          <span key={item.id} style={item.isCustom ? customTagStyle : tagStyle}>
            {item.label}
            {!disabled && (
              <button
                type="button"
                style={tagRemoveBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                aria-label={`Remove ${item.label}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? (placeholder ?? "Search or type…") : ""
          }
          disabled={disabled}
          style={inputStyle}
          role="combobox"
          aria-expanded={isOpen && flatOptions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {isOpen && flatOptions.length > 0 && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          style={dropdownStyle}
        >
          {groupedOptions.map((group) => (
            <div key={group.label}>
              <div style={groupHeaderStyle}>{group.label}</div>
              {group.items.map((opt) => {
                globalIdx += 1;
                const idx = globalIdx;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={opt.id}
                    id={`eq-option-${idx}`}
                    role="option"
                    data-option-index={idx}
                    aria-selected={isHighlighted}
                    style={{
                      ...optionStyle,
                      background: isHighlighted
                        ? "rgba(45, 212, 191, 0.15)"
                        : "transparent",
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // keep focus on input
                      handleOptionClick(opt);
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ───────── Styles ─────────

const wrapperStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  borderRadius: 14,
  padding: "10px 14px",
  minHeight: 54,
  transition: "border-color 0.2s ease",
};

const tagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "5px 10px",
  borderRadius: 999,
  background: "rgba(45, 212, 191, 0.15)",
  border: "1px solid rgba(45, 212, 191, 0.35)",
  color: "#0F766E",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: "nowrap",
};

const customTagStyle: React.CSSProperties = {
  ...tagStyle,
  background: "rgba(251, 191, 36, 0.15)",
  border: "1px solid rgba(251, 191, 36, 0.4)",
  color: "#92400E",
};

const tagRemoveBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1,
  color: "inherit",
  opacity: 0.6,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 100,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 15,
  color: "#1A1A1A",
  padding: "4px 0",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  maxHeight: 280,
  overflowY: "auto",
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  borderRadius: 14,
  boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
  zIndex: 50,
  padding: "6px 0",
};

const groupHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: "#6B7280",
  padding: "10px 14px 4px",
};

const optionStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 14,
  color: "#1A1A1A",
  cursor: "pointer",
  transition: "background 0.1s ease",
};
