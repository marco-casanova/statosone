"use client";

import React, { KeyboardEvent, useState } from "react";
import {
  BodyLocation,
  BodyMapView,
  BodyRegion,
  BODY_REGION_LABELS,
  BODY_VIEW_LABELS,
  bodyLocationKey,
  bodyLocationLabel,
  regionRequiresSide,
} from "../types/bodyLocation";
import { SvgShape, BodyRegionSvgDef, BODY_VIEW_SPECS } from "./bodyMapSvgData";

interface BodyLocationPickerProps {
  value: BodyLocation[];
  onChange: (value: BodyLocation[]) => void;
  embedded?: boolean;
}

const BODY_SVG_STYLE = `
  .body-outline {
    fill: none;
    stroke: #1f2937;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .body-region {
    fill: rgba(90, 120, 200, 0.10);
    stroke: rgba(90, 120, 200, 0.18);
    stroke-width: 1.5;
    cursor: pointer;
    transition: fill 120ms ease, stroke 120ms ease;
  }
  .body-region:hover {
    fill: rgba(90, 120, 200, 0.18);
  }
`;

const BODY_VIEW_ORDER: BodyMapView[] = [
  "front",
  "back",
  "left_side",
  "right_side",
];

export function BodyLocationPicker({
  value,
  onChange,
  embedded = false,
}: BodyLocationPickerProps) {
  const [pendingSelection, setPendingSelection] = useState<{
    region: BodyRegion;
    view: BodyMapView;
  } | null>(null);

  function addLocation(location: BodyLocation) {
    const nextKey = bodyLocationKey(location);
    if (value.some((entry) => bodyLocationKey(entry) === nextKey)) {
      setPendingSelection(null);
      return;
    }
    onChange([...value, location]);
    setPendingSelection(null);
  }

  function removeLocation(location: BodyLocation) {
    const nextKey = bodyLocationKey(location);
    onChange(value.filter((entry) => bodyLocationKey(entry) !== nextKey));
  }

  function handleRegionPress(view: BodyMapView, regionDef: BodyRegionSvgDef) {
    const selectedLocation = value.find(
      (location) => isLocationSelectedForRegion(location, view, regionDef),
    );

    if (selectedLocation) {
      removeLocation(selectedLocation);
      return;
    }

    if (shouldPromptForSide(view, regionDef)) {
      setPendingSelection({ region: regionDef.region, view });
      return;
    }

    addLocation({
      region: regionDef.region,
      view,
      side: regionDef.side,
    });
  }

  return (
    <div style={pickerRoot}>
      {value.length > 0 && (
        <div style={chipList}>
          {value.map((location) => {
            const label = bodyLocationLabel(location);
            return (
              <span key={bodyLocationKey(location)} style={chip}>
                {label}
                <button
                  type="button"
                  style={chipRemoveBtn}
                  aria-label={`Remove ${label}`}
                  onClick={() => removeLocation(location)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div style={embedded ? embeddedPanel : drawerPanel}>
        <div style={drawerTopRow}>
          <div>
            <div style={drawerTitle}>Body map</div>
            <div style={drawerSubtitle}>
              Tap a region to select it. Tap a selected region again to remove
              it.
            </div>
          </div>
        </div>

        {pendingSelection && (
          <div style={lateralityCard}>
            <div style={lateralityTitle}>
              {BODY_REGION_LABELS[pendingSelection.region]} (
              {BODY_VIEW_LABELS[pendingSelection.view].toLowerCase()}): choose
              side
            </div>
            <div style={lateralityActions}>
              {(["left", "right", "both"] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  style={lateralityBtn}
                  onClick={() =>
                    addLocation({
                      region: pendingSelection.region,
                      view: pendingSelection.view,
                      side,
                    })
                  }
                >
                  {side === "both"
                    ? "Both"
                    : side === "left"
                      ? "Left"
                      : "Right"}
                </button>
              ))}
              <button
                type="button"
                style={lateralityGhostBtn}
                onClick={() => setPendingSelection(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={mapsRow}>
          {BODY_VIEW_ORDER.map((view) => (
            <BodyMapSvg
              key={view}
              view={view}
              value={value}
              pendingSelection={pendingSelection}
              onRegionPress={handleRegionPress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BodyMapSvg({
  view,
  value,
  pendingSelection,
  onRegionPress,
}: {
  view: BodyMapView;
  value: BodyLocation[];
  pendingSelection: {
    region: BodyRegion;
    view: BodyMapView;
  } | null;
  onRegionPress: (view: BodyMapView, regionDef: BodyRegionSvgDef) => void;
}) {
  const spec = BODY_VIEW_SPECS[view];
  const transform = spec.mirror ? "translate(260,0) scale(-1,1)" : undefined;

  return (
    <div style={mapPanel}>
      <div style={mapTitle}>{spec.title}</div>
      <div>
        <svg
          width="260"
          height="720"
          viewBox="0 0 260 720"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`${spec.title} body map`}
          style={bodySvg}
        >
          <style>{BODY_SVG_STYLE}</style>
          <g id={`view-${view.replace("_", "-")}`} transform={transform}>
            <g id="body-outline">
              {spec.outline.map((shape, index) =>
                renderSvgShape(
                  shape,
                  `outline-${view}-${index}`,
                  "body-outline",
                ),
              )}
            </g>
            <g id="body-regions">
              {spec.regions.map((regionDef) => {
                const isSelected = value.some((location) =>
                  isLocationSelectedForRegion(location, view, regionDef),
                );
                const isPending =
                  pendingSelection?.region === regionDef.region &&
                  pendingSelection.view === view &&
                  (!regionDef.side || !pendingSelection);
                return (
                  <g
                    key={regionDef.id}
                    id={regionDef.id}
                    className="body-region"
                    data-region={regionDef.region}
                    data-view={view}
                    data-side={regionDef.side}
                    role="button"
                    tabIndex={0}
                    aria-label={regionAriaLabel(spec.title, regionDef)}
                    aria-pressed={isSelected}
                    style={regionStyle(isSelected || isPending)}
                    onClick={() => onRegionPress(view, regionDef)}
                    onKeyDown={(event) =>
                      handleRegionKeyDown(event, () =>
                        onRegionPress(view, regionDef),
                      )
                    }
                  >
                    <title>{regionDef.title}</title>
                    {renderSvgShape(regionDef.shape, `${regionDef.id}-shape`)}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

function renderSvgShape(shape: SvgShape, key: string, className?: string) {
  if (shape.kind === "ellipse") {
    return (
      <ellipse
        key={key}
        className={className}
        cx={shape.cx}
        cy={shape.cy}
        rx={shape.rx}
        ry={shape.ry}
      />
    );
  }

  return <path key={key} className={className} d={shape.d} />;
}

function handleRegionKeyDown(
  event: KeyboardEvent<SVGGElement>,
  onActivate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  event.preventDefault();
  onActivate();
}

function regionAriaLabel(title: string, regionDef: BodyRegionSvgDef) {
  if (regionDef.side) {
    return `${title} ${regionDef.side === "left" ? "Left" : "Right"} ${BODY_REGION_LABELS[regionDef.region]}`;
  }
  return `${title} ${BODY_REGION_LABELS[regionDef.region]}`;
}

function regionStyle(isActive: boolean): React.CSSProperties {
  if (!isActive) {
    return { cursor: "pointer" };
  }

  return {
    cursor: "pointer",
    fill: "rgba(239, 68, 68, 0.5)",
    stroke: "#DC2626",
  };
}

function isLocationSelectedForRegion(
  location: BodyLocation,
  view: BodyMapView,
  regionDef: BodyRegionSvgDef,
) {
  if (location.region !== regionDef.region || location.view !== view) {
    return false;
  }
  if (!regionDef.side) {
    return !location.side;
  }
  return location.side === regionDef.side || location.side === "both";
}

function shouldPromptForSide(view: BodyMapView, regionDef: BodyRegionSvgDef) {
  return (
    (view === "front" || view === "back") &&
    regionRequiresSide(regionDef.region) &&
    !regionDef.side
  );
}

const pickerRoot: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const chipList: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(108, 124, 255, 0.12)",
  border: "1px solid rgba(108, 124, 255, 0.2)",
  color: "#1A1A1A",
  fontSize: 13,
  fontWeight: 600,
};

const chipRemoveBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#4B5563",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: 0,
};

const drawerPanel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const drawerTopRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
};

const drawerTitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#111827",
};

const drawerSubtitle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  color: "#6B7280",
};

const embeddedPanel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 0,
};

const lateralityCard: React.CSSProperties = {
  marginTop: 18,
  padding: 16,
  borderRadius: 18,
  background: "rgba(108, 124, 255, 0.08)",
  border: "1px solid rgba(108, 124, 255, 0.14)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const lateralityTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#1F2937",
};

const lateralityActions: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const lateralityBtn: React.CSSProperties = {
  border: "none",
  background: "#6C7CFF",
  color: "#fff",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const lateralityGhostBtn: React.CSSProperties = {
  border: "1px solid rgba(15, 23, 42, 0.08)",
  background: "#fff",
  color: "#374151",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const mapsRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "nowrap",
  gap: 18,
  alignItems: "flex-start",
  marginTop: 20,
  overflowX: "auto",
  paddingBottom: 8,
};

const mapPanel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  flex: "0 0 260px",
  width: 260,
};

const mapTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const bodySvg: React.CSSProperties = {
  display: "block",
  width: 260,
  height: "auto",
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98))",
  border: "1px solid rgba(15, 23, 42, 0.06)",
};
