"use client";

import { useEffect, useRef, useCallback } from "react";
import { recordContentEvent, updateContentEvent } from "@/actions/payouts";

interface UseEngagementTrackerProps {
  bookId: string;
  kidId?: string | null;
  isActive: boolean;
  pageCount?: number;
}

/**
 * Hook to track reading engagement for pool distribution
 * Records minutes read, pages read, and completion status
 */
export function useEngagementTracker({
  bookId,
  kidId,
  isActive,
  pageCount = 0,
}: UseEngagementTrackerProps) {
  const eventIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const minutesReadRef = useRef(0);
  const pagesReadRef = useRef(new Set<number>());
  const sessionIdRef = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Start tracking when component mounts and is active
  useEffect(() => {
    if (!isActive || !bookId) return;

    startTimeRef.current = Date.now();

    // Record initial event
    const createEvent = async () => {
      try {
        const event = await recordContentEvent({
          book_id: bookId,
          kid_id: kidId,
          minutes_read: 0,
          pages_read: 0,
          completed: false,
          session_id: sessionIdRef.current,
          device_type: getDeviceType(),
        });
        eventIdRef.current = event.id;
      } catch (error) {
        console.error("Failed to create content event:", error);
      }
    };

    createEvent();

    // Cleanup on unmount or when inactive
    return () => {
      if (eventIdRef.current && startTimeRef.current) {
        const minutes = Math.floor((Date.now() - startTimeRef.current) / 60000);
        updateContentEvent(eventIdRef.current, {
          minutes_read: minutes,
          pages_read: pagesReadRef.current.size,
        }).catch(console.error);
      }
    };
  }, [isActive, bookId, kidId]);

  // Track time every minute
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        minutesReadRef.current = Math.floor(
          (Date.now() - startTimeRef.current) / 60000
        );
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isActive]);

  // Track page view
  const trackPageView = useCallback((pageIndex: number) => {
    pagesReadRef.current.add(pageIndex);
  }, []);

  // Mark book as completed
  const markCompleted = useCallback(async () => {
    if (!eventIdRef.current) return;

    const minutes = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 60000)
      : minutesReadRef.current;

    try {
      await updateContentEvent(eventIdRef.current, {
        minutes_read: minutes,
        pages_read: pagesReadRef.current.size,
        completed: true,
      });
    } catch (error) {
      console.error("Failed to mark book as completed:", error);
    }
  }, []);

  // Flush current stats (call periodically or on page change)
  const flushStats = useCallback(async () => {
    if (!eventIdRef.current) return;

    const minutes = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 60000)
      : minutesReadRef.current;

    try {
      await updateContentEvent(eventIdRef.current, {
        minutes_read: minutes,
        pages_read: pagesReadRef.current.size,
      });
    } catch (error) {
      console.error("Failed to flush engagement stats:", error);
    }
  }, []);

  // Check if book is completed based on pages viewed
  const checkCompletion = useCallback(() => {
    if (pageCount > 0 && pagesReadRef.current.size >= pageCount) {
      markCompleted();
      return true;
    }
    return false;
  }, [pageCount, markCompleted]);

  return {
    trackPageView,
    markCompleted,
    flushStats,
    checkCompletion,
    getStats: () => ({
      minutes: minutesReadRef.current,
      pagesViewed: pagesReadRef.current.size,
    }),
  };
}

// Helper to detect device type
function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua))
    return "mobile";
  return "desktop";
}
