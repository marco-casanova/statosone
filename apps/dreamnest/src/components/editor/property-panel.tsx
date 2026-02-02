"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { NarrationEditor } from "./narration-editor";
import { PageTemplateEditor } from "./page-template-editor";
import { BookTemplateConfigurator } from "./book-template-configurator";
import { type SlotValue } from "@/domain/templates";

type NarrationMode = "recorded" | "tts";

interface Page {
  id: string;
  layout_mode: "canvas" | "flow";
  background_color: string;
  background_asset_id?: string | null;
  background_music_asset_id?: string | null;
  background_music_loop?: boolean | null;
  border_frame_id?: string | null;
  page_text?: string | null;
  template_id?: string | null;
  template_slots?: Record<string, SlotValue> | null;
}

interface Book {
  id: string;
  title: string;
  age_min?: number;
  age_max?: number;
  primary_template_id?: string | null;
  secondary_template_id?: string | null;
}

interface Block {
  id: string;
  type: string;
  content: unknown;
  layout: unknown;
  style: unknown;
  block_index: number;
}

interface Narration {
  id: string;
  mode: NarrationMode;
  audio_asset_id: string | null;
  tts_text: string | null;
  tts_voice: string | null;
  duration_ms: number | null;
}

interface PropertyPanelProps {
  page?: Page;
  narration?: Narration | null;
  onPageUpdate: (updates: Partial<Page>) => void;
  onNarrationSave?: (data: {
    mode: NarrationMode;
    audio_asset_id?: string | null;
    tts_text?: string | null;
    tts_voice?: string | null;
    duration_ms?: number | null;
  }) => Promise<void>;
  onNarrationDelete?: () => Promise<void>;
  onOpenAssetLibrary?: () => void;
  onOpenBackgroundLibrary?: () => void;
  onOpenNarrationLibrary?: () => void;
  onClose: () => void;
}

