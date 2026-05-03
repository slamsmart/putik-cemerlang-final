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

const statusStyle: Record<string, string> = {
  "Belum Dibalas": "bg-[#fef9c3] text-[#a16207]",
  "Sudah Dibalas": "bg-green-100 text-green-700",
  "Diarsipkan": "bg-slate-100 text-slate-600",
};

export default function StatistikLayananPage() {
  const { toast } = useToast();
  const rawData = useConvexQuery(api.guestbook.list) || [];
  const [timeRange, setTimeRange] = useState("30");

  // Chart data calculation
  const chartData = useMemo(() => {
    // Basic formatting for chart - assuming data format "DD Bulan YYYY HH:mm"
    // Since we don't have real Date objects in DB easily parsing them all, 
    // let's just group by the date string portion (e.g., "05 Mei 2026").
    const dateCounts: Record<string, number> = {};
    
    rawData.forEach(item => {
      // Get just the date part, ignore time if any
      const dateStr = (item.tanggal || "").split(" ").slice(0, 3).join(" ");
      if (dateStr) {
        dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
      }
    });

    // Convert to array
    const sortedData = Object.keys(dateCounts).map(date => ({
      name: date,
      Kunjungan: dateCounts[date]
    }));

    // If we have no data, provide a nice empty chart
    if (sortedData.length === 0) {
      return [
        { name: "Min 5", Kunjungan: 0 },
        { name: "Sel 7", Kunjungan: 0 },
        { name: "Kam 9", Kunjungan: 0 },
        { name: "Sab 11", Kunjungan: 0 },
      ];
    }

    return sortedData;
  }, [rawData]);

  const handleExportPDF = () => {
    if (rawData.length === 0) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    doc.text("Laporan Statistik Layanan Tamu", 14, 15);
    const tableColumn = ["No", "Nama Pengunjung", "Instansi / Pekerjaan", "Tanggal", "Status Layanan"];
    const tableRows: any[] = [];
    
    rawData.forEach((item, index) => {
      const row = [
        index + 1,
        item.nama,
        item.pekerjaan || "-",
        item.tanggal,
        item.status
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 30, 64] }
    });

    doc.save(`Statistik_Layanan_Tamu.pdf`);
    toast({ title: "PDF berhasil diekspor" });
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
        {/* Chart Section */}
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

        {/* Table Section */}
        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#001e40]">Nama Pengunjung</th>
                  <th className="px-6 py-4 font-semibold text-[#001e40]">Instansi / Pekerjaan</th>
                  <th className="px-6 py-4 font-semibold text-[#001e40]">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-[#001e40]">Status Layanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rawData.length > 0 ? (
                  rawData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#1e293b]">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.pekerjaan || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={`rounded-full font-medium shadow-none hover:bg-opacity-80 ${statusStyle[item.status] || "bg-slate-100"}`}
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Belum ada data kunjungan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
