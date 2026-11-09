/**
 * Kuesioner Control Environment Evaluation (CEE) — Cabang Dinas Kelautan dan
 * Perikanan Kabupaten Malang.
 *
 * Butir kuesioner diadaptasi dari dokumen sumber "Kuesioner CEE - CABDIN KP
 * TUBAN.pdf" (37 butir, 8 sub-unsur); metode rekapitulasi (modus per butir +
 * simpulan per sub-unsur) mengikuti "Rekapitulasi CEE - CABDIN KP TUBAN.pdf".
 * Kedua berkas tersimpan di `doc/` sebagai rujukan.
 *
 * Modul ini murni data + fungsi hitung, dipakai bersama oleh backend Convex
 * (validasi jawaban) dan frontend (form & rekapitulasi).
 */

export type CeeOption = {
  value: number;
  label: string;
};

export type CeeItem = {
  /** Nomor butir pada kuesioner (1–37). */
  no: number;
  /** Kode sub-unsur (A–H). */
  grup: string;
  text: string;
  options: CeeOption[];
};

export type CeeGroup = {
  kode: string;
  judul: string;
};

export type CeeAnswer = {
  itemId: number;
  value: number;
};

export type CeeResponseLike = {
  kode: string;
  answers: CeeAnswer[];
};

export const CEE_POSISI = [
  "Pejabat Struktural",
  "Pejabat Fungsional Tertentu",
  "Pejabat Fungsional Umum/Staf",
] as const;

export const CEE_GROUPS: CeeGroup[] = [
  { kode: "A", judul: "Penegakan Integritas dan Nilai Etika" },
  { kode: "B", judul: "Komitmen Terhadap Kompetensi" },
  { kode: "C", judul: "Kepemimpinan yang Kondusif" },
  { kode: "D", judul: "Pembentukan Struktur Organisasi yang Sesuai dengan Kebutuhan" },
  { kode: "E", judul: "Pendelegasian Wewenang dan Tanggung Jawab yang Tepat" },
  {
    kode: "F",
    judul: "Penyusunan dan Penerapan Kebijakan yang Sehat tentang Pembinaan Sumber Daya Manusia",
  },
  { kode: "G", judul: "Perwujudan Peran Aparat Pengawasan Intern Pemerintah yang Efektif" },
  { kode: "H", judul: "Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait" },
];

const OPSI_FREKUENSI: CeeOption[] = [
  { value: 1, label: "Tidak Pernah" },
  { value: 2, label: "Jarang" },
  { value: 3, label: "Sering" },
  { value: 4, label: "Selalu" },
];

const OPSI_SETUJU: CeeOption[] = [
  { value: 1, label: "Sangat Tidak Setuju" },
  { value: 2, label: "Tidak Setuju" },
  { value: 3, label: "Setuju" },
  { value: 4, label: "Sangat Setuju" },
];

const OPSI_KONDISI: CeeOption[] = [
  { value: 1, label: "Belum" },
  { value: 2, label: "Sebagian kecil" },
  { value: 3, label: "Sebagian besar" },
  { value: 4, label: "Seluruhnya" },
];

const OPSI_REVIU: CeeOption[] = [
  { value: 1, label: "Tidak Pernah" },
  { value: 2, label: "Jarang" },
  { value: 3, label: "Sering" },
  { value: 4, label: "Rutin" },
];

