import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { ShieldCheck, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface GratifikasiItem {
  _id: string;
  nama: string;
  nip?: string;
  jabatan: string;
  unitKerja: string;
  telepon: string;
  email: string;
  tanggalPenerimaan: string;
  jenisGratifikasi: string;
  nilaiGratifikasi: string;
  pemberGratifikasi: string;
  hubunganPemberi: string;
  kronologi: string;
  imageUrl?: string;
  isAnonymous: boolean;
  status: "Baru" | "Diproses" | "Selesai";
  createdAt: number;
}

const statusStyle: Record<string, string> = {
  Baru: "bg-amber-100 text-amber-800",
  Diproses: "bg-blue-100 text-blue-800",
  Selesai: "bg-green-100 text-green-700",
};

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

function formatTanggal(ts: number) {
  try {
    return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "-"; }
}

export default function GratifikasiAdminPage() {
  const { toast } = useToast();
  const [viewItem, setViewItem] = useState<GratifikasiItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Semua");

  const { data: list = [], isLoading } = useQuery<GratifikasiItem[]>({
    queryKey: ["/api/pelaporan-gratifikasi"],
    refetchInterval: 10000,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/pelaporan-gratifikasi/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pelaporan-gratifikasi"] });
      toast({ title: "Status diperbarui" });
    },
    onError: () => toast({ title: "Gagal memperbarui status", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/pelaporan-gratifikasi/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pelaporan-gratifikasi"] });
      toast({ title: "Laporan dihapus" });
      setViewItem(null);
    },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const handleDelete = (id: string) => {
    if (!confirm("Hapus laporan gratifikasi ini?")) return;
    removeMut.mutate(id);
  };

  const baruCount = list.filter((a) => a.status === "Baru").length;
  const diprosesCount = list.filter((a) => a.status === "Diproses").length;
  const selesaiCount = list.filter((a) => a.status === "Selesai").length;

  // Chart: by jenis
  const jenisCounts: Record<string, number> = {};
  list.forEach((item) => {
    jenisCounts[item.jenisGratifikasi] = (jenisCounts[item.jenisGratifikasi] || 0) + 1;
  });
  const jenisChartData = Object.entries(jenisCounts)
    .map(([name, value]) => ({ name: name.replace(" / ", "/"), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Pie data for status
  const pieData = [
    { name: "Baru", value: baruCount },
    { name: "Diproses", value: diprosesCount },
    { name: "Selesai", value: selesaiCount },
  ].filter((d) => d.value > 0);

  // Filtered list
  const filteredList = filterStatus === "Semua" ? list : list.filter((item) => item.status === filterStatus);

  const summaryCards = [
    { label: "Total Laporan", value: list.length, color: "text-[#001e40]", bg: "bg-blue-50", icon: <ShieldCheck className="h-5 w-5 text-blue-600" /> },
    { label: "Baru", value: baruCount, color: "text-amber-600", bg: "bg-amber-50", icon: <Clock className="h-5 w-5 text-amber-500" /> },
    { label: "Diproses", value: diprosesCount, color: "text-blue-700", bg: "bg-blue-50", icon: <TrendingUp className="h-5 w-5 text-blue-600" /> },
    { label: "Selesai", value: selesaiCount, color: "text-green-700", bg: "bg-green-50", icon: <CheckCircle2 className="h-5 w-5 text-green-600" /> },
  ];

  return (
    <AdminLayout>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-[#003366]" />
            <h1 className="text-xl font-bold text-[#001e40] [font-family:'Public_Sans',Helvetica]">
              Laporan Gratifikasi
            </h1>
          </div>
          <p className="text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola laporan gratifikasi ASN sesuai standar Zona Integritas (ZI) — KPK RI.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Monitoring
        </div>
      </header>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s, i) => (
          <Card key={i} className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
              </div>
              <div className={`text-3xl font-bold ${s.color} [font-family:'Public_Sans',Helvetica]`}>{s.value}</div>
              <div className="mt-0.5 text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      {list.length > 0 && (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar Chart - Jenis */}
          <Card className="col-span-2 rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-[#001e40] mb-4">Laporan per Jenis Gratifikasi</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jenisChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="value" name="Laporan" radius={[4, 4, 0, 0]}>
                      {jenisChartData.map((_, idx) => (
                        <Cell key={idx} fill={["#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b"][idx % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Status */}
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-[#001e40] mb-4">Distribusi Status</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: 11, color: '#5f5e5e' }}>{val}</span>} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-[#001e40]">Daftar Laporan</h3>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-[130px] text-xs border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Status</SelectItem>
              <SelectItem value="Baru">Baru</SelectItem>
              <SelectItem value="Diproses">Diproses</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Pelapor", "Jenis Gratifikasi", "Pemberi", "Tgl. Terima", "Status", "Aksi"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-[#5f5e5e] [font-family:'Inter',Helvetica] whitespace-nowrap pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-[#191c1e] whitespace-nowrap">
                        {item.isAnonymous ? <span className="italic text-slate-500">Anonim</span> : item.nama}
                      </p>
                      <p className="text-xs text-[#5f5e5e]">{item.unitKerja}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#191c1e] whitespace-nowrap">{item.jenisGratifikasi}</td>
                    <td className="max-w-[160px] py-3 pr-4">
                      <p className="text-xs text-[#5f5e5e] line-clamp-2">{item.pemberGratifikasi}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#5f5e5e] whitespace-nowrap">{item.tanggalPenerimaan}</td>
                    <td className="py-3 pr-4">
                      <Select value={item.status} onValueChange={(v) => updateStatusMut.mutate({ id: item._id, status: v })}>
                        <SelectTrigger className="h-7 w-[110px] rounded-md border-slate-200 text-xs">
                          <Badge className={`rounded-full px-2 py-0 text-xs font-normal hover:opacity-80 ${statusStyle[item.status]}`}>{item.status}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baru">Baru</SelectItem>
                          <SelectItem value="Diproses">Diproses</SelectItem>
                          <SelectItem value="Selesai">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setViewItem(item)} className="text-xs font-medium text-[#3a5f94] hover:underline">Lihat</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleDelete(item._id)} className="text-xs font-medium text-[#ba1a1a] hover:underline">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <div className="py-10 text-center text-sm text-slate-400">Memuat data…</div>}
            {!isLoading && filteredList.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">
                {filterStatus === "Semua" ? "Belum ada laporan gratifikasi." : `Tidak ada laporan dengan status "${filterStatus}".`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#001e40]">
              <ShieldCheck className="h-4 w-4 text-[#003366]" />
              Detail Laporan Gratifikasi
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="flex flex-col gap-3 py-2 text-sm">
              {/* Section A */}
              <p className="text-xs font-bold uppercase tracking-wider text-[#003366] border-b pb-1">A. Data Pelapor</p>
              {[
                { label: "Nama", val: viewItem.isAnonymous ? "Anonim" : viewItem.nama },
                { label: "NIP", val: viewItem.nip || "-" },
                { label: "Jabatan", val: viewItem.jabatan },
                { label: "Unit Kerja", val: viewItem.unitKerja },
                { label: "Telepon", val: viewItem.telepon || "-" },
                { label: "Email", val: viewItem.email || "-" },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <span className="w-28 shrink-0 text-xs text-[#5f5e5e]">{row.label}</span>
                  <span className="font-medium text-[#191c1e]">{row.val}</span>
                </div>
              ))}
              {/* Section B */}
              <p className="text-xs font-bold uppercase tracking-wider text-[#003366] border-b pb-1 mt-2">B. Data Gratifikasi</p>
              {[
                { label: "Tgl. Terima", val: viewItem.tanggalPenerimaan },
                { label: "Jenis", val: viewItem.jenisGratifikasi },
                { label: "Nilai", val: viewItem.nilaiGratifikasi },
                { label: "Pemberi", val: viewItem.pemberGratifikasi },
                { label: "Hubungan", val: viewItem.hubunganPemberi },
                { label: "Status", val: viewItem.status },
                { label: "Dilaporkan", val: formatTanggal(viewItem.createdAt) },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <span className="w-28 shrink-0 text-xs text-[#5f5e5e]">{row.label}</span>
                  <span className="font-medium text-[#191c1e]">{row.val}</span>
                </div>
              ))}
              {/* Section C */}
              <p className="text-xs font-bold uppercase tracking-wider text-[#003366] border-b pb-1 mt-2">C. Kronologi</p>
              <p className="text-sm text-[#191c1e] leading-relaxed whitespace-pre-wrap">{viewItem.kronologi}</p>
              {viewItem.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-[#5f5e5e] mb-1">Bukti / Lampiran</p>
                  <a href={viewItem.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3a5f94] underline hover:text-[#001e40]">
                    Lihat Dokumen ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
