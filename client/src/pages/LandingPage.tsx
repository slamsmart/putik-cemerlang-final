import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion } from "framer-motion";
import { HeroSlider } from "@/components/HeroSlider";
import PublicNavbar from "@/components/PublicNavbar";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import { TrendingUp } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";
import type { Stat } from "@shared/schema";

const fallbackStats: Stat[] = [
  { id: "stat-1", icon: "Anchor", value: "350+", label: "Nelayan Terdaftar", highlight: false, displayOrder: 0, isActive: true, linkUrl: "#" },
  { id: "stat-2", icon: "Fish", value: "3", label: "Pembudidaya Ikan", highlight: false, displayOrder: 1, isActive: true, linkUrl: "#" },
  { id: "stat-3", icon: "Ship", value: "928", label: "Unit Perikanan", highlight: false, displayOrder: 2, isActive: true, linkUrl: "#" },
  { id: "stat-4", icon: "Sailboat", value: "142", label: "Kapal Terverifikasi", highlight: false, displayOrder: 3, isActive: true, linkUrl: "#" },
  { id: "stat-5", icon: "ShieldCheck", value: "19", label: "Pokmaswas Aktif", highlight: false, displayOrder: 4, isActive: true, linkUrl: "#" },
  { id: "stat-6", icon: "TreePine", value: "5.7", label: "Luas Mangrove (Ha)", highlight: false, displayOrder: 5, isActive: true, linkUrl: "#" },
  { id: "stat-7", icon: "Waves", value: "2.3", label: "Terumbu Karang (Ha)", highlight: false, displayOrder: 6, isActive: true, linkUrl: "#" },
  { id: "stat-8", icon: "MapPin", value: "25", label: "Titik Penyu", highlight: false, displayOrder: 7, isActive: true, linkUrl: "#" },
  { id: "stat-9", icon: "Users", value: "785", label: "Masyarakat Terlayani", highlight: false, displayOrder: 8, isActive: true, linkUrl: "#" },
  { id: "stat-10", icon: "TrendingUp", value: "95.12%", label: "Survey Kepuasan", highlight: true, displayOrder: 9, isActive: true, linkUrl: "#" },
];