export const CEE_ITEMS: CeeItem[] = [
  // A. Penegakan Integritas dan Nilai Etika
  {
    no: 1,
    grup: "A",
    text: "Pegawai mendapatkan pesan integritas & nilai etika secara rutin dari pimpinan instansi (Misalnya keteladanan, pesan moral dll)",
    options: OPSI_FREKUENSI,
  },
  {
    no: 2,
    grup: "A",
    text: "Pemda telah memiliki aturan perilaku (misalnya kode etik, pakta integritas, dan aturan perilaku pegawai) yang telah dikomunikasikan kepada seluruh pegawai",
    options: [
      { value: 1, label: "Belum ada" },
      { value: 2, label: "Sedang disusun" },
      { value: 3, label: "Sudah ada" },
      { value: 4, label: "Sudah ada dan dimutakhirkan" },
    ],
  },
  {
    no: 3,
    grup: "A",
    text: "Telah terdapat fungsi khusus di dalam instansi yang melayani pengaduan masyarakat atas pelanggaran aturan perilaku/kode etik",
    options: [
      { value: 1, label: "Tidak Ada" },
      { value: 2, label: "Ada, tapi belum berfungsi" },
      { value: 3, label: "Ada, tapi belum optimal" },
      { value: 4, label: "Ada, sudah optimal" },
    ],
  },
  {
    no: 4,
    grup: "A",
    text: "Pelanggaran aturan perilaku/kode etik telah ditindaklanjuti sesuai ketentuan yang berlaku",
    options: OPSI_FREKUENSI,
  },

  // B. Komitmen Terhadap Kompetensi
  {
    no: 5,
    grup: "B",
    text: "Standar kompetensi setiap pegawai/posisi jabatan telah ditentukan",
    options: OPSI_SETUJU,
  },
  {
    no: 6,
    grup: "B",
    text: "Pegawai yang kompeten telah secara tepat mengisi posisi/jabatan",
    options: OPSI_SETUJU,
  },
  {
    no: 7,
    grup: "B",
    text: "Pemda telah memiliki dan menerapkan strategi peningkatan kompetensi pegawai",
    options: OPSI_FREKUENSI,
  },
  {
    no: 8,
    grup: "B",
    text: "Terdapat pelatihan terkait pengelolaan risiko, baik pelatihan khusus maupun pelatihan terintegrasi secara berkala.",
    options: OPSI_SETUJU,
  },

  // C. Kepemimpinan yang Kondusif
  {
    no: 9,
    grup: "C",
    text: "Pimpinan telah menetapkan kebijakan pengelolaan risiko yang memberikan kejelasan arah pengelolaan risiko",
    options: OPSI_SETUJU,
  },
  {
    no: 10,
    grup: "C",
    text: "Pimpinan menerapkan pengelolaan risiko dan pengendalian dalam pelaksanaan tugas dan pengambilan keputusan",
    options: OPSI_SETUJU,
  },
  {
    no: 11,
    grup: "C",
    text: "Pimpinan membangun komunikasi yang baik dengan anggota organisasi untuk berani mengungkapkan risiko dan secara terbuka menerima/menggali pelaporan risiko/masalah",
    options: OPSI_SETUJU,
  },
  {
    no: 12,
    grup: "C",
    text: "Gaya pimpinan dapat mendorong pegawai untuk meningkatkan kinerja",
    options: OPSI_SETUJU,
  },
  {
    no: 13,
    grup: "C",
    text: "Pimpinan menetapkan Sasaran strategis yang selaras dengan visi dan misi Pemda",
    options: OPSI_SETUJU,
  },
  {
    no: 14,
    grup: "C",
    text: "Rencana/sasaran strategis pemda telah dijabarkan ke dalam sasaran OPD dan tingkat operasional OPD (cascading)",
    options: OPSI_SETUJU,
  },
  {
    no: 15,
    grup: "C",
    text: "Rencana strategis dan rencana kerja pemda telah menyajikan informasi mengenai risiko",
    options: OPSI_SETUJU,
  },
  {
    no: 16,
    grup: "C",
    text: "Pimpinan berperan serta dan mengikutsertakan pejabat dan pegawai terkait dalam proses pengelolaan risiko",
    options: OPSI_SETUJU,
  },

  // D. Pembentukan Struktur Organisasi yang Sesuai dengan Kebutuhan
  {
    no: 17,
    grup: "D",
    text: "Setiap Urusan telah dilaksanakan oleh OPD dan unit kerja yang tepat",
    options: OPSI_SETUJU,
  },
  {
    no: 18,
    grup: "D",
    text: "Masing-masing pihak dalam organisasi telah memperoleh kejelasan dan memahami peran dan tanggung jawab masing-masing dalam pengelolaan risiko",
    options: OPSI_SETUJU,
  },
  {
    no: 19,
    grup: "D",
    text: "Pegawai yang bertugas di OPD merupakan pegawai tetap dan bukan pegawai yang bersifat adhoc (sementara)",
    options: OPSI_SETUJU,
  },
  {
    no: 20,
    grup: "D",
    text: "Adanya transparansi dan ketepatan waktu pelaporan pelaksanaan peran dan tanggung jawab masing-masing dalam pengelolaan risiko",
    options: OPSI_SETUJU,
  },

  // E. Pendelegasian Wewenang dan Tanggung Jawab yang Tepat
  {
    no: 21,
    grup: "E",
    text: "Kriteria pendelegasian wewenang telah ditentukan dengan tepat",
    options: OPSI_SETUJU,
  },
  {
    no: 22,
    grup: "E",
    text: "Pendelegasian wewenang dan tanggung jawab dilaksanakan secara tepat",
    options: OPSI_SETUJU,
  },
  {
    no: 23,
    grup: "E",
    text: "Kewenangan direviu secara periodik",
    options: OPSI_FREKUENSI,
  },

  // F. Penyusunan dan Penerapan Kebijakan yang Sehat tentang Pembinaan SDM
  {
    no: 24,
    grup: "F",
    text: "Pemda telah memiliki Kebijakan dan prosedur pengelolaan SDM yang lengkap (sejak rekrutmen sampai dengan pemberhentian pegawai)",
    options: [
      { value: 1, label: "Tidak memiliki" },
      { value: 4, label: "Memiliki" },
    ],
  },
  {
    no: 25,
    grup: "F",
    text: "Rekrutmen, retensi, mutasi, maupun promosi pemilihan SDM telah dilakukan dengan baik",
    options: OPSI_KONDISI,
  },
  {
    no: 26,
    grup: "F",
    text: "Insentif pegawai telah sesuai dengan tanggung jawab dan kinerja",
    options: OPSI_KONDISI,
  },
  {
    no: 27,
    grup: "F",
    text: "Pemda telah menginternalisasi budaya sadar risiko",
    options: OPSI_KONDISI,
  },
  {
    no: 28,
    grup: "F",
    text: "Adanya pemberian reward dan/atau punishment atas pengelolaan risiko (Misalnya mempertimbangkan pertanggungjawaban pengelolaan risiko dalam penilaian kinerja)",
    options: OPSI_KONDISI,
  },
  {
    no: 29,
    grup: "F",
    text: "Terdapat evaluasi kinerja pegawai, dan telah dipertimbangkan dalam perhitungan penghasilan",
    options: OPSI_KONDISI,
  },
  {
    no: 30,
    grup: "F",
    text: "Instansi telah mengalokasikan anggaran yang memadai untuk pengembangan SDM",
    options: OPSI_SETUJU,
  },

  // G. Perwujudan Peran APIP yang Efektif
  {
    no: 31,
    grup: "G",
    text: "Inspektorat Daerah melakukan reviu atas efisiensi/efektivitas pelaksanaan setiap urusan/program secara periodik",
    options: OPSI_REVIU,
  },
  {
    no: 32,
    grup: "G",
    text: "Inspektorat Daerah melakukan reviu atas kepatuhan hukum dan aturan lainnya",
    options: OPSI_REVIU,
  },
  {
    no: 33,
    grup: "G",
    text: "Inspektorat Daerah memberikan layanan fasilitasi penerapan pengelolaan risiko dan penyelenggaraan SPIP",
    options: OPSI_REVIU,
  },
  {
    no: 34,
    grup: "G",
    text: "APIP telah melaksanakan pengawasan berbasis risiko.",
    options: OPSI_REVIU,
  },
  {
    no: 35,
    grup: "G",
    text: "Temuan dan saran/rekomendasi pengawasan APIP telah ditindaklanjuti",
    options: OPSI_KONDISI,
  },

  // H. Hubungan Kerja yang Baik dengan Instansi Pemerintah Terkait
  {
    no: 36,
    grup: "H",
    text: "Hubungan kerja yang baik dengan instansi/organisasi lain yang memiliki keterkaitan operasional telah terbangun",
    options: OPSI_REVIU,
  },
  {
    no: 37,
    grup: "H",
    text: "Hubungan kerja yang baik dengan instansi yang terkait atas fungsi pengawasan/pemeriksaan (inspektorat, BPKP, dan BPK) telah terbangun",
    options: OPSI_REVIU,
  },
];

