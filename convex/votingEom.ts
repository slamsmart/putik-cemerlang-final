import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Batas maksimal pemilih per periode
const MAX_VOTES = 23;

// ── Queries ──────────────────────────────────────────────────────────────

export const listCandidates = query({
  args: { periode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.periode) {
      const candidates = await ctx.db
        .query("eomCandidates")
        .withIndex("by_periode", (q) => q.eq("periode", args.periode!))
        .collect();
      return candidates.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return await ctx.db.query("eomCandidates").order("desc").take(100);
  },
});

export const listActiveCandidates = query({
  args: {},
  handler: async (ctx) => {
    const periodeSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomPeriode"))
      .first();
    const periode = periodeSetting?.value || "Mei 2026";
    
    const candidates = await ctx.db
      .query("eomCandidates")
      .withIndex("by_periode", (q) => q.eq("periode", periode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return candidates.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const getPeriode = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomPeriode"))
      .first();
    return setting?.value || "Mei 2026";
  },
});

export const getEomHeading = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomHeading"))
      .first();
    return {
      title: setting?.value || "Pegawai Teladan Triwulan I",
      subtitle: setting?.label || "Apresiasi dedikasi dan kinerja terbaik rekan kerja Anda. Berikan suara untuk kandidat yang paling mencerminkan nilai integritas Cabang Dinas Kelautan dan Perikanan Kabupaten Malang.",
    };
  },
});

export const updateEomHeading = mutation({
  args: { title: v.string(), subtitle: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomHeading"))
      .first();
    if (setting) {
      await ctx.db.patch(setting._id, { value: args.title, label: args.subtitle });
    } else {
      await ctx.db.insert("settings", { key: "eomHeading", value: args.title, label: args.subtitle });
    }
  },
});

export const getVoteStats = query({
  args: { periode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const candidates = args.periode
      ? await ctx.db
          .query("eomCandidates")
          .withIndex("by_periode", (q) => q.eq("periode", args.periode!))
          .take(50)
      : (await ctx.db.query("eomCandidates").order("desc").take(100)).filter(
          (c) => c.isActive
        );

    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

    return {
      totalVotes,
      candidateCount: candidates.length,
      ranking: sorted.map((c) => ({
        _id: c._id,
        nama: c.nama,
        seksi: c.seksi,
        imageUrl: c.imageUrl,
        voteCount: c.voteCount,
        percentage: totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0,
      })),
    };
  },
});

export const checkVoted = query({
  args: { ipAddress: v.string(), periode: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("eomVotes")
      .withIndex("by_ip_periode", (q) =>
        q.eq("ipAddress", args.ipAddress).eq("periode", args.periode)
      )
      .first();
    return !!existing;
  },
});

// Cek vote berdasarkan device UUID (localStorage) — mengatasi masalah shared NAT IP di kantor
export const checkVotedByDevice = query({
  args: { voterId: v.string(), periode: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("eomVotes")
      .withIndex("by_voterId_periode", (q) =>
        q.eq("voterId", args.voterId).eq("periode", args.periode)
      )
      .first();
    return !!existing;
  },
});

// Cek vote berdasarkan Gmail — deduplication utama setelah Google Sign-In
export const checkVotedByEmail = query({
  args: { voterEmail: v.string(), periode: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("eomVotes")
      .withIndex("by_voterEmail_periode", (q) =>
        q.eq("voterEmail", args.voterEmail).eq("periode", args.periode)
      )
      .first();
    return !!existing;
  },
});

// Daftar nama pemilih untuk periode (publik — tanpa email)
export const getVoterNames = query({
  args: { periode: v.string() },
  handler: async (ctx, args) => {
    const allVotes = await ctx.db.query("eomVotes").collect();
    return allVotes
      .filter((v) => v.periode === args.periode && v.voterName)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((v) => ({ name: v.voterName as string, createdAt: v.createdAt }));
  },
});

// Ambil whitelist email karyawan cabdin malang
export const getEomWhitelist = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomAllowedEmails"))
      .first();
    if (!setting?.value) return [];
    try {
      return JSON.parse(setting.value) as string[];
    } catch {
      return [];
    }
  },
});

// Update whitelist email (hanya admin)
export const setEomWhitelist = mutation({
  args: { emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const normalized = args.emails.map((e) => e.toLowerCase().trim()).filter(Boolean);
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomAllowedEmails"))
      .first();
    const value = JSON.stringify(normalized);
    if (setting) {
      await ctx.db.patch(setting._id, { value });
    } else {
      await ctx.db.insert("settings", { key: "eomAllowedEmails", value });
    }
  },
});