const statusStyle: Record<string, string> = {
  "Belum Dibalas": "bg-[#fef9c3] text-[#a16207]",
  "Sudah Dibalas": "bg-green-100 text-green-700",
  "Diarsipkan": "bg-slate-100 text-slate-600",
};

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const apiStats = useConvexQuery(api.stats.list);
  const guestbookData = useConvexQuery(api.guestbook.list) || [];
  const stats = (apiStats && apiStats.length > 0 ? apiStats : fallbackStats).filter((s) => s.isActive);
  const dataUpdateText = useConvexQuery(api.settings.get, { key: "data_update_text" }) || "DATA UPDATE: DESEMBER 2023";
  
  const [timeRange, setTimeRange] = useState("30");

  const chartData = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    guestbookData.forEach(item => {
      const dateStr = (item.tanggal || "").split(" ").slice(0, 3).join(" ");
      if (dateStr) {
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    const sortedData = Object.keys(dateCounts).map(date => ({
      name: date,
      Kunjungan: dateCounts[date]
    }));

    if (sortedData.length === 0) {
      return [
        { name: "Min 5", Kunjungan: 0 },
        { name: "Sel 7", Kunjungan: 0 },
        { name: "Kam 9", Kunjungan: 0 },
        { name: "Sab 11", Kunjungan: 0 },
      ];
    }
    return sortedData;
  }, [guestbookData]);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-['Inter',Helvetica] min-h-screen">
      {/* ── Navigation ───────────────────────────────────── */}
      <PublicNavbar />

      <main>
        {/* ── Hero Slider (Retained Function) ───────────────────────────────────── */}
        <div className="pt-20">
          <HeroSlider />
        </div>


        {/* ── Capaian & Jangkauan Layanan (Dynamic Convex Stats) ──────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div className="space-y-2">
                <h2 className="font-['Public_Sans',Helvetica] text-[#001e40] uppercase text-sm tracking-widest font-bold">Capaian &amp; Jangkauan Layanan</h2>
                <p className="text-[#5f5e5e] text-base max-w-2xl">Data terkini mengenai infrastruktur, sumber daya manusia, dan konservasi maritim di wilayah Kabupaten Malang.</p>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-lg text-slate-600 text-xs font-bold uppercase tracking-wider">
                <LucideIcons.Calendar className="w-4 h-4 mr-2" />
                {dataUpdateText}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {stats.map((s, i) => {
                const Icon = (LucideIcons as any)[s.icon] || LucideIcons.Circle;
                if (s.highlight) {
                  return (
                    <div key={(s as any)._id || (s as any).id || s.label} className="h-full">
                      <a href={s.linkUrl || "#"} target={s.linkUrl && s.linkUrl !== "#" ? "_blank" : "_self"} rel="noopener noreferrer" className="block h-full cursor-pointer transition-transform hover:-translate-y-1">
                        <div className="bg-[#001e40] p-6 rounded-xl shadow-lg shadow-[#001e40]/20 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,191,255,0.8)]">
                          <div className="w-10 h-10 bg-white/10 text-white rounded-lg flex items-center justify-center mb-4">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-['Public_Sans',Helvetica] text-[1.75rem] font-semibold leading-[1.3] text-white">{s.value}</div>
                            <div className="text-xs font-bold text-blue-200 uppercase tracking-tight mt-1">{s.label}</div>
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                }

                return (
                  <div key={(s as any)._id || (s as any).id || s.label} className="h-full">
                    <a href={s.linkUrl || "#"} target={s.linkUrl && s.linkUrl !== "#" ? "_blank" : "_self"} rel="noopener noreferrer" className="block h-full cursor-pointer transition-transform hover:-translate-y-1">
                      <div className="bg-white border border-[#c3c6d1] p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,191,255,0.8)] hover:border-[#00bfff]/50 h-full">
                        <div className="w-10 h-10 bg-[#d5e3ff]/30 text-[#001e40] rounded-lg flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="font-['Public_Sans',Helvetica] text-[1.75rem] font-semibold leading-[1.3] text-[#001e40]">{s.value}</div>
                        <div className="text-xs font-bold text-[#5f5e5e] uppercase tracking-tight mt-1">{s.label}</div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Buku Tamu Stats Section (Recharts & Table) ───────────────────────────────────── */}
        <section className="py-20 bg-[#f2f4f6] overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-[#d5e3ff] rounded-full mb-3">
                  <span className="text-[#001e40] text-xs font-medium tracking-widest font-bold">LIVE DATA</span>
                </div>
                <h2 className="font-['Public_Sans',Helvetica] text-[2.5rem] font-bold leading-tight text-[#001e40]">Statistik Layanan Tamu</h2>
                <p className="text-[#5f5e5e] text-lg max-w-3xl mt-2">Daftar kunjungan terbaru yang terintegrasi secara real-time dengan sistem administrasi terpadu.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {/* Chart Section */}
              <div className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm p-6">
                <div className="flex flex-row items-center justify-between pb-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-[#001e40]">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Tren Kunjungan
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Menampilkan {timeRange} hari terakhir
                    </p>
                  </div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] text-sm">
                      <SelectValue placeholder="Pilih rentang waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 hari terakhir</SelectItem>
                      <SelectItem value="30">30 hari terakhir</SelectItem>
                      <SelectItem value="90">90 hari terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorKunjunganPub" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Kunjungan" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorKunjunganPub)" 
                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t border-white/10 relative overflow-hidden">
        {/* Submerged Wave Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,1000 C300,800 400,1000 1000,800 L1000,1000 L0,1000 Z" fill="white"></path>
          </svg>
        </div>
        <div className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-start max-w-[1280px] mx-auto gap-8 relative z-10">
          <div className="max-w-md">
            <div className="text-white font-bold text-lg mb-4">Putik Cemerlang</div>
            <p className="font-['Public_Sans',Helvetica] text-sm leading-relaxed text-slate-300 mb-6 text-justify">
              Pusat Informasi Kelautan Cabang Dinas Kelautan dan Perikanan Malang yang menyediakan data dan informasi kelautan untuk mendukung pelayanan publik, memudahkan akses informasi bagi masyarakat dan pemangku kepentingan secara cepat, akurat, dan informatif.
            </p>
            <div className="flex gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-white font-bold text-[0.875rem] uppercase">Tautan Penting</h5>
              <ul className="space-y-2">
                <li><a className="font-['Public_Sans',Helvetica] text-sm text-slate-300 hover:text-white transition-all hover:underline" href="#">Beranda</a></li>
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
        <div className="max-w-[1280px] mx-auto px-6 py-6 border-t border-white/10 relative z-10">
          <p className="font-['Public_Sans',Helvetica] text-sm text-slate-400 text-center md:text-left">
            © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>

      {/* ── Floating Live Chat Widget ───────────────────────────────────────── */}
      <LiveChatWidget />
    </div>
  );
}
