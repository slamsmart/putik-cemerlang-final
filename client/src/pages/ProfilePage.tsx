import { Link } from "wouter";
import PublicNavbar from "@/components/PublicNavbar";
import * as LucideIcons from "lucide-react";

export default function ProfilePage() {

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-['Inter',Helvetica] min-h-screen">
      <PublicNavbar />

      <main className="pt-20">
        <div className="max-w-[1280px] mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-[#d5e3ff] rounded-full mb-3">
              <span className="text-[#001e40] text-xs font-medium tracking-widest font-bold">PROFIL KAMI</span>
            </div>
            <h1 className="font-['Public_Sans',Helvetica] text-[2.5rem] font-bold leading-tight text-[#001e40]">Visi, Misi & Struktur Organisasi</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-[0px_2px_10px_#0000000a] border border-[#c3c6d1]">
              <h3 className="text-xl font-bold text-[#001e40] mb-4 flex items-center gap-2">
                <LucideIcons.Eye className="w-6 h-6 text-[#00a6e4]" /> Visi
              </h3>
              <p className="text-[#5f5e5e] leading-relaxed">
                "Mewujudkan pelayanan prima, transparan, dan inovatif di bidang kelautan dan perikanan berbasis teknologi informasi untuk mendukung kesejahteraan masyarakat dan pelestarian ekosistem maritim."
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-[0px_2px_10px_#0000000a] border border-[#c3c6d1]">
              <h3 className="text-xl font-bold text-[#001e40] mb-4 flex items-center gap-2">
                <LucideIcons.Target className="w-6 h-6 text-[#00a6e4]" /> Misi
              </h3>
              <ul className="space-y-3 text-[#5f5e5e] leading-relaxed list-none">
                <li className="flex items-start gap-3"><LucideIcons.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <span>Mengoptimalkan pelayanan publik yang cepat, mudah, dan terintegrasi.</span></li>
                <li className="flex items-start gap-3"><LucideIcons.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <span>Menyediakan pusat data dan informasi kelautan yang akurat.</span></li>
                <li className="flex items-start gap-3"><LucideIcons.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <span>Mendorong partisipasi masyarakat dalam pelestarian laut.</span></li>
                <li className="flex items-start gap-3"><LucideIcons.CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> <span>Mewujudkan tata kelola pemerintahan yang bersih dan responsif.</span></li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-[0px_2px_10px_#0000000a] border border-[#c3c6d1]">
            <h3 className="text-xl font-bold text-[#001e40] mb-10 text-center">Struktur Organisasi — Pergub Jatim No. 73 Tahun 2018</h3>
            <div className="relative w-full overflow-x-auto">
              <svg viewBox="0 0 720 380" className="w-full max-w-3xl mx-auto" style={{ minWidth: "320px" }}>
                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000022" />
                  </filter>
                </defs>
                <line x1="260" y1="85" x2="260" y2="155" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="260" y1="155" x2="450" y2="155" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="450" y1="140" x2="450" y2="155" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="260" y1="155" x2="260" y2="220" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="100" y1="220" x2="420" y2="220" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="100" y1="220" x2="100" y2="265" stroke="#6b21a8" strokeWidth="2.5" />
                <line x1="420" y1="220" x2="420" y2="265" stroke="#6b21a8" strokeWidth="2.5" />
                <rect x="60" y="6" width="400" height="80" rx="12" fill="url(#kepalaGrad)" filter="url(#shadow)" />
                <defs>
                  <linearGradient id="kepalaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#001e40" />
                    <stop offset="100%" stopColor="#003a7a" />
                  </linearGradient>
                  <linearGradient id="tuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6b21a8" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                  <linearGradient id="seksi1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="seksi2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0369a1" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <text x="260" y="30" textAnchor="middle" fill="#bfdbfe" fontSize="9" fontWeight="700" letterSpacing="2">PIMPINAN</text>
                <text x="260" y="50" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" letterSpacing="0.5">CABANG DINAS KELAUTAN</text>
                <text x="260" y="66" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">DAN PERIKANAN</text>
                <text x="260" y="82" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">KABUPATEN MALANG</text>
                <rect x="450" y="105" width="240" height="75" rx="12" fill="url(#tuGrad)" filter="url(#shadow)" />
                <text x="570" y="128" textAnchor="middle" fill="#e9d5ff" fontSize="9" fontWeight="700" letterSpacing="2">ADMINISTRASI</text>
                <text x="570" y="148" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">SUB BAGIAN</text>
                <text x="570" y="165" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">TATA USAHA</text>
                <rect x="15" y="265" width="175" height="80" rx="12" fill="url(#seksi1Grad)" filter="url(#shadow)" />
                <text x="102" y="288" textAnchor="middle" fill="#ccfbf1" fontSize="9" fontWeight="700" letterSpacing="2">BIDANG</text>
                <text x="102" y="307" textAnchor="middle" fill="white" fontSize="12" fontWeight="800">SEKSI KONSERVASI</text>
                <text x="102" y="323" textAnchor="middle" fill="white" fontSize="12" fontWeight="800">KELAUTAN</text>
                <rect x="333" y="265" width="175" height="80" rx="12" fill="url(#seksi2Grad)" filter="url(#shadow)" />
                <text x="420" y="288" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontWeight="700" letterSpacing="2">BIDANG</text>
                <text x="420" y="307" textAnchor="middle" fill="white" fontSize="12" fontWeight="800">SEKSI VERIFIKASI</text>
                <text x="420" y="323" textAnchor="middle" fill="white" fontSize="12" fontWeight="800">DAN PERIZINAN</text>
              </svg>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-[#5f5e5e]">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#001e40]"></div> Kepala Cabang Dinas</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#9333ea]"></div> Sub Bagian Tata Usaha</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0f766e]"></div> Seksi Konservasi Kelautan</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0369a1]"></div> Seksi Verifikasi dan Perizinan</div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-blue-950 px-6 lg:px-10 py-10 w-full">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:justify-between max-w-[1280px] mx-auto">
          <section className="flex flex-col items-start gap-3 md:max-w-xs">
            <h2 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 text-white">
              PUTIK CEMERLANG
            </h2>
            <p className="[font-family:'Inter',Helvetica] text-sm font-normal leading-[22px] text-slate-300 text-justify">
              Pusat Informasi Kelautan Cabang Dinas Kelautan dan Perikanan Malang yang menyediakan data dan informasi kelautan untuk mendukung pelayanan publik, memudahkan akses informasi bagi masyarakat dan pemangku kepentingan secara cepat, akurat, dan informatif.
            </p>
            <div className="flex gap-4 mt-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <LucideIcons.Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <LucideIcons.Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <LucideIcons.Phone className="w-5 h-5" />
              </div>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-white font-bold text-[0.875rem] uppercase">Tautan Penting</h5>
              <ul className="space-y-2">
                <li><Link href="/"><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline">Beranda</a></Link></li>
                <li><Link href="/buku-tamu"><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline">Buku Tamu</a></Link></li>
                <li><Link href="/profile"><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline">Profile</a></Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="text-white font-bold text-[0.875rem] uppercase">Legalitas</h5>
              <ul className="space-y-2">
                <li><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline" href="#">Kebijakan Privasi</a></li>
                <li><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline" href="#">Syarat &amp; Ketentuan</a></li>
                <li><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline" href="#">Peta Situs</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-[#ffffff1a] pt-6 mt-8 max-w-[1280px] mx-auto">
          <p className="[font-family:'Inter',Helvetica] text-xs md:text-sm font-normal text-slate-400">
            &copy; 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
