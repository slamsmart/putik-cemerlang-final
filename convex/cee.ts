import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import {
  CEE_DUMMY_RESPONSES,
  CEE_ITEMS,
  CEE_POSISI,
  isValidAnswer,
  nomorKode,
  type CeeAnswer,
} from "../shared/cee";

const answerValidator = v.object({ itemId: v.number(), value: v.number() });

const ceeResponseValidator = v.object({
  _id: v.id("ceeResponses"),
  _creationTime: v.number(),
  kode: v.string(),
  posisi: v.string(),
  nama: v.optional(v.string()),
  narasi: v.optional(v.string()),
  tahun: v.number(),
  answers: v.array(answerValidator),
  createdAt: v.number(),
});

/** Batas jumlah responden yang dibaca untuk rekapitulasi & unduhan. */
const BATAS_RESPONDEN = 2000;

/**
 * Jendela baca untuk menentukan kode responden berikutnya. Data dibaca dari
 * yang TERBARU supaya kode tertinggi selalu ikut terbaca; bila dibaca dari yang
 * terlama, kode akan berulang setelah jumlah responden melewati BATAS_RESPONDEN.
 */
const JENDELA_KODE = 200;

const KUNCI_SANDI_AKSES = "cee_access_password";
const SANDI_AKSES_BAWAAN = "malang123";

async function ambilSemua(ctx: QueryCtx | MutationCtx) {
  return await ctx.db
    .query("ceeResponses")
    .withIndex("by_created")
    .order("asc")
    .take(BATAS_RESPONDEN);
}

async function kodeBerikutnya(ctx: QueryCtx | MutationCtx): Promise<string> {
  const terbaru = await ctx.db
    .query("ceeResponses")
    .withIndex("by_created")
    .order("desc")
    .take(JENDELA_KODE);

  let tertinggi = 0;
  for (const row of terbaru) {
    const nomor = nomorKode(row.kode);
    if (nomor > tertinggi) tertinggi = nomor;
  }
  return `R${tertinggi + 1}`;
}

/** Semua jawaban CEE, urut waktu pengisian. */
export const list = query({
  args: {},
  returns: v.array(ceeResponseValidator),
  handler: async (ctx) => await ambilSemua(ctx),
});

/** Kode responden berikutnya, mis. "R4" bila sudah ada R1–R3. */
export const nextKode = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => kodeBerikutnya(ctx),
});

/**
 * Simpan satu pengisian kuesioner. Kode responden (R1, R2, …) ditentukan
 * di server berdasarkan urutan pengisian supaya tidak bentrok.
 */
export const submit = mutation({
  args: {
    posisi: v.string(),
    nama: v.optional(v.string()),
    narasi: v.optional(v.string()),
    tahun: v.optional(v.number()),
    answers: v.array(answerValidator),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!(CEE_POSISI as readonly string[]).includes(args.posisi)) {
      throw new Error("Posisi responden tidak valid");
    }
    if (args.answers.length !== CEE_ITEMS.length) {
      throw new Error(`Jawaban belum lengkap: ${args.answers.length}/${CEE_ITEMS.length} butir`);
    }

    const sudahAda = new Set<number>();
    for (const answer of args.answers) {
      if (sudahAda.has(answer.itemId)) {
        throw new Error(`Butir ${answer.itemId} dijawab lebih dari sekali`);
      }
      sudahAda.add(answer.itemId);
      if (!isValidAnswer(answer.itemId, answer.value)) {
        throw new Error(`Jawaban butir ${answer.itemId} tidak valid`);
      }
    }

    const answers: CeeAnswer[] = [...args.answers].sort((a, b) => a.itemId - b.itemId);
    const kode = await kodeBerikutnya(ctx);

    await ctx.db.insert("ceeResponses", {
      kode,
      posisi: args.posisi,
      tahun: args.tahun ?? new Date().getFullYear(),
      answers,
      createdAt: Date.now(),
      ...(args.nama ? { nama: args.nama } : {}),
      ...(args.narasi ? { narasi: args.narasi } : {}),
    });

    return kode;
  },
});

/**
 * Hapus satu responden (dipakai admin untuk membersihkan data contoh/uji).
 */
export const remove = mutation({
  args: { id: v.id("ceeResponses") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});

/**
 * Isi 3 responden contoh (R1–R3) untuk memperagakan rekapitulasi & unduhan.
 * Tidak melakukan apa pun bila tabel sudah berisi data, sehingga data asli
 * tidak pernah tertimpa.
 */
export const seedDummy = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const existing = await ambilSemua(ctx);
    if (existing.length > 0) return 0;

    const now = Date.now();
    for (let index = 0; index < CEE_DUMMY_RESPONSES.length; index += 1) {
      const dummy = CEE_DUMMY_RESPONSES[index];
      await ctx.db.insert("ceeResponses", {
        kode: dummy.kode,
        posisi: dummy.posisi,
        nama: dummy.nama,
        narasi: dummy.narasi,
        tahun: dummy.tahun,
        answers: dummy.answers,
        createdAt: now + index,
      });
    }
    return CEE_DUMMY_RESPONSES.length;
  },
});

/**
 * Verifikasi kata sandi akses kuesioner CEE. Kata sandi disimpan pada tabel
 * `settings` (key `cee_access_password`) sehingga tidak ada literal sandi di
 * dalam bundle browser; sandi bawaan hanya berlaku bila kunci belum diisi.
 */
export const verifyAccess = mutation({
  args: { password: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { password }) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", KUNCI_SANDI_AKSES))
      .first();
    return password === (setting?.value ?? SANDI_AKSES_BAWAAN);
  },
});
