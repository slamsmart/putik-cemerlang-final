import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Download, TrendingUp } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

export default function StatistikPengunjungPage() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");
  const visitorStats = useConvexQuery(api.visitorStats.stats, { days: parseInt(timeRange, 10) });
  const quarterlyReport = useConvexQuery(api.visitorStats.quarterlyReport, { year: 2026 });

  const quarterChartData = useMemo(
    () =>
      quarterlyReport?.quarters.map((quarter) => ({
        name: quarter.quarter,
        Pengunjung: quarter.totalVisitors,
        Kumulatif: quarter.cumulative,
      })) ?? [],
    [quarterlyReport],
  );

  const ipRows = useMemo(
    () => quarterlyReport?.quarters.flatMap((quarter) =>
      quarter.ips.map((ip, index) => ({
        quarter: quarter.quarter,
        period: quarter.period,
        ip,
        number: index + 1,
      }))
    ) ?? [],
    [quarterlyReport],
  );

  const chartData = useMemo(() => {
    if (!visitorStats?.series || visitorStats.series.length === 0) {
      return [{ name: "Belum ada data", Kunjungan: 0 }];
    }
    return visitorStats.series.map((s) => {
      // Format label: "07 Mei 2026"
      const d = new Date(s.dateKey);
      const label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
      return { name: label, Kunjungan: s.unique, Pageviews: s.pageviews };
    });
  }, [visitorStats]);

  const handleExportPDF = () => {
    if (!quarterlyReport || quarterlyReport.quarters.length === 0) {
      toast({ title: "Data triwulan belum tersedia", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Statistik Pengunjung Per Triwulan", 14, 15);
    doc.setFontSize(9);
    doc.text(
      `Periode: Triwulan berjalan ${quarterlyReport.year} | Total pengunjung: ${quarterlyReport.totalVisitors.toLocaleString("id-ID")}`,
      14,
      22,
    );
    doc.text(`Dibuat: ${new Date().toLocaleString("id-ID")}`, 14, 28);

    const summaryRows = quarterlyReport.quarters.map((quarter) => [
      quarter.quarter,
      quarter.period,
      quarter.totalVisitors.toLocaleString("id-ID"),
      quarter.cumulative.toLocaleString("id-ID"),
    ]);
    summaryRows.push([
      "TOTAL",
      `Triwulan berjalan ${quarterlyReport.year}`,
      quarterlyReport.totalVisitors.toLocaleString("id-ID"),
      quarterlyReport.totalVisitors.toLocaleString("id-ID"),
    ]);
    autoTable(doc, {
      head: [["Periode", "Rentang Tanggal", "Jumlah Pengunjung", "Kumulatif"]],
      body: summaryRows,
      startY: 34,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 30, 64] },
    });

    const detailStartY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 60;
    autoTable(doc, {
      head: [["No", "Triwulan", "Periode", "IP Address (contoh)"]],
      body: ipRows.map((row, index) => [index + 1, row.quarter, row.period, row.ip]),
      startY: detailStartY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 30, 64] },
    });
    doc.setFontSize(8);
    doc.text("Catatan: IP menggunakan blok dokumentasi TEST-NET dan bukan data IP pengunjung produksi.", 14, 285);
    doc.save("Laporan_Statistik_Pengunjung_Triwulan_2026_SINTETIS.pdf");
    toast({ title: "PDF laporan triwulan berhasil diekspor" });
  };

  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge className="mb-3 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-200">
            LIVE DATA
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Statistik Layanan Tamu
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#5f5e5e] [font-family:'Inter',Helvetica] max-w-2xl">
            Daftar kunjungan terbaru yang terintegrasi secara real-time dengan sistem administrasi terpadu.
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          className="h-auto rounded-lg bg-[#001e40] px-6 py-2.5 shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica] text-sm text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        {/* Ringkasan Statistik Pengunjung */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: `Unik ${timeRange} Hari`, value: visitorStats?.totalUnique ?? 0, tone: "text-sky-700" },
            { label: "Unik Hari Ini", value: visitorStats?.todayUnique ?? 0, tone: "text-blue-700" },
            { label: "Total Pageview", value: visitorStats?.totalPageviews ?? 0, tone: "text-indigo-700" },
            { label: "Admin Unik", value: visitorStats?.adminUnique ?? 0, tone: "text-amber-700" },
          ].map((s) => (
            <Card key={s.label} className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
              <CardContent className="p-5">
                <div className={`text-2xl font-bold ${s.tone}`}>{s.value.toLocaleString()}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#001e40]">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Tren Kunjungan
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKunjungan" x1="0" y1="0" x2="0" y2="1">
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
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Kunjungan" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorKunjungan)" 
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#001e40]">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Tren Pengunjung Per Triwulan {quarterlyReport?.year ?? 2026}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Grafik kumulatif naik dari TW I sampai triwulan terakhir yang sudah berjalan.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mt-4 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKumulatif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Area
                    type="monotone"
                    dataKey="Kumulatif"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorKumulatif)"
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Pengunjung"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={0}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#001e40]">
              Rekap Pengunjung Per Triwulan 2026
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Rincian jumlah pengunjung TW I sampai TW III. Angka dan IP address adalah data sintetis
              untuk simulasi laporan, terpisah dari data tracking produksi.
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Triwulan</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Rentang Periode</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Jumlah Pengunjung</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Kumulatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quarterlyReport?.quarters.length ? (
                  quarterlyReport.quarters.map((quarter) => (
                    <tr key={quarter.quarter} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-[#001e40]">{quarter.quarter}</td>
                      <td className="px-4 py-3 text-slate-500">{quarter.period}</td>
                      <td className="px-4 py-3 font-bold text-sky-700">
                        {quarter.totalVisitors.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700">
                        {quarter.cumulative.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Data triwulan belum tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#001e40]">Rincian IP Address Per Triwulan</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Menggunakan blok dokumentasi TEST-NET (192.0.2.x, 198.51.100.x, 203.0.113.x), bukan IP
              pengunjung sebenarnya.
            </p>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">No</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Triwulan</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">Periode</th>
                  <th className="px-4 py-3 font-semibold text-[#001e40]">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipRows.length > 0 ? (
                  ipRows.map((row, index) => (
                    <tr key={`${row.quarter}-${row.ip}-${index}`} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2 text-slate-500">{index + 1}</td>
                      <td className="px-4 py-2 font-medium text-[#001e40]">{row.quarter}</td>
                      <td className="px-4 py-2 text-slate-500">{row.period}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{row.ip}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Belum ada rincian IP.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
