"use client";
import { useEffect, useRef } from "react";

export interface CareMapMarker {
  id: string;
  name: string;
  type: "carer" | "family";
  lat: number;
  lng: number;
  city?: string;
  rating?: number;
  summary?: string;
  avatar?: string;
  specializations?: string[];
}

interface CareMapProps {
  center: { lat: number; lng: number } | null;
  radiusKm: number;
  markers: CareMapMarker[];
  onMarkerClick?: (id: string) => void;
}

export function CareMap({
  center,
  radiusKm,
  markers,
  onMarkerClick,
}: CareMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Ensure leaflet CSS once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector("link[data-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      // Add correct SRI hash for leaflet 1.9.4 CSS
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "anonymous";
      link.dataset.leaflet = "true";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!center || !containerRef.current) return;
      if (!LRef.current) {
        const mod = await import("leaflet");
        if (cancelled) return;
        LRef.current = mod;
      }
      const L = LRef.current;
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom: 11,
          attributionControl: false,
        });
        const tile = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
        ).addTo(mapRef.current);
        L.control
          .attribution({ position: "bottomright" })
          .addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
        tile.on("load", () => {
          setTimeout(() => {
            try {
              mapRef.current?.invalidateSize();
            } catch {}
          }, 50);
        });
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [center]);

  // Update center & radius
  useEffect(() => {
    const L = LRef.current;
    if (!mapRef.current || !center || !L) return;
    mapRef.current.setView([center.lat, center.lng], 11);
    if (circleRef.current) circleRef.current.remove();
    circleRef.current = L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: "#3b82f6",
      weight: 1,
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
    }).addTo(mapRef.current);
  }, [center, radiusKm]);

  // Markers refresh
  useEffect(() => {
    const L = LRef.current;
    if (!layerRef.current || !L) return;
    layerRef.current.clearLayers();
    markers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const bg = m.type === "carer" ? "#6366f1" : "#0ea5e9";
      const emoji = m.avatar || (m.type === "carer" ? "👩‍⚕️" : "👥");
      const html = `<div style="background:${bg};color:#fff;padding:6px 10px;border-radius:20px;font-size:14px;font-weight:600;box-shadow:0 3px 10px -2px rgba(0,0,0,0.4);display:flex;align-items:center;gap:4px;white-space:nowrap;">
        <span style="font-size:16px;">${emoji}</span>
        <span>${m.name}</span>
      </div>`;
      const icon = L.divIcon({
        html,
        className: "",
        iconSize: [100, 32],
        iconAnchor: [50, 16],
      });
      const marker = L.marker([m.lat, m.lng], { icon });

      // Build rich popup content
      const ratingStars = m.rating ? "⭐".repeat(Math.round(m.rating)) : "";
      const cityLine = m.city
        ? `<div style="font-size:11px;opacity:0.7;margin-top:2px;">📍 ${m.city} (approx. location)</div>`
        : "";
      const summaryLine = m.summary
        ? `<div style="font-size:12px;margin-top:6px;">${m.summary}</div>`
        : "";
      const specsLine = m.specializations?.length
        ? `<div style="font-size:11px;margin-top:6px;color:#94a3b8;">${m.specializations.slice(0, 3).join(" • ")}</div>`
        : "";
      const ratingLine = m.rating
        ? `<div style="font-size:12px;margin-top:4px;">${ratingStars} ${m.rating.toFixed(1)}</div>`
        : "";
      const viewBtn = `<button onclick="window.dispatchEvent(new CustomEvent('viewCarerProfile', {detail:'${m.id}'}))" style="margin-top:8px;padding:6px 12px;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:16px;cursor:pointer;font-size:12px;font-weight:500;">View Profile</button>`;

      const popupContent = `
        <div style="min-width:180px;">
          <strong style="font-size:14px;">${emoji} ${m.name}</strong>
          <div style="font-size:11px;color:#6366f1;font-weight:500;">${m.type === "carer" ? "Caregiver" : "Family"}</div>
          ${ratingLine}
          ${cityLine}
          ${summaryLine}
          ${specsLine}
          ${m.type === "carer" ? viewBtn : ""}
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 250 });
      marker.addTo(layerRef.current);
    });
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: 360,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      aria-label="Care map"
      role="region"
    />
  );
}
