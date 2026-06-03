export const putikKnowledgeSections = [
  {
    title: "Tentang Putik Cemerlang",
    content:
      "Putik Cemerlang adalah portal layanan resmi Cabang Dinas Kelautan dan Perikanan Kabupaten Malang. Portal ini menjadi pusat informasi kelautan dan perikanan untuk pelayanan publik, data perikanan, dan edukasi konservasi.",
  },
  {
    title: "Layanan Publik Utama",
    content:
      "Layanan publik yang tersedia di portal meliputi Buku Tamu, Pengaduan Masyarakat, Whistle Blowing System, Pelaporan Gratifikasi, Kontak Kami, profil instansi, serta informasi statistik dan konten layanan.",
  },
  {
    title: "Profil dan Visi Layanan",
    content:
      "Portal menonjolkan pelayanan prima, transparan, dan inovatif di bidang kelautan dan perikanan berbasis teknologi informasi untuk mendukung masyarakat Kabupaten Malang.",
  },
  {
    title: "Kontak dan Bantuan",
    content:
      "Halaman Kontak Kami menyediakan informasi kontak, lokasi, dan jam pelayanan. Jika pengunjung membutuhkan tindak lanjut spesifik, arahan terbaik adalah melanjutkan ke live chat agent atau kanal kontak resmi yang tersedia di portal.",
  },
  {
    title: "Pedoman Jawaban Umum",
    content:
      "Untuk pertanyaan umum, jawab hanya berdasarkan konteks Putik Cemerlang dan layanan yang tampak di portal. Jangan mengarang kebijakan, nomor kontak, SLA, atau persyaratan yang tidak tersedia. Jika pertanyaan terlalu spesifik, terkait kasus individual, status laporan, kebutuhan verifikasi berkas, atau butuh keputusan petugas, arahkan ke live chat agent.",
  },
];

export function buildPutikKnowledgeContext() {
  return putikKnowledgeSections
    .map((section) => `${section.title}: ${section.content}`)
    .join("\n\n");
}
