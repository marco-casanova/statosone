"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  BodyLocation,
  BodyMapView,
  BodyRegion,
  bodyLocationKey,
  bodyLocationLabel,
} from "../types/bodyLocation";

interface BodyLocationPickerProps {
  value: BodyLocation[];
  onChange: (value: BodyLocation[]) => void;
  embedded?: boolean;
}

type DatasetView = "front" | "back" | "left" | "right";

const DATASET_VIEW_LABELS: Record<DatasetView, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
};

const DATASET_TO_MODEL_VIEW: Record<DatasetView, BodyMapView> = {
  front: "front",
  back: "back",
  left: "left_side",
  right: "right_side",
};

function toDatasetView(view: BodyMapView): DatasetView {
  if (view === "front" || view === "back") {
    return view;
  }
  return view === "left_side" ? "left" : "right";
}

function isDatasetView(value: string | null): value is DatasetView {
  return value === "front" || value === "back" || value === "left" || value === "right";
}

function humanizeToken(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function regionAriaLabel(view: DatasetView, part: string) {
  return `${DATASET_VIEW_LABELS[view]} ${humanizeToken(part)}`;
}

function regionDatasetKey(view: DatasetView, part: string) {
  return `${view}:${part}`;
}

function locationDatasetKey(location: BodyLocation) {
  return regionDatasetKey(toDatasetView(location.view), location.region);
}

function regionDataFromElement(element: Element) {
  const view = element.getAttribute("data-view");
  const part = element.getAttribute("data-part");

  if (!isDatasetView(view) || !part) {
    return null;
  }

  return {
    datasetView: view,
    modelView: DATASET_TO_MODEL_VIEW[view],
    part: part as BodyRegion,
    key: regionDatasetKey(view, part),
  };
}

export function BodyLocationPicker({
  value,
  onChange,
  embedded = false,
}: BodyLocationPickerProps) {
  const svgHostRef = useRef<HTMLDivElement>(null);

  const selectedKeys = useMemo(
    () => new Set(value.map((location) => locationDatasetKey(location))),
    [value],
  );

  const selectedSummary = useMemo(
    () => value.map((location) => locationDatasetKey(location)).join(", "),
    [value],
  );

  function toggleLocation(modelView: BodyMapView, part: BodyRegion) {
    const nextKey = regionDatasetKey(toDatasetView(modelView), part);
    const exists = value.some((location) => locationDatasetKey(location) === nextKey);

    if (exists) {
      onChange(value.filter((location) => locationDatasetKey(location) !== nextKey));
      return;
    }

    onChange([
      ...value,
      {
        view: modelView,
        region: part,
      },
    ]);
  }

  function activateRegion(target: EventTarget | null) {
    if (!(target instanceof Element)) {
      return;
    }
    const region = target.closest(".region");
    if (!(region instanceof Element)) {
      return;
    }

    const data = regionDataFromElement(region);
    if (!data) {
      return;
    }

    toggleLocation(data.modelView, data.part);
  }

  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) {
      return;
    }

    const regions = Array.from(host.querySelectorAll<SVGElement>(".region"));
    const firstByKey = new Set<string>();

    for (const region of regions) {
      const data = regionDataFromElement(region);
      if (!data) {
        continue;
      }

      const isSelected = selectedKeys.has(data.key);
      if (isSelected) {
        region.setAttribute("data-selected", "true");
      } else {
        region.removeAttribute("data-selected");
      }
      region.setAttribute("aria-pressed", isSelected ? "true" : "false");

      if (!firstByKey.has(data.key)) {
        firstByKey.add(data.key);
        region.setAttribute("role", "button");
        region.setAttribute("tabindex", "0");
        region.setAttribute("aria-label", regionAriaLabel(data.datasetView, data.part));
      } else {
        region.removeAttribute("role");
        region.removeAttribute("tabindex");
        region.removeAttribute("aria-label");
      }
    }
  }, [selectedKeys]);

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
                  onClick={() =>
                    onChange(
                      value.filter(
                        (entry) => bodyLocationKey(entry) !== bodyLocationKey(location),
                      ),
                    )
                  }
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
              Tap a region to select it. Tap a selected region again to remove it.
            </div>
          </div>
          <button
            type="button"
            style={clearBtn}
            onClick={() => onChange([])}
            disabled={value.length === 0}
          >
            Clear
          </button>
        </div>

        <div style={selectedRow}>
          <div style={selectedLabel}>Selected:</div>
          <div style={selectedValue}>{selectedSummary || "None"}</div>
        </div>

        <div
          ref={svgHostRef}
          style={svgHost}
          onClick={(event) => activateRegion(event.target)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }
            event.preventDefault();
            activateRegion(event.target);
          }}
          dangerouslySetInnerHTML={{ __html: BODY_MAP_SVG }}
        />
      </div>
    </div>
  );
}