export const CEE_ITEM_BY_NO: Record<number, CeeItem> = Object.fromEntries(
  CEE_ITEMS.map((item) => [item.no, item]),
);

/** Validasi satu jawaban: butir harus dikenal dan nilainya termasuk opsinya. */
export function isValidAnswer(itemId: number, value: number): boolean {
  const item = CEE_ITEM_BY_NO[itemId];
  return Boolean(item) && item.options.some((option) => option.value === value);
}

/** Ambang batas: nilai modus/rata-rata ≥ 3 dinyatakan "Memadai". */
export const CEE_AMBANG_MEMADAI = 3;

export const CEE_SIMPULAN_MEMADAI = "Memadai";
export const CEE_SIMPULAN_KURANG = "Kurang Memadai";
/** Nomor urut dari kode responden, mis. "R3" → 3. Kode tanpa angka → 0. */
export function nomorKode(kode: string): number {
  const digits = kode.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/**
 * Modus (nilai paling sering muncul). Bila seri, dipilih nilai terkecil —
 * sama dengan perilaku fungsi MODE() Excel yang dipakai pada rekapitulasi asli.
 */
export function modus(values: number[]): number | null {
  if (values.length === 0) return null;
  const urut = [...values].sort((a, b) => a - b);
  let best = urut[0];
  let bestCount = 0;
  let current = urut[0];
  let currentCount = 0;
  for (const value of urut) {
    if (value === current) {
      currentCount += 1;
    } else {
      current = value;
      currentCount = 1;
    }
    if (currentCount > bestCount) {
      best = current;
      bestCount = currentCount;
    }
  }
  return best;
}

export function simpulanDari(nilai: number | null): string {
  if (nilai === null) return "-";
  return nilai >= CEE_AMBANG_MEMADAI ? CEE_SIMPULAN_MEMADAI : CEE_SIMPULAN_KURANG;
}

export type CeeDummyResponse = CeeResponseLike & {
  posisi: string;
  nama: string;
  narasi: string;
  tahun: number;
};

const jawaban = (values: number[]): CeeAnswer[] =>
  values.map((value, index) => ({ itemId: index + 1, value }));

/**
 * Contoh data 3 responden (R1–R3) untuk uji tampilan rekapitulasi & unduhan.
 * Nilainya diambil dari kolom R1–R3 pada "Rekapitulasi CEE - CABDIN KP TUBAN.pdf".
 * Salinan sebagai file ada di `doc/cee-dummy/R1.json` … `R3.json`.
 */
export const CEE_DUMMY_RESPONSES: CeeDummyResponse[] = [
  {
    kode: "R1",
    posisi: "Pejabat Struktural",
    nama: "Responden Dummy 1",
    narasi: "Data contoh untuk uji tampilan rekapitulasi CEE.",
    tahun: 2026,
    answers: jawaban([
      4, 4, 4, 4, // A
      4, 3, 4, 3, // B
      4, 4, 4, 4, 4, 4, 4, 4, // C
      4, 4, 2, 3, // D
      4, 4, 4, // E
      4, 4, 4, 3, 2, 4, 3, // F
      4, 4, 4, 4, 4, // G
      4, 4, // H
    ]),
  },
  {
    kode: "R2",
    posisi: "Pejabat Fungsional Tertentu",
    nama: "Responden Dummy 2",
    narasi: "Data contoh untuk uji tampilan rekapitulasi CEE.",
    tahun: 2026,
    answers: jawaban([
      3, 3, 3, 2, // A
      3, 3, 2, 3, // B
      2, 3, 3, 3, 3, 3, 3, 3, // C
      3, 3, 2, 2, // D
      2, 3, 2, // E
      4, 3, 3, 2, 3, 3, 3, // F
      3, 3, 2, 2, 2, // G
      2, 2, // H
    ]),
  },
  {
    kode: "R3",
    posisi: "Pejabat Fungsional Umum/Staf",
    nama: "Responden Dummy 3",
    narasi: "Data contoh untuk uji tampilan rekapitulasi CEE.",
    tahun: 2026,
    answers: jawaban([
      4, 3, 4, 3, // A
      3, 3, 3, 3, // B
      3, 4, 3, 4, 3, 4, 3, 3, // C
      3, 4, 2, 3, // D
      4, 3, 3, // E
      4, 4, 4, 3, 3, 4, 4, // F
      3, 3, 3, 3, 3, // G
      4, 3, // H
    ]),
  },
];

export type CeeRekapItem = {
  no: number;
  grup: string;
  text: string;
  /** Nilai tiap responden, berurutan sesuai hasil rekap `responden`. */
  values: (number | null)[];
  modus: number | null;
  simpulan: string;
};

export type CeeRekapGroup = CeeGroup & {
  rataRata: number | null;
  simpulan: string;
};

export type CeeRekap = {
  responden: string[];
  items: CeeRekapItem[];
  groups: CeeRekapGroup[];
};

/**
 * Susun rekapitulasi bergaya "Rekapitulasi CEE": nilai per responden (R1, R2, …),
 * modus per butir, lalu simpulan per butir dan per sub-unsur.
 */
export function buildRekap<T extends CeeResponseLike>(responses: T[]): CeeRekap {
  const urut = [...responses].sort((a, b) => nomorKode(a.kode) - nomorKode(b.kode));

  const items: CeeRekapItem[] = CEE_ITEMS.map((item) => {
    const values = urut.map(
      (response) => response.answers.find((answer) => answer.itemId === item.no)?.value ?? null,
    );
    const terisi = values.filter((value): value is number => value !== null);
    const modusItem = modus(terisi);
    return {
      no: item.no,
      grup: item.grup,
      text: item.text,
      values,
      modus: modusItem,
      simpulan: simpulanDari(modusItem),
    };
  });

  const groups: CeeRekapGroup[] = CEE_GROUPS.map((group) => {
    const modusGrup = items
      .filter((item) => item.grup === group.kode && item.modus !== null)
      .map((item) => item.modus as number);
    const rataRata =
      modusGrup.length > 0
        ? modusGrup.reduce((total, value) => total + value, 0) / modusGrup.length
        : null;
    return { ...group, rataRata, simpulan: simpulanDari(rataRata) };
  });

  return { responden: urut.map((response) => response.kode), items, groups };
}
