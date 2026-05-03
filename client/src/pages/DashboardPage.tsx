import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const statsCards = [
  { label: "Total Pengunjung", value: "24,381", change: "+12% bulan ini", icon: "👥", color: "bg-blue-50 text-blue-900" },
  { label: "Buku Tamu Masuk", value: "142", change: "+8 hari ini", icon: "📖", color: "bg-green-50 text-green-800" },
  { label: "Surat Diarsipkan", value: "1,024", change: "+3 minggu ini", icon: "📄", color: "bg-amber-50 text-amber-800" },
  { label: "Slider Aktif", value: "3", change: "Dari 5 banner", icon: "🖼️", color: "bg-purple-50 text-purple-800" },
];

const recentActivities = [
  { type: "Buku Tamu", desc: "Entri baru dari Bapak Supriyadi - Nelayan Sendangbiru", time: "5 menit lalu", status: "Baru" },
  { type: "Arsip Surat", desc: "Surat masuk No. 035/KKP/2024 telah diarsipkan", time: "1 jam lalu", status: "Diarsipkan" },
  { type: "Konten", desc: "Banner slider 'Modernisasi Perikanan' diperbarui", time: "2 jam lalu", status: "Diperbarui" },
  { type: "Buku Tamu", desc: "Entri baru dari Ibu Rahayu - Pelaku UMKM Ikan", time: "3 jam lalu", status: "Baru" },
  { type: "Arsip Surat", desc: "Surat keluar No. 022/DKP/2024 diterbitkan", time: "Kemarin", status: "Diterbitkan" },
];

const quickLinks = [
  { label: "Kelola Buku Tamu", href: "/admin/buku-tamu", icon: "/figmaAssets/container-3.svg" },
  { label: "Arsip Surat", href: "/admin/arsip-surat", icon: "/figmaAssets/container-4.svg" },
  { label: "Konten & Slider", href: "/admin/konten-slider", icon: "/figmaAssets/container-2.svg" },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: "/figmaAssets/container-8.svg" },
];

const statusColor: Record<string, string> = {
  Baru: "bg-blue-100 text-blue-800",
  Diarsipkan: "bg-slate-100 text-slate-700",
  Diperbarui: "bg-green-100 text-green-700",
  Diterbitkan: "bg-amber-100 text-amber-800",
};

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Dashboard
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Selamat datang kembali. Berikut ringkasan aktivitas portal Putik Cemerlang.
          </p>
        </div>
        <Button
          data-testid="button-lihat-portal"
          variant="outline"
          onClick={() => setLocation("/")}
          className="rounded-lg border-[#c3c6d1] text-[#001e40] hover:bg-slate-50"
        >
          Lihat Portal Publik
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((s, i) => (
          <Card
            key={i}
            data-testid={`card-stat-${i}`}
            className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]"
          >
            <CardContent className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                  {s.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Recent Activity */}
        <Card className="col-span-8 rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
              Aktivitas Terbaru
            </h2>
            <div className="flex flex-col divide-y divide-slate-100">
              {recentActivities.map((act, i) => (
                <div
                  key={i}
                  data-testid={`row-activity-${i}`}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-[#3a5f94] [font-family:'Inter',Helvetica]">
                      {act.type}
                    </span>
                    <span className="text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">
                      {act.desc}
                    </span>
                    <span className="text-xs text-slate-400">{act.time}</span>
                  </div>
                  <Badge
                    className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-normal hover:opacity-80 ${statusColor[act.status]}`}
                  >
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="col-span-4 flex flex-col gap-6">
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-6">
              <h2 className="mb-4 text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Akses Cepat
              </h2>
              <div className="flex flex-col gap-2">
                {quickLinks.map((ql) => (
                  <button
                    key={ql.label}
                    data-testid={`link-quicklink-${ql.label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setLocation(ql.href)}
                    className="flex w-full items-center gap-3 rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                  >
                    <img src={ql.icon} alt="" aria-hidden="true" className="shrink-0" />
                    <span className="text-sm font-medium text-[#191c1e] [font-family:'Inter',Helvetica]">
                      {ql.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="rounded-xl border-0 bg-[#003366] shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <img src="/figmaAssets/icon.svg" alt="" className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="mb-1 text-sm font-bold text-white [font-family:'Inter',Helvetica]">
                    Info Sistem
                  </h3>
                  <p className="text-xs leading-relaxed text-[#799dd6]">
                    Sistem berjalan normal. Backup data terakhir: hari ini pukul 03:00 WIB.
                    Versi sistem: v2.4.1
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
