"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModernEditorHeader } from "./modern-editor-header";
import { ModernPageList } from "./modern-page-list";
import { ModernCanvas } from "./modern-canvas";
import { PropertyPanel } from "./property-panel";
import { AssetLibrary } from "./asset-library";
import { ModernCoverEditor } from "./modern-cover-editor";
import { BookSettingsModal } from "./book-settings-modal";
import { ExportModal } from "./export-modal";
import { ShareModal } from "./share-modal";
import { getAssetPublicUrl } from "@/lib/storage";
import {
  createBlock,
  updateBlock,
  updateBlockPosition,
  deleteBlock,
} from "@/actions/blocks";
import {
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  duplicatePage,
} from "@/actions/pages";
import { updateBook } from "@/actions/books";
import { uploadAsset } from "@/actions/assets";
import {
  getNarration,
  upsertNarration,
  deleteNarration,
} from "@/actions/narrations";
import type {
  AssetType,
  BlockType,
  BlockContent,
  BlockLayout,
  BlockStyle,
  NarrationInput,
} from "@/types";
import type { SlotValue } from "@/domain/templates";

type BookStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "in_review"
  | "archived";

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  status: BookStatus;
  author_id: string;
  design_width?: number;
  design_height?: number;
  canvas_width?: number;
  canvas_height?: number;
  page_count?: number;
  updated_at?: string;
  cover_gradient?: string | null;
  cover_image_url?: string | null;
  cover_asset_id?: string | null;
  primary_template_id?: string | null;
  secondary_template_id?: string | null;
}

interface Page {
  id: string;
  page_index: number;
  layout_mode: "canvas" | "flow";
  background_color: string;
  background_asset_id?: string | null;
  blocks: Block[];
  template_id?: string | null;
  template_slots?: Record<string, SlotValue> | null;
}

interface Block {
  id: string;
  type: BlockType;
  content: unknown;
  layout: unknown;
  style: unknown;
  block_index: number;
}

interface Asset {
  id: string;
  type: AssetType;
  file_path: string;
  file_name?: string;
  alt_text?: string;
}

interface BookEditorProps {
  book: Book;
  pages: Page[];
  assets: Asset[];
}