export function PropertyPanel({
  page,
  narration,
  onPageUpdate,
  onNarrationSave,
  onNarrationDelete,
  onOpenAssetLibrary,
  onOpenBackgroundLibrary,
  onOpenNarrationLibrary,
  onClose,
}: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<"page" | "narration">(
    page ? "page" : "narration"
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="font-semibold text-gray-800">Properties</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
        >
          <XIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("page")}
          className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "page"
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <PageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Page</span>
          </span>
          {activeTab === "page" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("narration")}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "narration"
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <NarrationIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Audio</span>
          </span>
          {activeTab === "narration" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "book" && book && onBookUpdate && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Book Templates
              </h3>
              <BookTemplateConfigurator
                primaryTemplateId={
                  (book.primary_template_id as TemplateId) || null
                }
                secondaryTemplateId={
                  (book.secondary_template_id as TemplateId) || null
                }
                ageMin={book.age_min || 4}
                ageMax={book.age_max || 8}
                onPrimaryChange={(templateId) =>
                  onBookUpdate({ primary_template_id: templateId })
                }
                onSecondaryChange={(templateId) =>
                  onBookUpdate({ secondary_template_id: templateId })
                }
              />
            </div>
          </div>
        )}
        {activeTab === "page" && page && (
          <PageProperties
            page={page}
            onUpdate={onPageUpdate}
            onOpenBackgroundLibrary={onOpenBackgroundLibrary}
            onOpenAssetLibrary={(slotKey, type) => {
              // Store slot context for asset selection
              if (type === "image") onOpenBackgroundLibrary?.();
              else if (type === "audio") onOpenNarrationLibrary?.();
              else onOpenAssetLibrary?.();
            }}
          />
        )}
        {activeTab === "template" && page && (
          <PageTemplateEditor
            templateId={(page.template_id as TemplateId) || null}
            slots={page.template_slots || {}}
            onTemplateChange={(templateId) =>
              onPageUpdate({ template_id: templateId })
            }
            onSlotsChange={(slots) => onPageUpdate({ template_slots: slots })}
            onOpenAssetLibrary={(slotKey, type) => {
              // You can enhance this to pass the slot key to the asset library
              if (type === "image") onOpenBackgroundLibrary?.();
              else if (type === "audio") onOpenNarrationLibrary?.();
              else onOpenAssetLibrary?.();
            }}
          />
        )}
        {activeTab === "block" && block && (
          <BlockProperties
            block={block}
            onUpdate={onBlockUpdate}
            onDelete={onBlockDelete}
            onOpenAssetLibrary={onOpenAssetLibrary}
          />
        )}
        {activeTab === "narration" &&
          page &&
          onNarrationSave &&
          onNarrationDelete && (
            <NarrationEditor
              pageId={page.id}
              narration={narration || null}
              onSave={onNarrationSave}
              onDelete={onNarrationDelete}
              onOpenAssetLibrary={onOpenNarrationLibrary || (() => {})}
            />
          )}
        {!page && !block && activeTab !== "narration" && (
          <div className="text-center text-gray-400 mt-8">
            <span className="text-4xl block mb-3">✨</span>
            <p>Select a page or block to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PageProperties({
  page,
  onUpdate,
  onOpenBackgroundLibrary,
  onOpenAssetLibrary,
}: {
  page: Page;
  onUpdate: (updates: Partial<Page>) => void;
  onOpenBackgroundLibrary?: () => void;
  onOpenAssetLibrary?: (
    slotKey: string,
    type: "image" | "video" | "audio"
  ) => void;
}) {
  // Templates are hidden in this simplified view
  const template = null;
  const presetColors = [
    "#FFFFFF",
    "#F3F4F6",
    "#FEF3C7",
    "#DBEAFE",
    "#D1FAE5",
    "#FCE7F3",
    "#E0E7FF",
    "#FED7AA",
    "#FECACA",
    "#DDD6FE",
  ];

  return (
        <div className="space-y-6">
      {/* Page Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Text
        </label>
        <textarea
          value={page.page_text ?? "Add text"}
          onChange={(e) =>
            onUpdate({ page_text: e.target.value || "Add text" })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          placeholder="Add text"
        />
        <p className="text-xs text-gray-500 mt-1">
          Appears on the page immediately; defaults to “Add text”.
        </p>
      </div>

      {/* Template Slots Section */}
      {template && (
        <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
              <TemplateIcon className="w-4 h-4" />
              {template.name} Content
            </h3>
            <span className="text-xs text-purple-600 bg-white px-2 py-1 rounded-full">
              {Object.keys(template.slots).length} slots
            </span>
          </div>

          <p className="text-xs text-purple-700">{template.purpose}</p>

          <TemplateLayoutPreview
            template={template}
            slots={page.template_slots || {}}
            onSlotChange={(slotKey, value, type) => {
              const newSlots = {
                ...(page.template_slots || {}),
                [slotKey]: { slotKey, value, type },
              };
              onUpdate({ template_slots: newSlots });
            }}
            onOpenAssetLibrary={onOpenAssetLibrary}
          />

          {/* Slot Editors */}
          <div className="space-y-3">
            {Object.entries(template.slots).map(([slotKey, slotDef]) => {
              const slotValue = page.template_slots?.[slotKey];
              const isRequired = !slotDef.optional;
              const availableTypes = Array.isArray(slotDef.type)
                ? slotDef.type
                : [slotDef.type];
              const chosenType =
                (slotValue?.type as SlotValueType | undefined) ||
                (availableTypes[0] as SlotValueType);
              const hasValue = slotValue?.value;

              const icon = (type: string) => {
                if (type === "string") return "📝";
                if (type === "image") return "🖼️";
                if (type === "video" || type === "slow_video") return "🎬";
                if (type === "audio") return "🎵";
                return "⬜";
              };

              const normalizedType =
                chosenType === "slow_video" ? "video" : chosenType;

              return (
                <div
                  key={slotKey}
                  className="bg-white rounded-lg p-3 border border-purple-100"
                >
                  {/* Slot Header */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                      <span>{icon(chosenType)}</span>
                      <span className="capitalize">
                        {slotKey.replace(/_/g, " ").replace(/id$/, "")}
                      </span>
                      {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    {availableTypes.length > 1 && (
                      <div className="flex gap-1">
                        {availableTypes.map((t) => (
                          <button
                            key={t as string}
                            className={`px-2 py-1 text-[11px] rounded border ${
                              chosenType === t
                                ? "border-purple-400 bg-purple-50 text-purple-700"
                                : "border-gray-200 text-gray-500"
                            }`}
                            onClick={() => {
                              const newSlots = {
                                ...(page.template_slots || {}),
                                [slotKey]: {
                                  slotKey,
                                  value: slotValue?.value ?? null,
                                  type: t as SlotValueType,
                                },
                              };
                              onUpdate({ template_slots: newSlots });
                            }}
                          >
                            {t === "slow_video" ? "Video" : t}
                          </button>
                        ))}
                      </div>
                    )}
                    {hasValue && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        ✓ Set
                      </span>
                    )}
                  </div>

                  {/* Slot Editor */}
                  {normalizedType === "string" ? (
                    <textarea
                      value={(slotValue?.value as string) || ""}
                      onChange={(e) => {
                        const newSlots = {
                          ...(page.template_slots || {}),
                          [slotKey]: {
                            slotKey,
                            value: e.target.value,
                            type: "string" as const,
                          },
                        };
                        onUpdate({ template_slots: newSlots });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                      rows={2}
                      placeholder={`Enter ${slotKey.replace(/_/g, " ")}...`}
                    />
                  ) : (
                    <div>
                      {hasValue ? (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                          <span className="text-xs text-gray-600 truncate">
                            Content uploaded
                          </span>
                          <button
                            onClick={() => {
                              const newSlots = { ...(page.template_slots || {}) };
                              delete newSlots[slotKey];
                              onUpdate({ template_slots: newSlots });
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            onOpenAssetLibrary?.(
                              slotKey,
                              normalizedType as "image" | "video" | "audio"
                            )
                          }
                          className="w-full py-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-xs text-gray-500 flex flex-col items-center gap-1"
                        >
                          <Upload className="w-4 h-4" />
                          Upload {normalizedType}
                        </button>
                      )}
                    </div>
                  )}

                  {slotDef.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {slotDef.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Switch to Template Tab Hint */}
          <p className="text-xs text-purple-600 text-center">
            💡 Go to Template tab for detailed editing
          </p>
        </div>
      )}

      {/* Layout Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ layout_mode: "canvas" })}
            className="flex-1 py-3 px-4 rounded-xl border-2 text-sm transition-all border-purple-500 bg-purple-50 text-purple-700"
          >
            <CanvasIcon className="w-5 h-5 mx-auto mb-1" />
            Canvas (default)
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Canvas is always used. Flow view is removed to keep editing simple.
        </p>
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color
        </label>
        <div className="space-y-3">
          {/* Preset Colors */}
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ background_color: color })}
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  page.background_color.toUpperCase() === color
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={page.background_color}
              onChange={(e) => onUpdate({ background_color: e.target.value })}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={page.background_color}
              onChange={(e) => onUpdate({ background_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Image
        </label>
        {page.background_asset_id ? (
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <span className="flex items-center justify-center h-full text-gray-400">
                Background set
              </span>
            </div>
            <button
              onClick={() => onUpdate({ background_asset_id: null })}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenBackgroundLibrary}
            className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <span className="text-3xl block mb-2">🖼️</span>
            <span className="text-sm text-gray-500">
              Click to add background
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function BlockProperties({
  block,
  onUpdate,
  onDelete,
  onOpenAssetLibrary,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onOpenAssetLibrary?: () => void;
}) {
  const content = block.content as Record<string, unknown>;
  const style = block.style as Record<string, unknown>;
  const layout = block.layout as Record<string, unknown>;

  const updateContent = (key: string, value: unknown) => {
    onUpdate({ content: { ...content, [key]: value } });
  };

  const updateStyle = (key: string, value: unknown) => {
    onUpdate({ style: { ...style, [key]: value } });
  };

  const updateLayout = (key: string, value: unknown) => {
    onUpdate({ layout: { ...layout, [key]: value } });
  };

  const blockTypeIcons: Record<string, string> = {
    text: "📝",
    image: "🖼️",
    audio: "🎵",
    video: "🎬",
    shape: "⬜",
  };

  return (
    <div className="space-y-6">
      {/* Block Type Badge */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{blockTypeIcons[block.type] || "❓"}</span>
          <span className="font-medium text-purple-700 capitalize">
            {block.type} Block
          </span>
        </div>
        <span className="text-xs text-purple-500 bg-white px-2 py-1 rounded-full">
          Layer {block.block_index + 1}
        </span>
      </div>

      {/* Text Block Properties */}
      {block.type === "text" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              value={(content.text as string) || ""}
              onChange={(e) => updateContent("text", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              placeholder="Enter your story text here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={(style.font_size as number) || 24}
                  onChange={(e) =>
                    updateStyle("font_size", parseInt(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-12 text-right">
                  {(style.font_size as number) || 24}px
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <select
                value={(style.font_weight as string) || "normal"}
                onChange={(e) => updateStyle("font_weight", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semi Bold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={(style.font_family as string) || "Inter"}
              onChange={(e) => updateStyle("font_family", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <optgroup label="Sans Serif">
                <option value="Inter">Inter</option>
                <option value="Nunito">Nunito</option>
                <option value="Poppins">Poppins</option>
                <option value="Quicksand">Quicksand</option>
                <option value="Comic Neue">Comic Neue</option>
              </optgroup>
              <optgroup label="Serif">
                <option value="Merriweather">Merriweather</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
              </optgroup>
              <optgroup label="Handwriting">
                <option value="Patrick Hand">Patrick Hand</option>
                <option value="Caveat">Caveat</option>
                <option value="Shadows Into Light">Shadows Into Light</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(style.color as string) || "#000000"}
                onChange={(e) => updateStyle("color", e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={(style.color as string) || "#000000"}
                onChange={(e) => updateStyle("color", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Alignment
            </label>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle("text_align", align)}
                  className={`flex-1 py-2 rounded-md transition-colors capitalize ${
                    (style.text_align || "center") === align
                      ? "bg-white shadow text-purple-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color & Opacity
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={(style.background_color as string) || "#FFFFFF"}
                onChange={(e) =>
                  updateStyle("background_color", e.target.value)
                }
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={(style.background_color as string) || "transparent"}
                onChange={(e) =>
                  updateStyle("background_color", e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={
                  typeof style.background_opacity === "number"
                    ? Math.round(style.background_opacity * 100)
                    : 100
                }
                onChange={(e) =>
                  updateStyle(
                    "background_opacity",
                    parseInt(e.target.value) / 100
                  )
                }
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-10 text-right">
                {typeof style.background_opacity === "number"
                  ? Math.round(style.background_opacity * 100)
                  : 100}
                %
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Image Block Properties */}
      {block.type === "image" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Source
            </label>
            {content.src ? (
              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={content.src as string}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={onOpenAssetLibrary}
                  className="mt-2 w-full py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 text-sm font-medium"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAssetLibrary}
                className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <span className="text-4xl block mb-2">🖼️</span>
                <span className="text-sm text-gray-500">
                  Click to select image
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text (Accessibility)
            </label>
            <input
              type="text"
              value={(content.alt as string) || ""}
              onChange={(e) => updateContent("alt", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Describe the image for screen readers..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fit Mode
            </label>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {(["contain", "cover"] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => updateStyle("object_fit", fit)}
                  className={`flex-1 py-2 rounded-md transition-colors capitalize ${
                    (style.object_fit || "contain") === fit
                      ? "bg-white shadow text-purple-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50"
                value={(style.border_radius as number) || 0}
                onChange={(e) =>
                  updateStyle("border_radius", parseInt(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12 text-right">
                {(style.border_radius as number) || 0}px
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audio Block Properties */}
      {block.type === "audio" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File
            </label>
            {content.asset_id ? (
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-700">Audio loaded</p>
                    <p className="text-xs text-blue-500">Click to change</p>
                  </div>
                </div>
                <button
                  onClick={onOpenAssetLibrary}
                  className="mt-3 w-full py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-medium"
                >
                  Change Audio
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAssetLibrary}
                className="w-full py-10 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <span className="text-4xl block mb-2">🎵</span>
                <span className="text-sm text-blue-500">
                  Click to select audio
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Block Properties */}
      {block.type === "video" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            {content.asset_id || content.src ? (
              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <button
                  onClick={onOpenAssetLibrary}
                  className="mt-2 w-full py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 text-sm font-medium"
                >
                  Change Video
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAssetLibrary}
                className="w-full py-10 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <span className="text-4xl block mb-2">🎬</span>
                <span className="text-sm text-green-500">
                  Click to select video
                </span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(content.autoplay as boolean) || false}
                onChange={(e) => updateContent("autoplay", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Autoplay</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(content.loop as boolean) || false}
                onChange={(e) => updateContent("loop", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Loop</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(style.show_controls as boolean) ?? true}
                onChange={(e) => updateStyle("show_controls", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Show Controls</span>
            </label>
          </div>
        </div>
      )}

      {/* Shape Block Properties */}
      {block.type === "shape" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shape Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["rectangle", "circle", "rounded"] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => updateContent("shape", shape)}
                  className={`py-3 rounded-xl border-2 text-sm capitalize transition-all ${
                    content.shape === shape
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {shape === "rectangle" && "▭"}
                  {shape === "circle" && "●"}
                  {shape === "rounded" && "▢"}
                  <span className="block text-xs mt-1">{shape}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  (style.fillColor as string) ||
                  (style.backgroundColor as string) ||
                  "#E5E7EB"
                }
                onChange={(e) => {
                  updateStyle("fillColor", e.target.value);
                  updateStyle("backgroundColor", e.target.value);
                }}
                className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={
                  (style.fillColor as string) ||
                  (style.backgroundColor as string) ||
                  "#E5E7EB"
                }
                onChange={(e) => {
                  updateStyle("fillColor", e.target.value);
                  updateStyle("backgroundColor", e.target.value);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Radius
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={
                  (style.borderRadius as number) ||
                  (style.border_radius as number) ||
                  8
                }
                onChange={(e) => {
                  updateStyle("borderRadius", parseInt(e.target.value));
                  updateStyle("border_radius", parseInt(e.target.value));
                }}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12 text-right">
                {(style.borderRadius as number) ||
                  (style.border_radius as number) ||
                  8}
                px
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Position & Size (for all blocks in canvas mode) */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Position & Size
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              X Position
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(((layout.x as number) || 0) * 100)}
              onChange={(e) =>
                updateLayout("x", parseInt(e.target.value) / 100)
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Y Position
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(((layout.y as number) || 0) * 100)}
              onChange={(e) =>
                updateLayout("y", parseInt(e.target.value) / 100)
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width %</label>
            <input
              type="number"
              min="5"
              max="100"
              step="1"
              value={Math.round(((layout.width as number) || 0.3) * 100)}
              onChange={(e) =>
                updateLayout("width", parseInt(e.target.value) / 100)
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height %</label>
            <input
              type="number"
              min="5"
              max="100"
              step="1"
              value={Math.round(((layout.height as number) || 0.2) * 100)}
              onChange={(e) =>
                updateLayout("height", parseInt(e.target.value) / 100)
              }
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-4 border-t">
        <button
          onClick={onDelete}
          className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-4 h-4" />
          Delete Block
        </button>
      </div>
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function PageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function BlockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
      />
    </svg>
  );
}

function NarrationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function CanvasIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}

function FlowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
