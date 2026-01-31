"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DocMorrisProduct = {
  name_display: string;
  product_url?: string;
  category?: string;
  active_substance?: string;
  atc_code?: string;
  confidence?: number;
};

interface MedicationSearchProps {
  onSelect?: (product: DocMorrisProduct) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  maxResults?: number;
  initialQuery?: string;
  hideLabel?: boolean;
}

export default function MedicationSearch({
  onSelect,
  onCreate,
  placeholder = "Search medication by name or category...",
  maxResults = 12,
  initialQuery = "",
  hideLabel = false,
}: MedicationSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<DocMorrisProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Load medications data once
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/data/docmorris_products.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: DocMorrisProduct[]) => {
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load medications", err);
        if (!cancelled) {
          setError("Could not load medications list");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideContainer && !isInsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return []; // Require at least 2 characters

    // Split query into words for better matching
    const queryWords = q.split(/\s+/).filter((w) => w.length > 0);

    return items
      .map((item) => {
        const name = item.name_display?.toLowerCase() || "";
        const cat = item.category?.toLowerCase() || "";
        const substance = item.active_substance?.toLowerCase() || "";
        const atc = item.atc_code?.toLowerCase() || "";

        // Check if all query words match somewhere
        const allWordsMatch = queryWords.every(
          (word) =>
            name.includes(word) ||
            cat.includes(word) ||
            substance.includes(word) ||
            atc.includes(word),
        );

        if (!allWordsMatch) return { item, score: 0 };

        // Calculate score based on match quality
        let score = 0;

        // Exact match at start of name gets highest score
        if (name.startsWith(q)) score += 10;
        else if (name.includes(q)) score += 5;

        // Active substance exact match
        if (substance === q) score += 8;
        else if (substance.startsWith(q)) score += 6;
        else if (substance.includes(q)) score += 3;

        // ATC code match
        if (atc.startsWith(q)) score += 4;

        // Category match (lower priority)
        if (cat.includes(q)) score += 1;

        // Boost by confidence
        score += (item.confidence ?? 0) * 0.5;

        // Give some base score if words matched
        if (score === 0 && allWordsMatch) score = 1;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);
  }, [items, maxResults, query]);

  const canCreate = query.trim().length > 0 && results.length === 0 && !loading;

  const handleSelect = (product: DocMorrisProduct) => {
    setQuery(product.name_display || "");
    setOpen(false);
    onSelect?.(product);
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    setOpen(false);
    onCreate?.(name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  // Update dropdown position when input is focused or query changes
  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open, query]);

  const showResults = !loading && !error && query.trim().length >= 2 && open;
  const showDropdown = showResults && results.length > 0;

  // Clean up duplicate category names like "AllergieAllergie" -> "Allergie"
  const cleanCategory = (cat: string) => cat?.replace(/(.+)\1/, "$1") || "";

  // Render dropdown using portal to avoid overflow clipping
  const dropdown =
    showDropdown && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            className="medication-dropdown"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: 320,
              overflowY: "auto",
              background: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(209, 213, 219, 0.5)",
              borderRadius: 12,
              padding: 8,
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              zIndex: 9999,
              display: "grid",
              gap: 4,
            }}
          >
            {results.map((product, idx) => (
              <button
                key={`${product.product_url || idx}-${product.name_display}`}
                type="button"
                onClick={() => handleSelect(product)}
                style={{
                  textAlign: "left",
                  border: "1px solid rgba(209, 213, 219, 0.4)",
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#1A1A1A",
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#F5D547";
                  e.currentTarget.style.background = "rgba(245, 213, 71, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(209, 213, 219, 0.4)";
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.95)";
                }}
              >
                <div
                  style={{ fontWeight: 600, fontSize: 15, color: "#1A1A1A" }}
                >
                  {product.name_display}
                </div>
                <div style={{ color: "#374151", fontSize: 13, marginTop: 4 }}>
                  {product.active_substance && (
                    <span style={{ color: "#6DA19A", fontWeight: 500 }}>
                      {product.active_substance}
                    </span>
                  )}
                  {product.atc_code && <span> • {product.atc_code}</span>}
                  {product.category && (
                    <span style={{ opacity: 0.7 }}>
                      {" "}
                      • {cleanCategory(product.category)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="medication-search" ref={containerRef}>
      {!hideLabel && <label className="search-label">Medication search</label>}
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
      />

      {loading && (
        <div className="muted">
          Loading medications…{" "}
          {items.length > 0 ? `(${items.length} loaded)` : "(please wait)"}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!loading &&
        items.length > 0 &&
        query.trim().length < 2 &&
        query.trim().length > 0 && (
          <div className="muted">
            Type at least 2 characters to search (
            {items.length.toLocaleString()} medications available)
          </div>
        )}

      {showResults && results.length === 0 && (
        <div className="muted">No matches found for "{query}"</div>
      )}

      {dropdown}

      {canCreate && (
        <button type="button" className="create-btn" onClick={handleCreate}>
          + Add custom medication: "{query.trim()}"
        </button>
      )}

      <style jsx>{`
        .medication-search {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #1a1a1a;
          width: 100%;
          position: relative;
        }
        .search-label {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          margin-bottom: 2px;
        }
        .search-input {
          padding: 10px 12px;
          border: 1px solid rgba(209, 213, 219, 0.6);
          border-radius: 8px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.95);
          color: #1a1a1a;
          outline: none;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: #f5d547;
          box-shadow: 0 0 0 2px rgba(245, 213, 71, 0.2);
        }
        .muted {
          color: #6b7280;
          font-size: 12px;
          padding: 2px 0;
        }
        .error {
          color: #dc2626;
          font-size: 12px;
        }
        .create-btn {
          align-self: flex-start;
          margin-top: 6px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid rgba(34, 197, 94, 0.4);
          background: rgba(255, 255, 255, 0.95);
          color: #16a34a;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .create-btn:hover {
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
      `}</style>
    </div>
  );
}
