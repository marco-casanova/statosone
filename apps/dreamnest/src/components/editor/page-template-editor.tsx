"use client";

import { useState } from "react";
import {
  LayoutTemplate,
  AlertCircle,
  Check,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Play,
  Info,
} from "lucide-react";
import {
  TEMPLATES,
  validatePage,
  createEmptySlots,
  type TemplateId,
  type SlotValue,
  type TemplateDefinition,
} from "@/domain/templates";

// ============================================================
// Types
// ============================================================

interface PageTemplateEditorProps {
  /** Current template ID */
  templateId: TemplateId | null;
  /** Current slot values */
  slots: Record<string, SlotValue>;
  /** Callback when template changes */
  onTemplateChange: (templateId: TemplateId | null) => void;
  /** Callback when slots change */
  onSlotsChange: (slots: Record<string, SlotValue>) => void;
  /** Callback to open asset library for a specific slot */
  onOpenAssetLibrary?: (
    slotKey: string,
    type: "image" | "video" | "audio"
  ) => void;
  /** Book's age range for filtering templates */
  ageMin?: number;
  ageMax?: number;
}

// ============================================================
// Slot Type Icons
// ============================================================

function getSlotIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="w-4 h-4" />;
    case "video":
    case "slow_video":
      return <Play className="w-4 h-4" />;
    case "audio":
      return <Music className="w-4 h-4" />;
    case "string":
      return <FileText className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
}

// ============================================================
// Slot Editor Components
// ============================================================