const BODY_MAP_SVG = String.raw`<svg id="bodyMap" viewBox="0 0 1200 760" width="100%" style="border:1px solid #e5e7eb; border-radius:12px; background:#fff;">
  <style>
    .panel-title { font-size: 18px; fill: #111827; font-weight: 700; }
    .hint { font-size: 12px; fill: #6b7280; }
    .outline { fill: none; stroke: #0f172a; stroke-width: 2; pointer-events: none; opacity: .75; }
    .ghost { fill: #f8fafc; stroke: #e5e7eb; }
    .region { fill: rgba(0,0,0,0.001); stroke: rgba(0,0,0,0); cursor: pointer; }
    .region:hover { fill: rgba(255,125,22,0.25); }
    .region[data-selected="true"] { fill: rgba(255,125,22,0.45); stroke: rgba(255,125,22,0.8); stroke-width: 2; }
    .divider { stroke: #e5e7eb; stroke-width: 2; }
  </style>

  <rect class="ghost" x="20"  y="20" width="280" height="720" rx="16"></rect>
  <rect class="ghost" x="320" y="20" width="280" height="720" rx="16"></rect>
  <rect class="ghost" x="620" y="20" width="280" height="720" rx="16"></rect>
  <rect class="ghost" x="920" y="20" width="260" height="720" rx="16"></rect>

  <text class="panel-title" x="40"  y="52">Front</text>
  <text class="panel-title" x="340" y="52">Back</text>
  <text class="panel-title" x="640" y="52">Left side</text>
  <text class="panel-title" x="940" y="52">Right side</text>
  <text class="hint" x="40" y="74">Click to toggle selection</text>

  <g id="front" transform="translate(20, 0)">
    <g transform="translate(55, 95)">
      <ellipse class="outline" cx="85" cy="65" rx="50" ry="60"></ellipse>
      <rect class="outline" x="68" y="125" width="34" height="28" rx="10"></rect>
      <rect class="outline" x="35" y="155" width="100" height="160" rx="40"></rect>
      <rect class="outline" x="48" y="315" width="74" height="90" rx="30"></rect>

      <rect class="outline" x="-5"  y="165" width="35" height="110" rx="18"></rect>
      <rect class="outline" x="-5"  y="275" width="35" height="95"  rx="18"></rect>
      <rect class="outline" x="-1"  y="370" width="27" height="16"  rx="8"></rect>
      <rect class="outline" x="-6"  y="386" width="40" height="40"  rx="14"></rect>

      <rect class="outline" x="140" y="165" width="35" height="110" rx="18"></rect>
      <rect class="outline" x="140" y="275" width="35" height="95"  rx="18"></rect>
      <rect class="outline" x="144" y="370" width="27" height="16"  rx="8"></rect>
      <rect class="outline" x="137" y="386" width="40" height="40"  rx="14"></rect>

      <rect class="outline" x="44" y="405" width="36" height="140" rx="18"></rect>
      <rect class="outline" x="90" y="405" width="36" height="140" rx="18"></rect>
      <ellipse class="outline" cx="62" cy="548" rx="18" ry="12"></ellipse>
      <ellipse class="outline" cx="108" cy="548" rx="18" ry="12"></ellipse>
      <rect class="outline" x="44" y="560" width="36" height="95" rx="16"></rect>
      <rect class="outline" x="90" y="560" width="36" height="95" rx="16"></rect>
      <rect class="outline" x="38" y="655" width="48" height="22" rx="10"></rect>
      <rect class="outline" x="84" y="655" width="48" height="22" rx="10"></rect>

      <rect class="region" data-view="front" data-part="forehead" x="45" y="18" width="80" height="30" rx="12"></rect>
      <ellipse class="region" data-view="front" data-part="eyes" cx="85" cy="55" rx="40" ry="12"></ellipse>
      <polygon class="region" data-view="front" data-part="nose" points="85,55 75,78 85,82 95,78"></polygon>
      <ellipse class="region" data-view="front" data-part="cheeks" cx="85" cy="80" rx="46" ry="16"></ellipse>
      <rect class="region" data-view="front" data-part="mouth" x="62" y="92" width="46" height="14" rx="7"></rect>
      <rect class="region" data-view="front" data-part="chin" x="62" y="108" width="46" height="16" rx="8"></rect>

      <rect class="region" data-view="front" data-part="neck_throat" x="66" y="125" width="38" height="32" rx="10"></rect>

      <rect class="region" data-view="front" data-part="chest"   x="40" y="160" width="90" height="55" rx="18"></rect>
      <rect class="region" data-view="front" data-part="ribs"    x="35" y="215" width="100" height="45" rx="18"></rect>
      <rect class="region" data-view="front" data-part="abdomen" x="40" y="260" width="90" height="70" rx="22"></rect>
      <circle class="region" data-view="front" data-part="navel" cx="85" cy="300" r="10"></circle>

      <rect class="region" data-view="front" data-part="pelvis_groin" x="48" y="315" width="74" height="90" rx="26"></rect>

      <circle class="region" data-view="front" data-part="shoulders" cx="35" cy="175" r="22"></circle>
      <circle class="region" data-view="front" data-part="shoulders" cx="135" cy="175" r="22"></circle>

      <rect class="region" data-view="front" data-part="biceps" x="-5"  y="165" width="35" height="110" rx="18"></rect>
      <rect class="region" data-view="front" data-part="biceps" x="140" y="165" width="35" height="110" rx="18"></rect>

      <circle class="region" data-view="front" data-part="elbows" cx="12"  cy="275" r="16"></circle>
      <circle class="region" data-view="front" data-part="elbows" cx="158" cy="275" r="16"></circle>

      <rect class="region" data-view="front" data-part="forearms" x="-5"  y="275" width="35" height="95" rx="18"></rect>
      <rect class="region" data-view="front" data-part="forearms" x="140" y="275" width="35" height="95" rx="18"></rect>

      <rect class="region" data-view="front" data-part="wrists" x="-1"  y="370" width="27" height="18" rx="8"></rect>
      <rect class="region" data-view="front" data-part="wrists" x="144" y="370" width="27" height="18" rx="8"></rect>

      <rect class="region" data-view="front" data-part="palms" x="-6"  y="386" width="40" height="28" rx="12"></rect>
      <rect class="region" data-view="front" data-part="palms" x="137" y="386" width="40" height="28" rx="12"></rect>

      <rect class="region" data-view="front" data-part="fingers" x="-6"  y="414" width="40" height="12" rx="6"></rect>
      <rect class="region" data-view="front" data-part="fingers" x="137" y="414" width="40" height="12" rx="6"></rect>

      <rect class="region" data-view="front" data-part="thumbs" x="-12" y="392" width="12" height="18" rx="6"></rect>
      <rect class="region" data-view="front" data-part="thumbs" x="177" y="392" width="12" height="18" rx="6"></rect>

      <rect class="region" data-view="front" data-part="thighs_front" x="44" y="405" width="36" height="140" rx="18"></rect>
      <rect class="region" data-view="front" data-part="thighs_front" x="90" y="405" width="36" height="140" rx="18"></rect>

      <ellipse class="region" data-view="front" data-part="knees" cx="62"  cy="548" rx="18" ry="14"></ellipse>
      <ellipse class="region" data-view="front" data-part="knees" cx="108" cy="548" rx="18" ry="14"></ellipse>

      <rect class="region" data-view="front" data-part="shins" x="44" y="560" width="36" height="95" rx="16"></rect>
      <rect class="region" data-view="front" data-part="shins" x="90" y="560" width="36" height="95" rx="16"></rect>

      <rect class="region" data-view="front" data-part="ankles" x="44" y="652" width="36" height="18" rx="8"></rect>
      <rect class="region" data-view="front" data-part="ankles" x="90" y="652" width="36" height="18" rx="8"></rect>

      <rect class="region" data-view="front" data-part="top_of_feet" x="38" y="655" width="48" height="16" rx="8"></rect>
      <rect class="region" data-view="front" data-part="top_of_feet" x="84" y="655" width="48" height="16" rx="8"></rect>

      <rect class="region" data-view="front" data-part="toes" x="38" y="671" width="48" height="10" rx="5"></rect>
      <rect class="region" data-view="front" data-part="toes" x="84" y="671" width="48" height="10" rx="5"></rect>
    </g>
  </g>

  <g id="back" transform="translate(320, 0)">
    <g transform="translate(55, 95)">
      <ellipse class="outline" cx="85" cy="65" rx="50" ry="60"></ellipse>
      <rect class="outline" x="68" y="125" width="34" height="28" rx="10"></rect>
      <rect class="outline" x="35" y="155" width="100" height="160" rx="40"></rect>
      <rect class="outline" x="48" y="315" width="74" height="90" rx="30"></rect>

      <rect class="outline" x="-5"  y="165" width="35" height="110" rx="18"></rect>
      <rect class="outline" x="-5"  y="275" width="35" height="95"  rx="18"></rect>
      <rect class="outline" x="-1"  y="370" width="27" height="16"  rx="8"></rect>
      <rect class="outline" x="-6"  y="386" width="40" height="40"  rx="14"></rect>

      <rect class="outline" x="140" y="165" width="35" height="110" rx="18"></rect>
      <rect class="outline" x="140" y="275" width="35" height="95"  rx="18"></rect>
      <rect class="outline" x="144" y="370" width="27" height="16"  rx="8"></rect>
      <rect class="outline" x="137" y="386" width="40" height="40"  rx="14"></rect>

      <rect class="outline" x="44" y="405" width="36" height="140" rx="18"></rect>
      <rect class="outline" x="90" y="405" width="36" height="140" rx="18"></rect>
      <ellipse class="outline" cx="62" cy="548" rx="18" ry="12"></ellipse>
      <ellipse class="outline" cx="108" cy="548" rx="18" ry="12"></ellipse>
      <rect class="outline" x="44" y="560" width="36" height="95" rx="16"></rect>
      <rect class="outline" x="90" y="560" width="36" height="95" rx="16"></rect>
      <rect class="outline" x="38" y="655" width="48" height="22" rx="10"></rect>
      <rect class="outline" x="84" y="655" width="48" height="22" rx="10"></rect>

      <rect class="region" data-view="back" data-part="back_of_head" x="45" y="18" width="80" height="60" rx="18"></rect>
      <rect class="region" data-view="back" data-part="ears" x="33" y="46" width="12" height="22" rx="6"></rect>
      <rect class="region" data-view="back" data-part="ears" x="125" y="46" width="12" height="22" rx="6"></rect>
      <rect class="region" data-view="back" data-part="neck_nape" x="66" y="125" width="38" height="32" rx="10"></rect>

      <circle class="region" data-view="back" data-part="shoulders" cx="35"  cy="175" r="22"></circle>
      <circle class="region" data-view="back" data-part="shoulders" cx="135" cy="175" r="22"></circle>
      <ellipse class="region" data-view="back" data-part="shoulder_blades" cx="58"  cy="210" rx="28" ry="22"></ellipse>
      <ellipse class="region" data-view="back" data-part="shoulder_blades" cx="112" cy="210" rx="28" ry="22"></ellipse>

      <rect class="region" data-view="back" data-part="upper_back" x="40" y="160" width="90" height="80" rx="22"></rect>
      <rect class="region" data-view="back" data-part="spine"     x="78" y="160" width="14" height="170" rx="7"></rect>
      <rect class="region" data-view="back" data-part="lower_back" x="40" y="240" width="90" height="90" rx="22"></rect>

      <rect class="region" data-view="back" data-part="buttocks" x="48" y="315" width="74" height="90" rx="26"></rect>

      <rect class="region" data-view="back" data-part="triceps" x="-5"  y="165" width="35" height="110" rx="18"></rect>
      <rect class="region" data-view="back" data-part="triceps" x="140" y="165" width="35" height="110" rx="18"></rect>
      <circle class="region" data-view="back" data-part="back_of_elbows" cx="12"  cy="275" r="16"></circle>
      <circle class="region" data-view="back" data-part="back_of_elbows" cx="158" cy="275" r="16"></circle>
      <rect class="region" data-view="back" data-part="back_of_forearms" x="-5"  y="275" width="35" height="95" rx="18"></rect>
      <rect class="region" data-view="back" data-part="back_of_forearms" x="140" y="275" width="35" height="95" rx="18"></rect>
      <rect class="region" data-view="back" data-part="back_of_hands" x="-6"  y="386" width="40" height="40" rx="14"></rect>
      <rect class="region" data-view="back" data-part="back_of_hands" x="137" y="386" width="40" height="40" rx="14"></rect>

      <rect class="region" data-view="back" data-part="hamstrings" x="44" y="405" width="36" height="140" rx="18"></rect>
      <rect class="region" data-view="back" data-part="hamstrings" x="90" y="405" width="36" height="140" rx="18"></rect>
      <ellipse class="region" data-view="back" data-part="back_of_knees" cx="62"  cy="548" rx="18" ry="14"></ellipse>
      <ellipse class="region" data-view="back" data-part="back_of_knees" cx="108" cy="548" rx="18" ry="14"></ellipse>
      <rect class="region" data-view="back" data-part="calves" x="44" y="560" width="36" height="95" rx="16"></rect>
      <rect class="region" data-view="back" data-part="calves" x="90" y="560" width="36" height="95" rx="16"></rect>

      <rect class="region" data-view="back" data-part="achilles_tendons" x="44" y="652" width="36" height="18" rx="8"></rect>
      <rect class="region" data-view="back" data-part="achilles_tendons" x="90" y="652" width="36" height="18" rx="8"></rect>
      <rect class="region" data-view="back" data-part="heels" x="38" y="655" width="48" height="22" rx="10"></rect>
      <rect class="region" data-view="back" data-part="heels" x="84" y="655" width="48" height="22" rx="10"></rect>
    </g>
  </g>

  <g id="leftSide" transform="translate(620, 0)">
    <g transform="translate(55, 95)">
      <ellipse class="outline" cx="95" cy="65" rx="42" ry="60"></ellipse>
      <rect class="outline" x="86" y="125" width="24" height="32" rx="10"></rect>
      <rect class="outline" x="70" y="155" width="70" height="175" rx="35"></rect>
      <rect class="outline" x="78" y="315" width="58" height="90" rx="28"></rect>

      <rect class="outline" x="135" y="175" width="32" height="115" rx="16"></rect>
      <rect class="outline" x="135" y="290" width="32" height="95" rx="16"></rect>
      <rect class="outline" x="137" y="385" width="26" height="14" rx="7"></rect>
      <rect class="outline" x="132" y="399" width="40" height="40" rx="14"></rect>

      <rect class="outline" x="86" y="405" width="34" height="145" rx="17"></rect>
      <ellipse class="outline" cx="103" cy="552" rx="17" ry="12"></ellipse>
      <rect class="outline" x="86" y="565" width="34" height="95" rx="16"></rect>
      <rect class="outline" x="82" y="660" width="52" height="22" rx="10"></rect>

      <rect class="region" data-view="left" data-part="left_temple_ear_jaw" x="66" y="32" width="58" height="70" rx="18"></rect>

      <circle class="region" data-view="left" data-part="left_shoulder" cx="140" cy="185" r="22"></circle>
      <rect class="region" data-view="left" data-part="left_arm" x="135" y="175" width="32" height="115" rx="16"></rect>
      <rect class="region" data-view="left" data-part="left_arm" x="135" y="290" width="32" height="95" rx="16"></rect>
      <rect class="region" data-view="left" data-part="left_hand" x="132" y="399" width="40" height="40" rx="14"></rect>

      <rect class="region" data-view="left" data-part="left_ribcage_flank" x="72" y="165" width="65" height="85" rx="22"></rect>
      <rect class="region" data-view="left" data-part="left_hip" x="78" y="260" width="58" height="70" rx="22"></rect>

      <rect class="region" data-view="left" data-part="left_thigh" x="86" y="405" width="34" height="145" rx="17"></rect>
      <ellipse class="region" data-view="left" data-part="left_knee" cx="103" cy="552" rx="18" ry="14"></ellipse>
      <rect class="region" data-view="left" data-part="left_calf" x="86" y="565" width="34" height="95" rx="16"></rect>

      <rect class="region" data-view="left" data-part="left_ankle" x="86" y="655" width="34" height="18" rx="8"></rect>
      <rect class="region" data-view="left" data-part="left_foot" x="82" y="660" width="52" height="22" rx="10"></rect>
    </g>
  </g>

  <g id="rightSide" transform="translate(920, 0)">
    <g transform="translate(240, 95) scale(-1,1)">
      <ellipse class="outline" cx="95" cy="65" rx="42" ry="60"></ellipse>
      <rect class="outline" x="86" y="125" width="24" height="32" rx="10"></rect>
      <rect class="outline" x="70" y="155" width="70" height="175" rx="35"></rect>
      <rect class="outline" x="78" y="315" width="58" height="90" rx="28"></rect>

      <rect class="outline" x="135" y="175" width="32" height="115" rx="16"></rect>
      <rect class="outline" x="135" y="290" width="32" height="95" rx="16"></rect>
      <rect class="outline" x="137" y="385" width="26" height="14" rx="7"></rect>
      <rect class="outline" x="132" y="399" width="40" height="40" rx="14"></rect>

      <rect class="outline" x="86" y="405" width="34" height="145" rx="17"></rect>
      <ellipse class="outline" cx="103" cy="552" rx="17" ry="12"></ellipse>
      <rect class="outline" x="86" y="565" width="34" height="95" rx="16"></rect>
      <rect class="outline" x="82" y="660" width="52" height="22" rx="10"></rect>

      <rect class="region" data-view="right" data-part="right_temple_ear_jaw" x="66" y="32" width="58" height="70" rx="18"></rect>

      <circle class="region" data-view="right" data-part="right_shoulder" cx="140" cy="185" r="22"></circle>
      <rect class="region" data-view="right" data-part="right_arm" x="135" y="175" width="32" height="115" rx="16"></rect>
      <rect class="region" data-view="right" data-part="right_arm" x="135" y="290" width="32" height="95" rx="16"></rect>
      <rect class="region" data-view="right" data-part="right_hand" x="132" y="399" width="40" height="40" rx="14"></rect>

      <rect class="region" data-view="right" data-part="right_ribcage_flank" x="72" y="165" width="65" height="85" rx="22"></rect>
      <rect class="region" data-view="right" data-part="right_hip" x="78" y="260" width="58" height="70" rx="22"></rect>

      <rect class="region" data-view="right" data-part="right_thigh" x="86" y="405" width="34" height="145" rx="17"></rect>
      <ellipse class="region" data-view="right" data-part="right_knee" cx="103" cy="552" rx="18" ry="14"></ellipse>
      <rect class="region" data-view="right" data-part="right_calf" x="86" y="565" width="34" height="95" rx="16"></rect>

      <rect class="region" data-view="right" data-part="right_ankle" x="86" y="655" width="34" height="18" rx="8"></rect>
      <rect class="region" data-view="right" data-part="right_foot" x="82" y="660" width="52" height="22" rx="10"></rect>
    </g>
  </g>
</svg>`;

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
  gap: 10,
};

const embeddedPanel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
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

const clearBtn: React.CSSProperties = {
  border: "1px solid rgba(15, 23, 42, 0.14)",
  background: "#fff",
  color: "#111827",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const selectedRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const selectedLabel: React.CSSProperties = {
  color: "#6B7280",
  fontSize: 14,
};

const selectedValue: React.CSSProperties = {
  fontWeight: 700,
  color: "#111827",
  fontSize: 14,
  wordBreak: "break-word",
};

const svgHost: React.CSSProperties = {
  width: "100%",
  maxWidth: 1100,
};
