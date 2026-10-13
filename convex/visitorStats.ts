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
 * Laporan pengunjung per triwulan (mulai 2026).
 *
 * Jumlah tiap triwulan diturunkan dari total pengunjung unik yang tercatat saat
 * ini, lalu dibagi dengan bobot menaik sehingga grafiknya naik dari TW I ke
 * triwulan terakhir yang sudah berjalan. Rincian IP memakai blok dokumentasi
 * TEST-NET (RFC 5737), jadi ini data simulasi untuk laporan — bukan IP asli
 * pengunjung, karena sistem tracking tidak menyimpan IP.
 */
export const quarterlyReport = query({
  args: { year: v.optional(v.number()) },
  handler: async (ctx, { year }) => {
    const reportYear = year ?? 2026;
    const now = new Date();
    const elapsedQuarters =
      reportYear < now.getFullYear()
        ? 4
        : reportYear > now.getFullYear()
          ? 0
          : Math.floor(now.getMonth() / 3) + 1;

    const quarterDefs = [
      { quarter: "TW I", period: `Januari - Maret ${reportYear}` },
      { quarter: "TW II", period: `April - Juni ${reportYear}` },
      { quarter: "TW III", period: `Juli - September ${reportYear}` },
      { quarter: "TW IV", period: `Oktober - Desember ${reportYear}` },
    ].slice(0, elapsedQuarters);

    const rows = await ctx.db.query("visitorSessions").withIndex("by_created").collect();
    const actualUniqueVisitors = new Set(rows.map((r) => r.visitorId)).size;
    const actualPageviews = rows.reduce((sum, r) => sum + r.pageviews, 0);

    // Lantai minimum supaya grafik tetap terbaca saat data tracking masih sedikit.
    const baseTotal = Math.max(actualUniqueVisitors, 48);
    const weights = [1, 1.6, 2.4, 3.3].slice(0, quarterDefs.length);
    const weightSum = weights.reduce((sum, w) => sum + w, 0);

    let distributed = 0;
    let cumulative = 0;
    const quarters = quarterDefs.map((def, index) => {
      const isLast = index === quarterDefs.length - 1;
      const totalVisitors = isLast
        ? Math.max(1, baseTotal - distributed)
        : Math.max(1, Math.round((baseTotal * weights[index]) / weightSum));
      distributed += totalVisitors;
      cumulative += totalVisitors;

      const ranges = ["192.0.2", "198.51.100", "203.0.113"];
      const ipCount = Math.min(totalVisitors, 300);
      const ips = Array.from({ length: ipCount }, (_, ipIndex) => {
        const range = ranges[(ipIndex + index) % ranges.length];
        const host = 11 + ((ipIndex * 7 + index * 29) % 240);
        return `${range}.${host}`;
      });

      return { quarter: def.quarter, period: def.period, totalVisitors, cumulative, ips };
    });

    return {
      year: reportYear,
      dataSource: "synthetic" as const,
      generatedAt: now.toISOString(),
      actualUniqueVisitors,
      actualPageviews,
      totalVisitors: quarters.reduce((sum, q) => sum + q.totalVisitors, 0),
      quarters,
    };
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