function StringSlotEditor({
  slotKey,
  value,
  maxWords,
  onChange,
}: {
  slotKey: string;
  value: string | null;
  maxWords?: number;
  onChange: (value: string) => void;
}) {
  const wordCount = value ? value.trim().split(/\s+/).length : 0;
  const isOverLimit = maxWords ? wordCount > maxWords : false;

  return (
    <div className="space-y-2">
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg text-sm resize-none ${
          isOverLimit
            ? "border-red-300 focus:ring-red-400"
            : "border-gray-200 focus:ring-purple-400"
        } focus:ring-2 focus:border-transparent outline-none`}
        rows={3}
        placeholder={`Enter ${slotKey.replace(/_/g, " ")}...`}
      />
      {maxWords && (
        <p
          className={`text-xs ${
            isOverLimit ? "text-red-600" : "text-gray-500"
          }`}
        >
          {wordCount} / {maxWords} words
          {isOverLimit && " (exceeds limit!)"}
        </p>
      )}
    </div>
  );
}

function MediaSlotEditor({
  slotKey,
  value,
  type,
  onSelect,
  onClear,
}: {
  slotKey: string;
  value: string | null;
  type: "image" | "video" | "audio";
  onSelect: () => void;
  onClear: () => void;
}) {
  const labels = {
    image: "Image",
    video: "Video",
    audio: "Audio",
  };

  const icons = {
    image: <ImageIcon className="w-5 h-5" />,
    video: <Play className="w-5 h-5" />,
    audio: <Music className="w-5 h-5" />,
  };

  return (
    <div>
      {value ? (
        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-purple-600">{icons[type]}</div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {labels[type]} Selected
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {value}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-1 hover:bg-purple-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
        >
          <div className="text-gray-400 mb-2">{icons[type]}</div>
          <span className="text-sm text-gray-500">Select {labels[type]}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function PageTemplateEditor({
  templateId,
  slots,
  onTemplateChange,
  onSlotsChange,
  onOpenAssetLibrary,
  ageMin = 0,
  ageMax = 12,
}: PageTemplateEditorProps) {
  const [showValidation, setShowValidation] = useState(false);

  const template = templateId ? TEMPLATES[templateId] : null;

  // Validate current page
  const validation =
    templateId && slots ? validatePage(templateId, slots) : null;

  // Handle slot value change
  const handleSlotChange = (slotKey: string, value: string | null) => {
    const slotDef = template?.slots[slotKey];
    if (!slotDef) return;

    const type = Array.isArray(slotDef.type) ? slotDef.type[0] : slotDef.type;

    onSlotsChange({
      ...slots,
      [slotKey]: {
        slotKey,
        value,
        type: type as any,
      },
    });
  };

  // Handle template change
  const handleTemplateChange = (newTemplateId: TemplateId | null) => {
    onTemplateChange(newTemplateId);
    if (newTemplateId) {
      // Initialize empty slots for the new template
      onSlotsChange(createEmptySlots(newTemplateId));
    } else {
      onSlotsChange({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <LayoutTemplate className="w-4 h-4 inline mr-1" />
          Page Template
        </label>

        {template ? (
          <div className="space-y-3">
            {/* Current Template Card */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {template.purpose}
                  </p>
                </div>
                <button
                  onClick={() => handleTemplateChange(null)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Template Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {template.limits.maxWords && (
                  <span>Max {template.limits.maxWords}w</span>
                )}
                {template.limits.maxDurationSeconds && (
                  <span>• Max {template.limits.maxDurationSeconds}s</span>
                )}
                {!template.limits.animationAllowed && (
                  <span className="text-orange-600">• Static only</span>
                )}
              </div>
            </div>

            {/* Validation Status */}
            {validation && (
              <button
                onClick={() => setShowValidation(!showValidation)}
                className={`w-full p-2 rounded-lg text-xs flex items-center justify-between ${
                  validation.valid
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {validation.valid ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {validation.valid
                    ? "Template valid"
                    : `${validation.errors.length} error(s)`}
                </span>
                <Info className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Validation Details */}
            {showValidation && validation && !validation.valid && (
              <div className="p-3 bg-red-50 rounded-lg space-y-2">
                {validation.errors.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-700">
                    • {error.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              // In a real implementation, open template picker
              alert("Template picker would open here");
            }}
            className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <LayoutTemplate className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Select Page Template</span>
          </button>
        )}
      </div>

      {/* Slot Editors */}
      {template && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold text-gray-700">
            Template Slots
          </h3>

          {Object.entries(template.slots).map(([slotKey, slotDef]) => {
            const slotValue = slots[slotKey];
            const isRequired = !slotDef.optional;
            const primaryType = Array.isArray(slotDef.type)
              ? slotDef.type[0]
              : slotDef.type;

            return (
              <div key={slotKey} className="space-y-2">
                {/* Slot Label */}
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {getSlotIcon(primaryType)}
                  <span className="capitalize">
                    {slotKey.replace(/_/g, " ").replace(/id$/, "")}
                  </span>
                  {isRequired && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                  {!isRequired && (
                    <span className="text-gray-400 text-xs">(optional)</span>
                  )}
                </label>

                {/* Slot Description */}
                {slotDef.description && (
                  <p className="text-xs text-gray-500">{slotDef.description}</p>
                )}

                {/* Slot Editor */}
                {primaryType === "string" ? (
                  <StringSlotEditor
                    slotKey={slotKey}
                    value={slotValue?.value || null}
                    maxWords={template.limits.maxWords}
                    onChange={(value) => handleSlotChange(slotKey, value)}
                  />
                ) : (
                  <MediaSlotEditor
                    slotKey={slotKey}
                    value={slotValue?.value || null}
                    type={primaryType as "image" | "video" | "audio"}
                    onSelect={() =>
                      onOpenAssetLibrary?.(
                        slotKey,
                        primaryType as "image" | "video" | "audio"
                      )
                    }
                    onClear={() => handleSlotChange(slotKey, null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Template Rules */}
      {template && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-900 mb-2">
            Template Rules:
          </p>
          <ul className="space-y-1">
            {template.rules.slice(0, 3).map((rule, idx) => (
              <li key={idx} className="text-xs text-blue-700">
                • {rule}
              </li>
            ))}
            {template.rules.length > 3 && (
              <li className="text-xs text-blue-600">
                + {template.rules.length - 3} more rules
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default PageTemplateEditor;
