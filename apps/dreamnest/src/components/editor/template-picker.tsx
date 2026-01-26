"use client";

import { useState, useMemo } from "react";
import {
  Baby,
  Footprints,
  GraduationCap,
  Rocket,
  Brain,
  BookOpen,
  Sparkles,
  Check,
  Info,
  Lock,
  Play,
  Image as ImageIcon,
  MessageSquare,
  Music,
} from "lucide-react";
import {
  TEMPLATES,
  TEMPLATES_BY_AGE_GROUP,
  AGE_GROUPS,
  AGE_GROUP_ORDER,
  getTemplatesForAgeRange,
  type TemplateId,
  type TemplateDefinition,
  type AgeGroup,
} from "@/domain/templates";

// ============================================================
// Types
// ============================================================

interface TemplatePickerProps {
  /** Currently selected template ID */
  value?: TemplateId | null;
  /** Callback when template is selected */
  onChange: (templateId: TemplateId | null) => void;
  /** Book's target age range - filters available templates */
  ageMin?: number;
  ageMax?: number;
  /** Whether to show all templates or only age-appropriate ones */
  showAllTemplates?: boolean;
  /** Whether picker is disabled */
  disabled?: boolean;
}

// ============================================================
// Icons for Age Groups
// ============================================================

const AGE_GROUP_ICONS: Record<AgeGroup, React.ReactNode> = {
  BABY: <Baby className="w-4 h-4" />,
  TODDLER: <Footprints className="w-4 h-4" />,
  PRESCHOOL: <GraduationCap className="w-4 h-4" />,
  KIDS: <Rocket className="w-4 h-4" />,
  TWEEN: <Brain className="w-4 h-4" />,
  PRETEEN: <BookOpen className="w-4 h-4" />,
};

const AGE_GROUP_COLORS: Record<AgeGroup, string> = {
  BABY: "bg-pink-100 text-pink-700 border-pink-200",
  TODDLER: "bg-orange-100 text-orange-700 border-orange-200",
  PRESCHOOL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  KIDS: "bg-green-100 text-green-700 border-green-200",
  TWEEN: "bg-blue-100 text-blue-700 border-blue-200",
  PRETEEN: "bg-purple-100 text-purple-700 border-purple-200",
};

// ============================================================
// Slot Type Icons
// ============================================================

function SlotIcon({ type }: { type: string | string[] }) {
  const primaryType = Array.isArray(type) ? type[0] : type;
  switch (primaryType) {
    case "image":
      return <ImageIcon className="w-3 h-3" />;
    case "video":
    case "slow_video":
      return <Play className="w-3 h-3" />;
    case "audio":
      return <Music className="w-3 h-3" />;
    case "string":
      return <MessageSquare className="w-3 h-3" />;
    default:
      return null;
  }
}

// ============================================================
// Template Card Component
// ============================================================

interface TemplateCardProps {
  template: TemplateDefinition;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  isOutOfAgeRange?: boolean;
}

