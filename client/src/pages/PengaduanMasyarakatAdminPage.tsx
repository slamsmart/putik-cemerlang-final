import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PengaduanItem {
  _id: string;
  nama: string;
  email: string;
  telepon: string;
  judul: string;
  isi: string;
  lokasi?: string;
  imageUrl?: string;
  status: "Baru" | "Diproses" | "Selesai";
  createdAt: number;
}

const statusStyle: Record<string, string> = {
  Baru: "bg-amber-100 text-amber-800",
  Diproses: "bg-blue-100 text-blue-800",
  Selesai: "bg-green-100 text-green-700",
};

function formatTanggal(ts: number) {
  try {
    return new Date(ts).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "-"; }
}

export default function PengaduanMasyarakatAdminPage() {
  const { toast } = useToast();
  const [viewItem, setViewItem] = useState<PengaduanItem | null>(null);

  const { data: list = [], isLoading } = useQuery<PengaduanItem[]>({
    queryKey: ["/api/pengaduan-masyarakat"],
    refetchInterval: 10000,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/pengaduan-masyarakat/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pengaduan-masyarakat"] });
      toast({ title: "Status diperbarui" });
    },
    onError: () => toast({ title: "Gagal memperbarui status", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/pengaduan-masyarakat/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pengaduan-masyarakat"] });
      toast({ title: "Pengaduan dihapus" });
    },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const handleDelete = (id: string) => {
    if (!confirm("Hapus pengaduan ini?")) return;
    removeMut.mutate(id);
  };

  const baruCount = list.filter((a) => a.status === "Baru").length;
  const diprosesCount = list.filter((a) => a.status === "Diproses").length;
  const selesaiCount = list.filter((a) => a.status === "Selesai").length;

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">Data Pengaduan Masyarakat</h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">Kelola laporan pengaduan yang masuk dari masyarakat.</p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Total Pengaduan", value: list.length, color: "text-[#001e40]" },
          { label: "Baru", value: baruCount, color: "text-amber-600" },
          { label: "Diproses", value: diprosesCount, color: "text-blue-700" },
          { label: "Selesai", value: selesaiCount, color: "text-green-700" },
        ].map((s, i) => (
          <Card key={i} className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${s.color} [font-family:'Public_Sans',Helvetica]`}>{s.value}</div>
              <div className="mt-0.5 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Nama", "Judul", "Kontak", "Tanggal", "Status", "Aksi"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 pr-4 text-sm text-[#191c1e] whitespace-nowrap">{item.nama}</td>
                    <td className="max-w-[240px] py-3 pr-4">
                      <p className="line-clamp-2 text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">{item.judul}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#5f5e5e] whitespace-nowrap">{item.email || item.telepon || "-"}</td>
                    <td className="py-3 pr-4 text-xs text-[#5f5e5e] whitespace-nowrap">{formatTanggal(item.createdAt)}</td>
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
            {!isLoading && list.length === 0 && <div className="py-10 text-center text-sm text-slate-400">Belum ada pengaduan.</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#001e40]">Detail Pengaduan</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="flex flex-col gap-3 py-2 text-sm">
              {[
                { label: "Nama", val: viewItem.nama },
                { label: "Email", val: viewItem.email || "-" },
                { label: "Telepon", val: viewItem.telepon || "-" },
                { label: "Judul", val: viewItem.judul },
                { label: "Lokasi", val: viewItem.lokasi || "-" },
                { label: "Tanggal", val: formatTanggal(viewItem.createdAt) },
                { label: "Status", val: viewItem.status },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <span className="w-32 shrink-0 text-xs text-[#5f5e5e]">{row.label}</span>
                  <span className="font-medium text-[#191c1e]">{row.val}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <span className="w-32 shrink-0 text-xs text-[#5f5e5e]">Uraian</span>
                <span className="font-medium text-[#191c1e]">{viewItem.isi}</span>
              </div>
              {viewItem.imageUrl && (
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 text-xs text-[#5f5e5e]">Lampiran</span>
                  <a href={viewItem.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#3a5f94] underline">Lihat Gambar</a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