export function BookEditor({
  book,
  pages: initialPages,
  assets: initialAssets,
}: BookEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [pages, setPages] = useState(initialPages);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [assetSelectionMode, setAssetSelectionMode] = useState<
    "block" | "background" | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [narration, setNarration] = useState<{
    id: string;
    page_id: string;
    mode: "tts" | "recorded";
    audio_asset_id: string | null;
    tts_text: string | null;
    tts_voice: string | null;
    duration_ms: number | null;
  } | null>(null);
  const [isLoadingNarration, setIsLoadingNarration] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState(false);

  // Modal states
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);

  const currentPage = pages[selectedPageIndex];
  const selectedBlock = currentPage?.blocks.find(
    (b) => b.id === selectedBlockId
  );

  // Helper to show notifications
  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // Page handlers
  const handlePageSelect = useCallback((index: number) => {
    setSelectedPageIndex(index);
    setSelectedBlockId(null);
  }, []);

  const handlePageAdd = useCallback(async () => {
    startTransition(async () => {
      try {
        const newPageIndex = pages.length;
        const newPage = await createPage({
          book_id: book.id,
          page_index: newPageIndex,
          layout_mode: "canvas",
          background_color: "#ffffff",
          template_id: book.primary_template_id || undefined,
        });

        setPages((prev) => [
          ...prev,
          {
            id: newPage.id,
            page_index: newPageIndex,
            layout_mode: "canvas",
            background_color: "#ffffff",
            blocks: [],
            template_id: book.primary_template_id || null,
            template_slots: null,
          },
        ]);

        // Update book page count
        await updateBook(book.id, { page_count: pages.length + 1 } as never);

        setSelectedPageIndex(newPageIndex);
        showNotification("success", "Page added successfully");
      } catch (error) {
        console.error("Error creating page:", error);
        showNotification("error", "Failed to create page");
      }
    });
  }, [book.id, book.primary_template_id, pages.length, showNotification]);

  const handlePageDelete = useCallback(
    async (pageId: string) => {
      if (pages.length <= 1) {
        showNotification("error", "Cannot delete the last page");
        return;
      }

      startTransition(async () => {
        try {
          await deletePage(pageId);

          setPages((prev) => {
            const filtered = prev.filter((p) => p.id !== pageId);
            // Re-index pages
            return filtered.map((p, i) => ({ ...p, page_index: i }));
          });

          if (selectedPageIndex >= pages.length - 1) {
            setSelectedPageIndex(Math.max(0, pages.length - 2));
          }

          setSelectedBlockId(null);
          showNotification("success", "Page deleted");
        } catch (error) {
          console.error("Error deleting page:", error);
          showNotification("error", "Failed to delete page");
        }
      });
    },
    [pages.length, selectedPageIndex, showNotification]
  );

  const handlePagesReorder = useCallback(
    async (newOrder: string[]) => {
      startTransition(async () => {
        try {
          await reorderPages(book.id, newOrder);

          setPages((prev) => {
            const pageMap = new Map(prev.map((p) => [p.id, p]));
            return newOrder.map((id, index) => {
              const page = pageMap.get(id)!;
              return { ...page, page_index: index };
            });
          });
        } catch (error) {
          console.error("Error reordering pages:", error);
          showNotification("error", "Failed to reorder pages");
        }
      });
    },
    [book.id, showNotification]
  );

  const handlePageDuplicate = useCallback(
    async (pageId: string) => {
      startTransition(async () => {
        try {
          const result = await duplicatePage(pageId);

          if (result) {
            // Find the original page index
            const originalIndex = pages.findIndex((p) => p.id === pageId);

            // Insert the new page after the original
            setPages((prev) => {
              const newPages = [...prev];
              // Insert the new page after the original
              newPages.splice(originalIndex + 1, 0, {
                ...result.page,
                blocks: result.blocks || [],
              });
              // Re-index all pages
              return newPages.map((p, i) => ({ ...p, page_index: i }));
            });

            // Select the new page
            setSelectedPageIndex(originalIndex + 1);
            setSelectedBlockId(null);
            showNotification("success", "Page duplicated");
          }
        } catch (error) {
          console.error("Error duplicating page:", error);
          showNotification("error", "Failed to duplicate page");
        }
      });
    },
    [pages, showNotification]
  );

  // Block handlers
  const handleBlockSelect = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleBlockAdd = useCallback(
    async (blockType: string) => {
      if (!currentPage) return;

      startTransition(async () => {
        try {
          // Default content based on block type
          const defaultContent: Record<string, BlockContent> = {
            text: { text: "Enter your text here..." } as BlockContent,
            image: { asset_id: "" } as BlockContent,
            audio: { asset_id: "" } as BlockContent,
            video: {
              asset_id: "",
              autoplay: false,
              loop: false,
              muted: false,
            } as BlockContent,
            shape: { shape: "rectangle" } as unknown as BlockContent,
          };

          // Default layout in center of canvas
          const defaultLayout: BlockLayout = {
            x: 0.35,
            y: 0.35,
            width: 0.3,
            height: 0.3,
            z_index: currentPage.blocks.length,
          };

          // Default style based on block type
          const defaultStyle: Record<string, BlockStyle> = {
            text: {
              font_family: "Inter",
              font_size: 24,
              font_weight: "normal",
              text_align: "center",
              color: "#000000",
            } as BlockStyle,
            image: { object_fit: "contain", border_radius: 0 } as BlockStyle,
            video: { border_radius: 0, show_controls: true } as BlockStyle,
            shape: {
              backgroundColor: "#E5E7EB",
              borderRadius: 8,
            } as unknown as BlockStyle,
            audio: {} as BlockStyle,
          };

          const newBlock = await createBlock({
            page_id: currentPage.id,
            type: blockType as BlockType,
            block_index: currentPage.blocks.length,
            content: defaultContent[blockType] || ({} as BlockContent),
            layout: defaultLayout,
            style: defaultStyle[blockType] || ({} as BlockStyle),
          });

          setPages((prev) =>
            prev.map((p) =>
              p.id === currentPage.id
                ? {
                    ...p,
                    blocks: [
                      ...p.blocks,
                      {
                        id: newBlock.id,
                        type: blockType as BlockType,
                        content: defaultContent[blockType] || {},
                        layout: defaultLayout,
                        style: defaultStyle[blockType] || {},
                        block_index: p.blocks.length,
                      },
                    ],
                  }
                : p
            )
          );

          setSelectedBlockId(newBlock.id);
          showNotification("success", `${blockType} block added`);
        } catch (error) {
          console.error("Error creating block:", error);
          showNotification("error", "Failed to create block");
        }
      });
    },
    [currentPage, showNotification]
  );

  // Handle drop from element palette
  const handleDropElement = useCallback(
    async (data: { type: string; x: number; y: number; emoji?: string }) => {
      if (!currentPage) return;

      // Map palette types to actual block types
      let blockType = data.type;
      if (data.type.startsWith("shape-")) {
        blockType = "shape";
      } else if (data.type === "sticker") {
        blockType = "sticker";
      }

      startTransition(async () => {
        try {
          const defaultContent: Record<string, BlockContent> = {
            text: { text: "Enter your text here..." } as BlockContent,
            image: { asset_id: "" } as BlockContent,
            audio: { asset_id: "" } as BlockContent,
            video: {
              asset_id: "",
              autoplay: false,
              loop: false,
              muted: false,
            } as BlockContent,
            shape: {
              shape:
                data.type === "shape-circle"
                  ? "circle"
                  : data.type === "shape-star"
                  ? "star"
                  : "rectangle",
            } as unknown as BlockContent,
            sticker: { emoji: data.emoji || "✨" } as unknown as BlockContent,
          };

          // Position based on drop location
          const dropLayout: BlockLayout = {
            x: Math.max(0, Math.min(0.85, data.x - 0.075)),
            y: Math.max(0, Math.min(0.85, data.y - 0.075)),
            width: blockType === "sticker" ? 0.1 : 0.15,
            height: blockType === "sticker" ? 0.1 : 0.15,
            z_index: currentPage.blocks.length,
          };

          const defaultStyle: Record<string, BlockStyle> = {
            text: {
              font_family: "Inter",
              font_size: 24,
              font_weight: "normal",
              text_align: "center",
              color: "#000000",
            } as BlockStyle,
            image: { object_fit: "contain", border_radius: 0 } as BlockStyle,
            video: { border_radius: 0, show_controls: true } as BlockStyle,
            shape: {
              backgroundColor: "#E5E7EB",
              borderRadius: data.type === "shape-circle" ? 9999 : 8,
            } as unknown as BlockStyle,
            sticker: {} as BlockStyle,
            audio: {} as BlockStyle,
          };

          const newBlock = await createBlock({
            page_id: currentPage.id,
            type: (blockType === "sticker" ? "shape" : blockType) as BlockType,
            block_index: currentPage.blocks.length,
            content: defaultContent[blockType] || ({} as BlockContent),
            layout: dropLayout,
            style: defaultStyle[blockType] || ({} as BlockStyle),
          });

          setPages((prev) =>
            prev.map((p) =>
              p.id === currentPage.id
                ? {
                    ...p,
                    blocks: [
                      ...p.blocks,
                      {
                        id: newBlock.id,
                        type: (blockType === "sticker"
                          ? "sticker"
                          : blockType) as BlockType,
                        content: defaultContent[blockType] || {},
                        layout: dropLayout,
                        style: defaultStyle[blockType] || {},
                        block_index: p.blocks.length,
                      },
                    ],
                  }
                : p
            )
          );

          setSelectedBlockId(newBlock.id);
          showNotification("success", `Element added!`);
        } catch (error) {
          console.error("Error creating block:", error);
          showNotification("error", "Failed to add element");
        }
      });
    },
    [currentPage, showNotification]
  );

  const handleBlockUpdate = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      // Optimistic update
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId ? { ...b, ...updates } : b
          ),
        }))
      );
      setHasChanges(true);

      startTransition(async () => {
        try {
          await updateBlock(blockId, {
            content: updates.content as BlockContent | undefined,
            layout: updates.layout as BlockLayout | undefined,
            style: updates.style as BlockStyle | undefined,
            block_index: updates.block_index,
          });
        } catch (error) {
          console.error("Error updating block:", error);
          showNotification("error", "Failed to update block");
        }
      });
    },
    [showNotification]
  );

  const handleBlockDelete = useCallback(
    async (blockId: string) => {
      startTransition(async () => {
        try {
          await deleteBlock(blockId);

          setPages((prev) =>
            prev.map((p) => ({
              ...p,
              blocks: p.blocks.filter((b) => b.id !== blockId),
            }))
          );

          setSelectedBlockId(null);
          showNotification("success", "Block deleted");
        } catch (error) {
          console.error("Error deleting block:", error);
          showNotification("error", "Failed to delete block");
        }
      });
    },
    [showNotification]
  );

  const handleBlockMove = useCallback(
    async (blockId: string, x: number, y: number) => {
      // Optimistic update for smooth dragging
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId
              ? { ...b, layout: { ...(b.layout as object), x, y } }
              : b
          ),
        }))
      );
      setHasChanges(true);

      // Debounced server update (handled by drag end)
    },
    []
  );

  const handleBlockMoveEnd = useCallback(
    async (blockId: string, x: number, y: number) => {
      try {
        await updateBlockPosition(blockId, { x, y });
      } catch (error) {
        console.error("Error updating block position:", error);
        showNotification("error", "Failed to save position");
      }
    },
    [showNotification]
  );

  const handleBlockResize = useCallback(
    async (blockId: string, width: number, height: number) => {
      // Optimistic update
      setPages((prev) =>
        prev.map((p) => ({
          ...p,
          blocks: p.blocks.map((b) =>
            b.id === blockId
              ? { ...b, layout: { ...(b.layout as object), width, height } }
              : b
          ),
        }))
      );
      setHasChanges(true);

      startTransition(async () => {
        try {
          await updateBlockPosition(blockId, { width, height });
        } catch (error) {
          console.error("Error updating block size:", error);
        }
      });
    },
    []
  );

  // Page update handler
  const handlePageUpdate = useCallback(
    async (updates: Partial<Page>) => {
      if (!currentPage) return;

      // Optimistic update
      setPages((prev) =>
        prev.map((p) => (p.id === currentPage.id ? { ...p, ...updates } : p))
      );
      setHasChanges(true);

      startTransition(async () => {
        try {
          await updatePage(currentPage.id, {
            layout_mode: updates.layout_mode,
            background_color: updates.background_color,
            background_asset_id: updates.background_asset_id ?? undefined,
          });
        } catch (error) {
          console.error("Error updating page:", error);
          showNotification("error", "Failed to update page");
        }
      });
    },
    [currentPage, showNotification]
  );

  // Asset handlers
  const handleAssetSelect = useCallback(
    (asset: Asset) => {
      if (assetSelectionMode === "background" && currentPage) {
        // Set as page background
        handlePageUpdate({
          background_asset_id: asset.id,
        });
      } else if (
        selectedBlock &&
        (selectedBlock.type === "image" ||
          selectedBlock.type === "video" ||
          selectedBlock.type === "audio")
      ) {
        // Set asset for the block
        handleBlockUpdate(selectedBlock.id, {
          content: {
            ...(selectedBlock.content as object),
            asset_id: asset.id,
            src: getAssetPublicUrl(asset.file_path),
          },
        });
      }
      setIsAssetLibraryOpen(false);
      setAssetSelectionMode(null);
    },
    [
      assetSelectionMode,
      currentPage,
      selectedBlock,
      handleBlockUpdate,
      handlePageUpdate,
    ]
  );

  const handleAssetUpload = useCallback(
    async (file: File) => {
      try {
        // Determine asset type from file
        let assetType: AssetType = "image";
        if (file.type.startsWith("audio/")) assetType = "audio";
        else if (file.type.startsWith("video/")) assetType = "video";

        const newAsset = await uploadAsset(file, book.id, assetType);

        setAssets((prev) => [
          ...prev,
          {
            id: newAsset.id,
            type: assetType,
            file_path: newAsset.file_path,
            file_name: file.name,
            alt_text: "",
          },
        ]);

        showNotification("success", "Asset uploaded successfully");
        return newAsset;
      } catch (error) {
        console.error("Error uploading asset:", error);
        showNotification("error", "Failed to upload asset");
        throw error;
      }
    },
    [book.id, showNotification]
  );

  // Save handlers
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // All changes are saved automatically via optimistic updates
      // This is just a manual trigger for any pending changes
      setHasChanges(false);
      showNotification("success", "All changes saved");
    } finally {
      setIsSaving(false);
    }
  }, [showNotification]);

  const handlePreview = useCallback(() => {
    router.push(`/app/books/${book.id}/read`);
  }, [book.id, router]);

  const handlePublish = useCallback(async () => {
    if (pages.length < 2) {
      showNotification(
        "error",
        "Your book needs at least 2 pages to submit for review"
      );
      return;
    }

    startTransition(async () => {
      try {
        await updateBook(book.id, {
          status: "in_review",
          submitted_at: new Date().toISOString(),
        } as never);
        showNotification("success", "Book submitted for review!");
        router.push("/author");
      } catch (error) {
        console.error("Error submitting for review:", error);
        showNotification("error", "Failed to submit for review");
      }
    });
  }, [book.id, pages.length, router, showNotification]);

  // Handler for saving book settings from modal
  const handleBookSettingsSave = useCallback(
    async (updates: Partial<typeof book>) => {
      try {
        await updateBook(book.id, updates as never);
        // Update local state to reflect changes
        setCurrentBook((prev) => ({ ...prev, ...updates }));
        showNotification("success", "Book settings saved!");
      } catch (error) {
        console.error("Error saving book settings:", error);
        showNotification("error", "Failed to save book settings");
        throw error;
      }
    },
    [book.id, showNotification]
  );

  const openAssetLibrary = useCallback((mode: "block" | "background") => {
    setAssetSelectionMode(mode);
    setIsAssetLibraryOpen(true);
  }, []);

  // Narration handlers
  const loadNarration = useCallback(async (pageId: string) => {
    setIsLoadingNarration(true);
    try {
      const data = await getNarration(pageId);
      setNarration(data);
    } catch (error) {
      console.error("Error loading narration:", error);
      setNarration(null);
    } finally {
      setIsLoadingNarration(false);
    }
  }, []);

  // Load narration when page changes - use useEffect instead of render-time check
  const prevPageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentPage?.id && currentPage.id !== prevPageIdRef.current) {
      prevPageIdRef.current = currentPage.id;
      loadNarration(currentPage.id);
    }
  }, [currentPage?.id, loadNarration]);

  const handleNarrationSave = useCallback(
    async (input: Omit<NarrationInput, "page_id">) => {
      if (!currentPage) return;

      try {
        const result = await upsertNarration({
          page_id: currentPage.id,
          ...input,
        });
        setNarration(result);
        showNotification("success", "Narration saved successfully");
      } catch (error) {
        console.error("Error saving narration:", error);
        showNotification("error", "Failed to save narration");
        throw error;
      }
    },
    [currentPage, showNotification]
  );

  const handleNarrationDelete = useCallback(async () => {
    if (!currentPage) return;

    try {
      await deleteNarration(currentPage.id);
      setNarration(null);
      showNotification("success", "Narration deleted");
    } catch (error) {
      console.error("Error deleting narration:", error);
      showNotification("error", "Failed to delete narration");
      throw error;
    }
  }, [currentPage, showNotification]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 via-purple-50/20 to-pink-50/20">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl transition-all animate-in slide-in-from-right flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          <span className="text-xl">
            {notification.type === "success" ? "✨" : "⚠️"}
          </span>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <ModernEditorHeader
        book={currentBook}
        isSaving={isSaving || isPending}
        hasChanges={hasChanges}
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Book Settings Accordion + Page List */}
        <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-purple-100 flex flex-col">
          {/* Book Settings Section */}
          <div className="border-b border-purple-100">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
                  Book Settings
                </span>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Page List */}
          <div className="flex-1 overflow-hidden">
            <ModernPageList
              pages={pages}
              selectedIndex={selectedPageIndex}
              onSelect={handlePageSelect}
              onAdd={handlePageAdd}
              onDelete={handlePageDelete}
              onReorder={handlePagesReorder}
              onDuplicate={handlePageDuplicate}
              assets={assets}
              book={currentBook}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-200/80 via-purple-100/30 to-pink-100/30">
          {/* Show Cover Editor for first page, regular editor for others */}
          {selectedPageIndex === 0 && currentPage ? (
            <ModernCoverEditor
              book={currentBook}
              coverPage={currentPage}
              onUpdateBook={async (updates) => {
                startTransition(async () => {
                  try {
                    await updateBook(book.id, updates as never);
                    setCurrentBook((prev) => ({ ...prev, ...updates }));
                    showNotification("success", "Book info updated");
                  } catch (error) {
                    console.error("Error updating book:", error);
                    showNotification("error", "Failed to update book info");
                  }
                });
              }}
              onUpdatePage={handlePageUpdate}
              onOpenAssetLibrary={() => openAssetLibrary("background")}
              coverImageUrl={
                currentPage.background_asset_id
                  ? getAssetPublicUrl(
                      assets.find(
                        (a) => a.id === currentPage.background_asset_id
                      )?.file_path || ""
                    )
                  : undefined
              }
            />
          ) : currentPage ? (
            <ModernCanvas
              page={currentPage}
              canvasWidth={book.canvas_width ?? book.design_width ?? 1920}
              canvasHeight={book.canvas_height ?? book.design_height ?? 1080}
              selectedBlockId={selectedBlockId}
              onBlockSelect={handleBlockSelect}
              onBlockMove={handleBlockMove}
              onBlockMoveEnd={handleBlockMoveEnd}
              onBlockResize={handleBlockResize}
              onBlockDelete={handleBlockDelete}
              onDrop={handleDropElement}
              isDraggingElement={isDraggingElement}
              assets={assets}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <span className="text-7xl block mb-4 animate-bounce">📖</span>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  No pages yet
                </p>
                <p className="text-sm text-gray-500">
                  Click &ldquo;Add New Page&rdquo; to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Property Panel (35% width, always visible) */}
        {isPanelOpen && (
          <div
            className="bg-white/90 backdrop-blur-xl border-l border-purple-100 overflow-y-auto"
            style={{ width: "35%", minWidth: "400px", maxWidth: "600px" }}
          >
            <PropertyPanel
              book={currentBook}
              page={currentPage}
              block={selectedBlock}
              narration={narration}
              onBookUpdate={async (updates) => {
                startTransition(async () => {
                  try {
                    await updateBook(book.id, updates as never);
                    setCurrentBook((prev) => ({ ...prev, ...updates }));
                    showNotification("success", "Book updated");
                  } catch (error) {
                    console.error("Error updating book:", error);
                    showNotification("error", "Failed to update book");
                  }
                });
              }}
              onPageUpdate={handlePageUpdate}
              onBlockUpdate={(updates) => {
                if (selectedBlockId) {
                  handleBlockUpdate(selectedBlockId, updates as Partial<Block>);
                }
              }}
              onBlockDelete={() => {
                if (selectedBlockId) {
                  handleBlockDelete(selectedBlockId);
                }
              }}
              onOpenAssetLibrary={() => openAssetLibrary("block")}
              onOpenBackgroundLibrary={() => openAssetLibrary("background")}
              onNarrationSave={handleNarrationSave}
              onNarrationDelete={handleNarrationDelete}
              onClose={() => setIsPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Asset Library Modal */}
      {isAssetLibraryOpen && (
        <AssetLibrary
          assets={assets}
          bookId={book.id}
          onSelect={handleAssetSelect}
          onUpload={handleAssetUpload}
          onClose={() => {
            setIsAssetLibraryOpen(false);
            setAssetSelectionMode(null);
          }}
        />
      )}

      {/* Book Settings Modal */}
      <BookSettingsModal
        book={currentBook}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleBookSettingsSave}
      />

      {/* Export Modal */}
      <ExportModal
        book={currentBook}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Share Modal */}
      <ShareModal
        book={currentBook}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Toggle Panel Button (when closed) */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm shadow-xl rounded-l-2xl border border-purple-100 hover:bg-purple-50 transition-all group"
        >
          <ChevronLeftIcon className="w-5 h-5 text-purple-500 group-hover:text-purple-600" />
        </button>
      )}
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}
