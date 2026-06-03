import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Visitor tracking — satu sesi unik per (visitorId + tanggal).
 * Dipanggil setiap kali browser membuka site (admin maupun publik).
 */

function todayKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const track = mutation({
  args: {
    visitorId: v.string(),
    userAgent: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
  },
  handler: async (ctx, { visitorId, userAgent, isAdmin }) => {
    const now = Date.now();
    const dateKey = todayKey(now);

    const existing = await ctx.db
      .query("visitorSessions")
      .withIndex("by_visitor_date", (q) =>
        q.eq("visitorId", visitorId).eq("dateKey", dateKey),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pageviews: existing.pageviews + 1,
        lastSeen: now,
        // Tingkatkan status admin tapi jangan turunkan
        isAdmin: existing.isAdmin || !!isAdmin,
      });
      return { sessionId: existing._id, isNew: false };
    }

    const sessionId = await ctx.db.insert("visitorSessions", {
      visitorId,
      dateKey,
      pageviews: 1,
      firstSeen: now,
      lastSeen: now,
      userAgent,
      isAdmin: !!isAdmin,
    });
    return { sessionId, isNew: true };
  },
});

/**
 * Ambil statistik dalam `days` hari ke belakang (termasuk hari ini).
 * Balikan:
 *  - totalUnique    → jumlah visitorId unik dalam rentang
 *  - totalPageviews → total pageview
 *  - todayUnique    → unik hari ini
 *  - todayPageviews → pageview hari ini
 *  - adminUnique    → unik yang tercatat sebagai admin
 *  - series         → [{ dateKey, unique, pageviews }] per hari (urut lama→baru)
 */
export const stats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const rangeDays = Math.max(1, Math.min(days ?? 30, 365));
    const now = Date.now();
    const cutoff = now - rangeDays * 24 * 60 * 60 * 1000;

    const rows = await ctx.db
      .query("visitorSessions")
      .withIndex("by_created")
      .collect();

    const inRange = rows.filter((r) => r.firstSeen >= cutoff);
    const todayKeyStr = todayKey(now);

    const uniqueSet = new Set<string>();
    const adminSet = new Set<string>();
    let totalPageviews = 0;
    let todayUnique = 0;
    let todayPageviews = 0;
    const byDay: Record<string, { unique: Set<string>; pageviews: number }> = {};

    // Prepopulate series supaya tanggal yang 0 kunjungan tetap muncul.
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = todayKey(d.getTime());
      byDay[key] = { unique: new Set(), pageviews: 0 };
    }

    for (const r of inRange) {
      uniqueSet.add(r.visitorId);
      if (r.isAdmin) adminSet.add(r.visitorId);
      totalPageviews += r.pageviews;
      if (r.dateKey === todayKeyStr) {
        todayPageviews += r.pageviews;
      }
      if (!byDay[r.dateKey]) {
        byDay[r.dateKey] = { unique: new Set(), pageviews: 0 };
      }
      byDay[r.dateKey].unique.add(r.visitorId);
      byDay[r.dateKey].pageviews += r.pageviews;
    }
    todayUnique = byDay[todayKeyStr]?.unique.size ?? 0;

    const series = Object.entries(byDay)
      .map(([dateKey, dayData]) => ({
        dateKey,
        unique: dayData.unique.size,
        pageviews: dayData.pageviews,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    return {
      totalUnique: uniqueSet.size,
      totalPageviews,
      todayUnique,
      todayPageviews,
      adminUnique: adminSet.size,
      publicUnique: uniqueSet.size - adminSet.size,
      series,
      rangeDays,
    };
  },
});
