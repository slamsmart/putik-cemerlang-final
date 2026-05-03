import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSlider } from "@/components/HeroSlider";

const features = [
  { icon: "🌊", title: "Data Kelautan", desc: "Akses data kondisi laut, cuaca, dan arus terkini di wilayah Kabupaten Malang." },
  { icon: "🐟", title: "Informasi Perikanan", desc: "Pantau hasil tangkapan, musim ikan, dan zona tangkap yang aman untuk nelayan." },
  { icon: "🌿", title: "Konservasi Laut", desc: "Program pelestarian terumbu karang, mangrove, dan ekosistem pesisir Malang." },
  { icon: "📋", title: "Layanan Publik", desc: "Perizinan kapal, surat keterangan nelayan, dan layanan administrasi maritim." },
  { icon: "📡", title: "Monitoring Real-time", desc: "Sistem pemantauan laut secara langsung berbasis teknologi sensor terkini." },
  { icon: "📢", title: "Peringatan Dini", desc: "Notifikasi cuaca ekstrem dan peringatan dini bencana laut untuk keselamatan nelayan." },
];

const stats = [
  { value: "12,500+", label: "Nelayan Terdaftar" },
  { value: "48", label: "Desa Pesisir" },
  { value: "3,200 km²", label: "Area Perairan" },
  { value: "24/7", label: "Monitoring Aktif" },
];

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Layanan", href: "#layanan" },
  { label: "Perikanan", href: "#perikanan" },
  { label: "Konservasi", href: "#konservasi" },
  { label: "Tentang", href: "#tentang" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-['Inter',Helvetica]">
      {/* ── Navigation ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div>
            <span className="text-lg font-bold text-[#001e40]">PUTIK CEMERLANG</span>
            <span className="ml-2 text-xs text-[#5f5e5e]">Sistem Informasi Maritim Terpadu</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-slate-600 transition-colors hover:text-[#001e40]">
                {l.label}
              </a>
            ))}
          </nav>
          <Link href="/admin">
            <Button
              data-testid="button-admin-portal"
              className="rounded-lg bg-[#001e40] px-6 py-2 text-sm text-white hover:bg-[#001e40]/90"
            >
              Portal Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero Slider ───────────────────────────────────── */}
      <HeroSlider />

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-8 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="flex flex-col items-center text-center"
              >
                <span
                  data-testid={`stat-value-${s.label.toLowerCase().replace(/\s/g, "-")}`}
                  className="text-3xl font-bold text-[#001e40]"
                >
                  {s.value}
                </span>
                <span className="mt-1 text-sm text-slate-500">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="layanan" className="bg-[#f7f9fb] px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-[#001e40]">Layanan Kami</h2>
            <p className="mt-3 text-base text-slate-500">
              Berbagai layanan informasi maritim tersedia untuk mendukung masyarakat pesisir Kabupaten Malang
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card
                  data-testid={`card-feature-${i}`}
                  className="h-full rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d] transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-3 p-6">
                    <span className="text-3xl">{f.icon}</span>
                    <h3 className="text-base font-semibold text-[#001e40]">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="bg-[#001e40] px-8 py-20 text-white">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center"
        >
          <h2 className="text-3xl font-bold">Bergabung dengan Program Konservasi Laut</h2>
          <p className="max-w-xl text-base text-slate-300">
            Bersama menjaga kelestarian laut Malang untuk generasi yang akan datang.
            Daftarkan diri Anda sebagai relawan konservasi ekosistem laut.
          </p>
          <Button
            data-testid="button-gabung-relawan"
            className="rounded-lg bg-white px-10 py-3 text-base font-semibold text-[#001e40] hover:bg-slate-100"
          >
            Gabung Relawan
          </Button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-[#001428] px-8 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <h3 className="mb-3 text-lg font-bold">PUTIK CEMERLANG</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Sistem Informasi Maritim Terpadu Kabupaten Malang. Mewujudkan tata kelola laut yang transparan dan berkelanjutan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-slate-400">
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Peta Situs", "Hubungi Kami"].map((l) => (
                <a key={l} href="#" className="transition-colors hover:text-white">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-slate-700 pt-6">
            <p className="text-sm text-slate-500">
              © 2024 Marine Information Center - Kabupaten Malang. Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
