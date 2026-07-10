import { motion } from "framer-motion";
import { Link } from "wouter";
import PublicNavbar from "@/components/PublicNavbar";
import {
  MapPin, Clock, Globe, Phone,
  Navigation, ExternalLink, Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const quickFacts = [
  { icon: <Building2 className="h-5 w-5" />, label: "Instansi", value: "Cabang Dinas Kelautan dan Perikanan Kab. Malang" },
  { icon: <MapPin className="h-5 w-5" />, label: "Alamat", value: "Jl. Trunojoyo 12 Kepanjen Malang 65153" },
  { icon: <Clock className="h-5 w-5" />, label: "Jam Operasional", value: "Senin–Jumat, 07.30–16.00 WIB" },
  { icon: <Phone className="h-5 w-5" />, label: "Telepon", value: "(0341) 395059" },
  { icon: <Globe className="h-5 w-5" />, label: "Website Resmi", value: "cabdinmalang.dkp.jatimprov.go.id" },
];

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4fa] to-[#f7f9fb] font-['Inter',Helvetica]">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#001e40] via-[#003366] to-[#00539b] py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-widest uppercase">
              <MapPin className="h-4 w-4 text-blue-300" />
              Informasi Kontak
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Hubungi Kami
            </h1>
            <p className="mx-auto max-w-2xl text-base text-blue-100">
              Cabang Dinas Kelautan dan Perikanan Kabupaten Malang siap melayani Anda. Temukan informasi kontak, lokasi, dan jam pelayanan kami di bawah ini.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Quick Facts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-10">
          {quickFacts.map((fact, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm h-full">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="mt-0.5 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003366] shrink-0">
                    {fact.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5f5e5e]">{fact.label}</p>
                    <p className="mt-1 text-sm font-medium text-[#001e40]">{fact.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Google Maps Embed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="mb-10 rounded-xl border border-[#c3c6d1] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-[#003366]" />
                <h2 className="text-sm font-bold text-[#001e40]">Lokasi Kantor</h2>
              </div>
              <a
                href="https://maps.app.goo.gl/r5G5u1EpSuKPqoML6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-[#3a5f94] hover:text-[#001e40] hover:underline"
              >
                Buka di Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="w-full h-[400px]">
              <iframe
                title="Lokasi Cabang Dinas Kelautan dan Perikanan Kab. Malang"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.812!2d112.565!3d-8.129!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e788e3c00000001%3A0x1!2sCabang+Dinas+Kelautan+dan+Perikanan+Kab.+Malang!5e0!3m2!1sid!2sid!4v1714900000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Card>
        </motion.div>

        {/* Social & CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card className="mt-10 rounded-xl border border-blue-100 bg-gradient-to-r from-[#001e40] to-[#003366] shadow-md text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-bold mb-2">Ada Pengaduan atau Masukan?</h3>
              <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
                Sampaikan pengaduan, aspirasi, atau laporan gratifikasi Anda melalui kanal resmi kami.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/pengaduan-masyarakat">
                  <button className="rounded-lg bg-white text-[#001e40] px-5 py-2.5 text-sm font-semibold hover:bg-blue-50 transition-colors">
                    Pengaduan Masyarakat
                  </button>
                </Link>
                <Link href="/pelaporan-gratifikasi">
                  <button className="rounded-lg bg-white/10 border border-white/30 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors">
                    Laporan Gratifikasi
                  </button>
                </Link>
                <Link href="/whistle-blowing">
                  <button className="rounded-lg bg-white/10 border border-white/30 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors">
                    Whistle Blowing
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-[#001428] px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-400">
          © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
