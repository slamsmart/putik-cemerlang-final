import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isAuthenticated } from "@/lib/auth";

const VISITOR_ID_KEY = "putik-visitor-id";
const LAST_TRACK_KEY = "putik-last-track-ts";
// Debounce: jangan kirim mutation lebih dari 1x per 5 menit utk route yg sama.
const TRACK_THROTTLE_MS = 5 * 60 * 1000;

function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      // UUID v4 sederhana
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage diblokir (private mode) → buat id sementara di memori
    return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Hook pelacak pengunjung.
 * - Buat visitorId persisten di localStorage (1 per browser).
 * - Kirim mutation `visitorStats:track` saat halaman pertama dibuka dan
 *   setiap kali route berubah (dengan throttle 5 menit).
 * - Tag `isAdmin=true` bila sudah login, supaya bisa dipisahkan di stats.
 */
export function useVisitorTracker() {
  const [location] = useLocation();
  const track = useConvexMutation(api.visitorStats.track);
  const trackedRoutesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const routeKey = `${visitorId}::${location}`;

        // Skip kalau sudah track route ini dalam throttle window
        if (trackedRoutesRef.current.has(routeKey)) return;

        const lastTs = Number(localStorage.getItem(LAST_TRACK_KEY) || 0);
        const now = Date.now();
        if (lastTs && now - lastTs < TRACK_THROTTLE_MS && trackedRoutesRef.current.size > 0) {
          // Masih dalam throttle, tapi tetap tandai route agar tidak spam saat klik cepat
          trackedRoutesRef.current.add(routeKey);
          return;
        }

        trackedRoutesRef.current.add(routeKey);
        localStorage.setItem(LAST_TRACK_KEY, String(now));

        const isAdmin = isAuthenticated();
        const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : undefined;

        if (cancelled) return;
        await track({ visitorId, userAgent, isAdmin });
      } catch (e) {
        // Diam — jangan mengganggu UX bila tracking gagal
        console.debug("[visitor-tracker] failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, track]);
}