export const getVotingStatus = query({
  args: {},
  handler: async (ctx) => {
    const statusSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomVotingStatus"))
      .first();
    const deadlineSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomDeadline"))
      .first();
    const periodeSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomPeriode"))
      .first();
    const periode = periodeSetting?.value || "Mei 2026";

    // Hitung total suara dari voteCount kandidat (efisien, indexed)
    const candidates = await ctx.db
      .query("eomCandidates")
      .withIndex("by_periode", (q) => q.eq("periode", periode))
      .collect();
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

    return {
      status: statusSetting?.value === "closed" ? "closed" : "open",
      deadline: deadlineSetting?.value || null,
      totalVotes,
      maxVotes: MAX_VOTES,
      isFull: totalVotes >= MAX_VOTES,
    };
  },
});

export const getVotesWithDetails = query({
  args: { periode: v.string() },
  handler: async (ctx, args) => {
    // NOTE: by_ip_periode index is ["ipAddress","periode"] — cannot filter by periode alone.
    // Use a full scan + JS filter instead (safe for small audit log tables).
    const allVotes = await ctx.db.query("eomVotes").collect();
    const votes = allVotes.filter((v) => v.periode === args.periode);
    
    const candidates = await ctx.db
      .query("eomCandidates")
      .withIndex("by_periode", (q) => q.eq("periode", args.periode))
      .collect();
    
    return votes.map(v => {
      const candidate = candidates.find(c => c._id === v.candidateId);
      return {
        ...v,
        candidateName: candidate?.nama || "Unknown",
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getPeriodeHistory = query({
  args: {},
  handler: async (ctx) => {
    const candidates = await ctx.db.query("eomCandidates").collect();
    const periods = Array.from(new Set(candidates.map((c) => c.periode)));
    
    const history = periods.map((p) => {
      const periodCandidates = candidates.filter((c) => c.periode === p);
      const totalVotes = periodCandidates.reduce((sum, c) => sum + c.voteCount, 0);
      const winner = [...periodCandidates].sort((a, b) => b.voteCount - a.voteCount)[0];
      
      return {
        periode: p,
        totalVotes,
        candidateCount: periodCandidates.length,
        winner: winner ? {
          nama: winner.nama,
          seksi: winner.seksi,
          imageUrl: winner.imageUrl,
          voteCount: winner.voteCount,
        } : null,
      };
    });
    
    // Sort history by period (descending - assuming period names are sortable or just by most recent)
    // For now, let's just return it.
    return history.sort((a, b) => b.periode.localeCompare(a.periode));
  },
});

// ── Mutations ────────────────────────────────────────────────────────────

export const createCandidate = mutation({
  args: {
    nama: v.string(),
    seksi: v.string(),
    imageUrl: v.optional(v.string()),
    periode: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("eomCandidates", {
      nama: args.nama,
      seksi: args.seksi,
      imageUrl: args.imageUrl,
      periode: args.periode,
      isActive: true,
      voteCount: 0,
      displayOrder: args.displayOrder,
      createdAt: Date.now(),
    });
  },
});

export const updateCandidate = mutation({
  args: {
    id: v.id("eomCandidates"),
    nama: v.optional(v.string()),
    seksi: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    periode: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filtered[key] = value;
    }
    await ctx.db.patch(id, filtered);
  },
});

export const removeCandidate = mutation({
  args: { id: v.id("eomCandidates") },
  handler: async (ctx, args) => {
    // Delete associated votes
    const votes = await ctx.db
      .query("eomVotes")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.id))
      .take(500);
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const castVote = mutation({
  args: {
    candidateId: v.id("eomCandidates"),
    ipAddress: v.string(),
    voterId: v.optional(v.string()), // UUID browser untuk deteksi per-device
    voterEmail: v.optional(v.string()), // Gmail dari Google Sign-In
    voterName: v.optional(v.string()),  // Nama profil Google
    periode: v.string(),
  },
  handler: async (ctx, args) => {
    // Cek status voting
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomVotingStatus"))
      .first();
    if (setting?.value === "closed") {
      throw new Error("Pemilihan telah ditutup untuk periode ini.");
    }

    // Cek kuota — maksimal MAX_VOTES pemilih per periode
    const candidatesForQuota = await ctx.db
      .query("eomCandidates")
      .withIndex("by_periode", (q) => q.eq("periode", args.periode))
      .collect();
    const totalVotes = candidatesForQuota.reduce((sum, c) => sum + c.voteCount, 0);
    if (totalVotes >= MAX_VOTES) {
      throw new Error(`Kuota voting sudah penuh (${MAX_VOTES} dari ${MAX_VOTES} pemilih).`);
    }

    // Wajib login Google
    if (!args.voterEmail) {
      throw new Error("Harus login dengan Google untuk memberikan suara.");
    }

    // Cek whitelist — jika ada, email harus terdaftar
    const whitelistSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomAllowedEmails"))
      .first();
    if (whitelistSetting?.value) {
      let allowed: string[] = [];
      try { allowed = JSON.parse(whitelistSetting.value); } catch { allowed = []; }
      if (allowed.length > 0 && !allowed.includes(args.voterEmail.toLowerCase())) {
        throw new Error("Email Anda tidak terdaftar sebagai karyawan Cabdin KP Kab. Malang. Hubungi admin jika ini kesalahan.");
      }
    }

    // Deduplication by email (primer) — satu akun Google = satu suara
    const existingByEmail = await ctx.db
      .query("eomVotes")
      .withIndex("by_voterEmail_periode", (q) =>
        q.eq("voterEmail", args.voterEmail).eq("periode", args.periode)
      )
      .first();
    if (existingByEmail) {
      throw new Error("Akun Google ini sudah digunakan untuk memilih pada periode ini.");
    }

    // Rekam vote — IP + email dicatat untuk audit
    await ctx.db.insert("eomVotes", {
      candidateId: args.candidateId,
      ipAddress: args.ipAddress,
      voterId: args.voterId,
      voterEmail: args.voterEmail,
      voterName: args.voterName,
      periode: args.periode,
      createdAt: Date.now(),
    });

    // Tambah voteCount pada kandidat
    const candidate = await ctx.db.get(args.candidateId);
    if (candidate) {
      await ctx.db.patch(args.candidateId, {
        voteCount: candidate.voteCount + 1,
      });
    }

    // Auto-close voting jika kuota sudah terpenuhi
    if (totalVotes + 1 >= MAX_VOTES) {
      if (setting) {
        await ctx.db.patch(setting._id, { value: "closed" });
      } else {
        await ctx.db.insert("settings", { key: "eomVotingStatus", value: "closed" });
      }
    }
  },
});

export const resetVotes = mutation({
  args: { periode: v.string() },
  handler: async (ctx, args) => {
    // Reset voteCount kandidat
    const candidates = await ctx.db
      .query("eomCandidates")
      .withIndex("by_periode", (q) => q.eq("periode", args.periode))
      .take(50);
    for (const c of candidates) {
      await ctx.db.patch(c._id, { voteCount: 0 });
    }
    // Hapus semua eomVotes records untuk periode ini
    const allVotes = await ctx.db.query("eomVotes").collect();
    const votes = allVotes.filter((v) => v.periode === args.periode);
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
  },
});

export const deleteVote = mutation({
  args: { voteId: v.id("eomVotes") },
  handler: async (ctx, args) => {
    const vote = await ctx.db.get(args.voteId);
    if (!vote) throw new Error("Vote tidak ditemukan.");
    // Kurangi voteCount kandidat
    const candidate = await ctx.db.get(vote.candidateId);
    if (candidate && candidate.voteCount > 0) {
      await ctx.db.patch(vote.candidateId, { voteCount: candidate.voteCount - 1 });
    }
    await ctx.db.delete(args.voteId);
  },
});

export const toggleVotingStatus = mutation({
  args: { status: v.union(v.literal("open"), v.literal("closed")) },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomVotingStatus"))
      .first();
    if (setting) {
      await ctx.db.patch(setting._id, { value: args.status });
    } else {
      await ctx.db.insert("settings", { key: "eomVotingStatus", value: args.status });
    }
  },
});
export const updatePeriode = mutation({
  args: { periode: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomPeriode"))
      .first();
    if (setting) {
      await ctx.db.patch(setting._id, { value: args.periode });
    } else {
      await ctx.db.insert("settings", { key: "eomPeriode", value: args.periode });
    }
  },
});

export const reorderCandidates = mutation({
  args: { ids: v.array(v.id("eomCandidates")) },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.ids.length; i++) {
      await ctx.db.patch(args.ids[i], { displayOrder: i });
    }
  },
});

export const updateDeadline = mutation({
  args: { deadline: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "eomDeadline"))
      .first();
    if (setting) {
      await ctx.db.patch(setting._id, { value: args.deadline });
    } else {
      await ctx.db.insert("settings", { key: "eomDeadline", value: args.deadline });
    }
  },
});