function TemplateCard({
  template,
  isSelected,
  onClick,
  disabled,
  isOutOfAgeRange,
}: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const ageGroup = AGE_GROUPS[template.ageGroup];

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all cursor-pointer
        ${
          isSelected
            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
            : isOutOfAgeRange
            ? "border-gray-200 bg-gray-50 opacity-60"
            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
      `}
      onClick={disabled ? undefined : onClick}
    >
      {/* Selection Check */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-medium rounded-full">
            <Sparkles className="w-3 h-3" />
            Premium
          </span>
        </div>
      )}

      {/* Age Out of Range Warning */}
      {isOutOfAgeRange && (
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-400 text-white text-xs font-medium rounded-full">
            <Lock className="w-3 h-3" />
            Age Mismatch
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`p-2 rounded-lg ${AGE_GROUP_COLORS[template.ageGroup]}`}
        >
          {AGE_GROUP_ICONS[template.ageGroup]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {template.name}
          </h4>
          <p className="text-xs text-gray-500">
            {ageGroup.label} ({ageGroup.ageMin}-{ageGroup.ageMax} yrs)
          </p>
        </div>
      </div>

      {/* Purpose */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {template.purpose}
      </p>

      {/* Slots Preview */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(template.slots)
          .slice(0, 4)
          .map(([key, slot]) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full
              ${
                slot.optional
                  ? "bg-gray-100 text-gray-600"
                  : "bg-purple-100 text-purple-700"
              }
            `}
            >
              <SlotIcon type={slot.type} />
              {key.replace(/_/g, " ").replace(/id$/, "")}
              {slot.optional && " ?"}
            </span>
          ))}
        {Object.keys(template.slots).length > 4 && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
            +{Object.keys(template.slots).length - 4} more
          </span>
        )}
      </div>

      {/* Limits */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {template.limits.maxWords && (
          <span>Max {template.limits.maxWords} words</span>
        )}
        {template.limits.maxDurationSeconds && (
          <span>Max {template.limits.maxDurationSeconds}s video</span>
        )}
        {!template.limits.animationAllowed && (
          <span className="text-orange-600">No animation</span>
        )}
      </div>

      {/* Details Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        className="mt-3 flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
      >
        <Info className="w-3 h-3" />
        {showDetails ? "Hide rules" : "Show rules"}
      </button>

      {/* Rules (Expanded) */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Rules:</p>
          <ul className="space-y-1">
            {template.rules.map((rule, idx) => (
              <li
                key={idx}
                className="text-xs text-gray-600 flex items-start gap-1"
              >
                <span className="text-purple-400 mt-0.5">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function TemplatePicker({
  value,
  onChange,
  ageMin = 0,
  ageMax = 12,
  showAllTemplates = false,
  disabled = false,
}: TemplatePickerProps) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | "all">(
    "all"
  );

  // Get templates based on age range
  const availableTemplates = useMemo(() => {
    if (showAllTemplates) {
      return Object.values(TEMPLATES);
    }
    return getTemplatesForAgeRange(ageMin, ageMax);
  }, [ageMin, ageMax, showAllTemplates]);

  // Filter by selected age group
  const filteredTemplates = useMemo(() => {
    if (selectedAgeGroup === "all") {
      return availableTemplates;
    }
    return availableTemplates.filter((t) => t.ageGroup === selectedAgeGroup);
  }, [availableTemplates, selectedAgeGroup]);

  // Get available age groups from filtered templates
  const availableAgeGroups = useMemo(() => {
    const groups = new Set(availableTemplates.map((t) => t.ageGroup));
    return AGE_GROUP_ORDER.filter((g) => groups.has(g));
  }, [availableTemplates]);

  // Check if a template is within the book's age range
  const isTemplateInAgeRange = (template: TemplateDefinition) => {
    const group = AGE_GROUPS[template.ageGroup];
    return ageMin <= group.ageMax && ageMax >= group.ageMin;
  };

  const selectedTemplate = value ? TEMPLATES[value] : null;

  return (
    <div className="space-y-4">
      {/* Current Selection */}
      {selectedTemplate && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  AGE_GROUP_COLORS[selectedTemplate.ageGroup]
                }`}
              >
                {AGE_GROUP_ICONS[selectedTemplate.ageGroup]}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedTemplate.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTemplate.purpose}
                </p>
              </div>
            </div>
            <button
              onClick={() => onChange(null)}
              disabled={disabled}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Age Group Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedAgeGroup("all")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            selectedAgeGroup === "all"
              ? "bg-purple-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {availableAgeGroups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedAgeGroup(group)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              selectedAgeGroup === group
                ? "bg-purple-500 text-white"
                : `${AGE_GROUP_COLORS[group]} hover:opacity-80`
            }`}
          >
            {AGE_GROUP_ICONS[group]}
            {AGE_GROUPS[group].label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={value === template.id}
            onClick={() => onChange(template.id)}
            disabled={disabled}
            isOutOfAgeRange={
              showAllTemplates && !isTemplateInAgeRange(template)
            }
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No templates available for the selected criteria.
          </p>
          {!showAllTemplates && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting the book&apos;s age range to see more templates.
            </p>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Templates define what content types are allowed
          on each page and enforce age-appropriate rules. Choose a template that
          matches your book&apos;s target audience for the best reading
          experience.
        </p>
      </div>
    </div>
  );
}

export default TemplatePicker;
