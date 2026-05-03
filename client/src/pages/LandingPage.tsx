import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🌊",
    title: "Data Kelautan",
    desc: "Akses data kondisi laut, cuaca, dan arus terkini di wilayah Kabupaten Malang.",
  },
  {
    icon: "🐟",
    title: "Informasi Perikanan",
    desc: "Pantau hasil tangkapan, musim ikan, dan zona tangkap yang aman untuk nelayan.",
  },
  {
    icon: "🌿",
    title: "Konservasi Laut",
    desc: "Program pelestarian terumbu karang, mangrove, dan ekosistem pesisir Malang.",
  },
  {
    icon: "📋",
    title: "Layanan Publik",
    desc: "Perizinan kapal, surat keterangan nelayan, dan layanan administrasi maritim.",
  },
  {
    icon: "📡",
    title: "Monitoring Real-time",
    desc: "Sistem pemantauan laut secara langsung berbasis teknologi sensor terkini.",
  },
  {
    icon: "📢",
    title: "Peringatan Dini",
    desc: "Notifikasi cuaca ekstrem dan peringatan dini bencana laut untuk keselamatan nelayan.",
  },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-['Inter',Helvetica]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#001e40]">PUTIK CEMERLANG</span>
            <span className="text-xs text-[#5f5e5e]">Sistem Informasi Maritim Terpadu</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-normal text-slate-600 transition-colors hover:text-[#001e40]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button
                data-testid="button-admin-portal"
                className="rounded-lg bg-[#001e40] px-6 py-2 text-sm font-medium text-white hover:bg-[#001e40]/90"
              >
                Portal Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001e40] via-[#003366] to-[#004080] px-8 py-32 text-white">
        <div className="absolute inset-0 bg-[url('/figmaAssets/background.svg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full bg-[#c6e7ff]/20 px-4 py-1.5 text-xs font-medium tracking-widest text-[#c6e7ff] uppercase">
              Kabupaten Malang
            </span>
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              Pelayanan Informasi
              <br />
              Maritim Terpadu
            </h1>
            <p className="mb-10 text-lg font-normal leading-relaxed text-slate-300">
              Akses data kelautan dan perikanan Kabupaten Malang secara transparan dan akuntabel.
              Sistem terintegrasi untuk nelayan, pengusaha perikanan, dan masyarakat pesisir.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                data-testid="button-pelajari-layanan"
                className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-[#001e40] hover:bg-slate-100"
              >
                Pelajari Layanan
              </Button>
              <Button
                data-testid="button-buku-tamu"
                variant="outline"
                className="rounded-lg border-white/40 bg-transparent px-8 py-3 text-base font-semibold text-white hover:bg-white/10"
              >
                Buku Tamu
              </Button>
            </div>
          </div>
        </div>
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 36.7C480 33.3 600 46.7 720 50C840 53.3 960 46.7 1080 43.3C1200 40 1320 40 1380 40L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span
                  data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s/g, "-")}`}
                  className="text-3xl font-bold text-[#001e40]"
                >
                  {stat.value}
                </span>
                <span className="mt-1 text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="layanan" className="bg-[#f7f9fb] px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#001e40]">Layanan Kami</h2>
            <p className="mt-3 text-base text-slate-500">
              Berbagai layanan informasi maritim tersedia untuk mendukung masyarakat pesisir Kabupaten Malang
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Card
                key={i}
                data-testid={`card-feature-${i}`}
                className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d] transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="text-base font-semibold text-[#001e40]">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#001e40] px-8 py-20 text-white">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center gap-6">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001428] px-8 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <h3 className="mb-3 text-lg font-bold">PUTIK CEMERLANG</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Sistem Informasi Maritim Terpadu Kabupaten Malang. Mewujudkan tata kelola laut
                yang transparan dan berkelanjutan.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-slate-400">
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Peta Situs", "Hubungi Kami"].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
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
