"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  Check,
  Info,
  Sparkles,
  X,
  BookOpen,
  Layers,
} from "lucide-react";
import {
  TEMPLATES,
  getAllowedPrimaryTemplates,
  getAllowedSecondaryTemplates,
  validateTemplateCoexistence,
  getAgeGroupFromRange,
  getAgeGroupGuideline,
  getPageSequence,
  getRecommendedPageCount,
  type TemplateId,
  type AgeGroup,
} from "@/domain/templates";

// ============================================================
// Types
// ============================================================

interface BookTemplateConfiguratorProps {
  primaryTemplateId: TemplateId | null;
  secondaryTemplateId: TemplateId | null;
  ageMin: number;
  ageMax: number;
  onPrimaryChange: (templateId: TemplateId | null) => void;
  onSecondaryChange: (templateId: TemplateId | null) => void;
}

// ============================================================
// Template Card Component
// ============================================================

interface TemplateCardProps {
  templateId: TemplateId;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function TemplateCard({
  templateId,
  isSelected,
  isDisabled,
  onClick,
}: TemplateCardProps) {
  const template = TEMPLATES[templateId];

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`p-3 rounded-lg border-2 transition-all text-left w-full ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : isDisabled
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {template.name}
            </p>
            {template.isPremium && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-linear-to-r from-amber-400 to-orange-400 text-white text-xs font-medium rounded shrink-0">
                <Sparkles className="w-3 h-3" />
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {template.purpose}
          </p>
        </div>
        {isSelected && <Check className="w-5 h-5 text-purple-600 shrink-0" />}
      </div>
    </button>
  );
}

// ============================================================
// Template Grid Component
// ============================================================

interface TemplateGridProps {
  label: string;
  value: TemplateId | null;
  options: TemplateId[];
  onChange: (value: TemplateId | null) => void;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

function TemplateGrid({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  allowClear = false,
}: TemplateGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {value && allowClear && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {options.length === 0 ? (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            No templates available for this selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
          {options.map((templateId) => (
            <TemplateCard
              key={templateId}
              templateId={templateId}
              isSelected={value === templateId}
              isDisabled={disabled}
              onClick={() => onChange(templateId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function BookTemplateConfigurator({
  primaryTemplateId,
  secondaryTemplateId,
  ageMin,
  ageMax,
  onPrimaryChange,
  onSecondaryChange,
}: BookTemplateConfiguratorProps) {
  // Get age group from range
  const ageGroup = useMemo(
    () => getAgeGroupFromRange(ageMin, ageMax),
    [ageMin, ageMax]
  );

  // Get allowed templates
  const allowedPrimary = useMemo(
    () => (ageGroup ? getAllowedPrimaryTemplates(ageGroup) : []),
    [ageGroup]
  );

  const allowedSecondary = useMemo(
    () =>
      ageGroup && primaryTemplateId
        ? getAllowedSecondaryTemplates(ageGroup, primaryTemplateId)
        : [],
    [ageGroup, primaryTemplateId]
  );

  // Validate current combination
  const validation = useMemo(
    () =>
      ageGroup
        ? validateTemplateCoexistence(
            ageGroup,
            primaryTemplateId,
            secondaryTemplateId
          )
        : { valid: true, errors: [], warnings: [] },
    [ageGroup, primaryTemplateId, secondaryTemplateId]
  );

  // Get guideline
  const guideline = ageGroup ? getAgeGroupGuideline(ageGroup) : null;

  // Clear secondary if it becomes invalid when primary changes
  useEffect(() => {
    if (
      secondaryTemplateId &&
      !allowedSecondary.includes(secondaryTemplateId)
    ) {
      onSecondaryChange(null);
    }
  }, [allowedSecondary, secondaryTemplateId, onSecondaryChange]);

  if (!ageGroup) {
    return (
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          Please set a valid age range (0-12 years) to configure templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Template Configuration
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Books use one primary template (structure) and optionally one
              secondary template (accent). Only certain combinations are
              allowed.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Template */}
      <TemplateGrid
        label="Primary Template"
        value={primaryTemplateId}
        options={allowedPrimary}
        onChange={onPrimaryChange}
        required
      />

      {/* Secondary Template */}
      <TemplateGrid
        label="Secondary Template (Optional)"
        value={secondaryTemplateId}
        options={allowedSecondary}
        onChange={onSecondaryChange}
        disabled={!primaryTemplateId || allowedSecondary.length === 0}
        allowClear={true}
      />

      {/* No secondary available message */}
      {primaryTemplateId && allowedSecondary.length === 0 && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            No secondary templates are compatible with the selected primary
            template.
          </p>
        </div>
      )}

      {/* Validation Status */}
      {(primaryTemplateId || secondaryTemplateId) && (
        <div
          className={`p-3 rounded-lg border ${
            validation.valid
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-2">
            {validation.valid ? (
              <Check className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div className="flex-1">
              {validation.valid ? (
                <p className="text-sm font-medium text-green-900">
                  Valid template combination
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-red-900 mb-2">
                    Invalid template combination
                  </p>
                  <ul className="space-y-1">
                    {validation.errors.map((error, idx) => (
                      <li key={idx} className="text-xs text-red-700">
                        • {error.message}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Sequence Info */}
      {primaryTemplateId &&
        ageGroup &&
        (() => {
          const sequence = getPageSequence(ageGroup, primaryTemplateId);
          const recommendedCount = getRecommendedPageCount(
            ageGroup,
            primaryTemplateId
          );

          return (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">
                  Book Structure
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-700">
                    Recommended Pages:
                  </span>
                  <span className="text-sm font-medium text-blue-900">
                    {recommendedCount} pages
                  </span>
                </div>

                {sequence && (
                  <>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs font-medium text-blue-800 mb-1">
                        Page Flow:
                      </p>
                      <p className="text-xs text-blue-600">
                        {sequence.pattern}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs font-medium text-blue-800 mb-2">
                        Example Sequence:
                      </p>
                      <div className="space-y-1">
                        {sequence.pages.slice(0, 4).map((page, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-blue-700"
                          >
                            <span className="shrink-0 w-4 text-blue-500">
                              {idx + 1}.
                            </span>
                            <span className="line-clamp-1">
                              {page.description}
                            </span>
                          </div>
                        ))}
                        {sequence.pages.length > 4 && (
                          <p className="text-xs text-blue-500 ml-6">
                            + {sequence.pages.length - 4} more pages...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Pages will be auto-created with this structure when you
                        create the book
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

      {/* Guideline */}
      {guideline && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs font-medium text-purple-900 mb-1">Guideline:</p>
          <p className="text-xs text-purple-700">{guideline}</p>
        </div>
      )}

      {/* Template Roles */}
      {primaryTemplateId && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Remember:</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Primary = Structure (backbone of your book)</li>
            <li>• Secondary = Accent (adds variation, used sparingly)</li>
            <li>
              • If secondary could replace primary, the combination is invalid
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookTemplateConfigurator;
