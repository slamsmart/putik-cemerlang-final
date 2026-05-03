import { useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Jenis = "Masuk" | "Keluar";
type Status = "Terarsip" | "Terkirim" | "Belum Dibaca";

interface ArsipItem {
  _id: string;
  nomor: string;
  perihal: string;
  pengirimTujuan: string;
  tanggal: string;
  jenis: Jenis;
  status: Status;
  pdfUrl?: string;
  createdAt: number;
}

const statusStyle: Record<string, string> = {
  Terarsip: "bg-green-100 text-green-700",
  Terkirim: "bg-blue-100 text-blue-800",
  "Belum Dibaca": "bg-amber-100 text-amber-800",
};

const jenisStyle: Record<string, string> = {
  Masuk: "bg-slate-100 text-slate-700",
  Keluar: "bg-purple-100 text-purple-800",
};

function formatTanggal(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

const defaultForm = {
  nomor: "", perihal: "", pengirimTujuan: "",
  tanggal: new Date().toISOString().slice(0, 10),
  jenis: "Masuk" as Jenis, status: "Belum Dibaca" as Status, pdfUrl: "",
};

export default function ArsipSuratPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [showDialog, setShowDialog] = useState(false);
  const [viewItem, setViewItem] = useState<ArsipItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: arsipList = [], isLoading } = useQuery<ArsipItem[]>({
    queryKey: ["/api/arsip-surat"],
    refetchInterval: 10000,
  });

  const createMut = useMutation({
    mutationFn: (body: typeof defaultForm) => apiRequest("POST", "/api/arsip-surat", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Surat berhasil ditambahkan" });
      setShowDialog(false);
      setForm(defaultForm);
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/arsip-surat/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Surat dihapus dari arsip" });
    },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-pdf", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm((f) => ({ ...f, pdfUrl: data.url }));
      if (data.note) toast({ title: "Info", description: data.note });
      else toast({ title: "File berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!form.nomor || !form.perihal || !form.pengirimTujuan) {
      toast({ title: "Lengkapi semua field wajib", variant: "destructive" });
      return;
    }
    createMut.mutate(form);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus surat ini dari arsip?")) return;
    removeMut.mutate(id);
  };

  const filtered = arsipList.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nomor.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      item.pengirimTujuan.toLowerCase().includes(q);
    const matchJenis = filterJenis === "Semua" || item.jenis === filterJenis;
    const d = new Date(item.tanggal);
    const matchBulan = filterBulan === "Semua" || (d.getMonth() + 1).toString() === filterBulan;
    const matchTahun = filterTahun === "Semua" || d.getFullYear().toString() === filterTahun;
    return matchSearch && matchJenis && matchBulan && matchTahun;
  });

  const handleExportZip = async () => {
    if (filtered.length === 0) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }
    const zip = new JSZip();
    const folderName = `Arsip_Surat_${filterBulan !== "Semua" ? `${filterBulan}_${filterTahun}` : filterTahun !== "Semua" ? filterTahun : "Semua"}`;
    const folder = zip.folder(folderName);
    if (!folder) return;

    let csv = "Nomor Surat,Perihal,Pengirim/Tujuan,Tanggal,Jenis,Status,PDF_URL\n";
    for (const item of filtered) {
      csv += `"${item.nomor}","${item.perihal}","${item.pengirimTujuan}","${formatTanggal(item.tanggal)}","${item.jenis}","${item.status}","${item.pdfUrl || ""}"\n`;
      if (item.pdfUrl) {
        try {
          const res = await fetch(item.pdfUrl);
          if (res.ok) {
            const blob = await res.blob();
            const ext = item.pdfUrl.split("?")[0].split(".").pop() || "pdf";
            const safeName = item.nomor.replace(/[^a-zA-Z0-9]/g, "_");
            folder.file(`${safeName}.${ext}`, blob);
          } else {
            folder.file(`${item.nomor.replace(/[^a-zA-Z0-9]/g, "_")}_link.txt`, item.pdfUrl);
          }
        } catch {
          folder.file(`${item.nomor.replace(/[^a-zA-Z0-9]/g, "_")}_link.txt`, item.pdfUrl);
        }
      }
    }
    folder.file("index.csv", csv);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName}.zip`);
    toast({ title: `ZIP berhasil diekspor (${filtered.length} surat)` });
  };

  const masukCount = arsipList.filter((a) => a.jenis === "Masuk").length;
  const keluarCount = arsipList.filter((a) => a.jenis === "Keluar").length;
  const belumDibaca = arsipList.filter((a) => a.status === "Belum Dibaca").length;

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">Arsip Surat</h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola dan arsipkan surat masuk dan surat keluar Dinas Kelautan &amp; Perikanan Kabupaten Malang.
          </p>
        </div>
        <Button
          data-testid="button-tambah-surat"
          onClick={() => { setForm(defaultForm); setShowDialog(true); }}
          className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
        >
          + Tambah Surat
        </Button>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Total Surat", value: arsipList.length, color: "text-[#001e40]" },
          { label: "Surat Masuk", value: masukCount, color: "text-slate-700" },
          { label: "Surat Keluar", value: keluarCount, color: "text-purple-700" },
          { label: "Belum Dibaca", value: belumDibaca, color: "text-amber-600" },
        ].map((s, i) => (
          <Card key={i} data-testid={`card-stat-arsip-${i}`} className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${s.color} [font-family:'Public_Sans',Helvetica]`}>{s.value}</div>
              <div className="mt-0.5 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Input
              data-testid="input-search-arsip"
              placeholder="Cari nomor surat, perihal, atau pengirim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
            />
            <div className="flex gap-2">
              {["Semua", "Masuk", "Keluar"].map((f) => (
                <button
                  key={f}
                  data-testid={`filter-jenis-${f.toLowerCase()}`}
                  onClick={() => setFilterJenis(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    filterJenis === f ? "bg-[#001e40] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterBulan} onValueChange={setFilterBulan}>
                <SelectTrigger className="w-[140px] rounded-md border-slate-200 text-xs"><SelectValue placeholder="Bulan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Bulan</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger className="w-[120px] rounded-md border-slate-200 text-xs"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Tahun</SelectItem>
                  {[2023, 2024, 2025].map((t) => (
                    <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="button-export-zip"
              variant="outline"
              size="sm"
              onClick={handleExportZip}
              className="ml-auto rounded-md border-slate-200 text-xs text-[#001e40] hover:bg-slate-50"
            >
              Export ZIP
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["No. Surat", "Perihal", "Pengirim/Tujuan", "Tanggal", "Jenis", "Status", "Aksi"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((item) => (
                    <motion.tr
                      key={item._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      data-testid={`row-arsip-${item._id}`}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 pr-4 text-xs font-mono text-[#3a5f94] whitespace-nowrap">{item.nomor}</td>
                      <td className="max-w-[200px] py-3 pr-4">
                        <p className="line-clamp-2 text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">{item.perihal}</p>
                      </td>
                      <td className="max-w-[180px] py-3 pr-4">
                        <p className="line-clamp-2 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">{item.pengirimTujuan}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-[#5f5e5e] whitespace-nowrap [font-family:'Inter',Helvetica]">
                        {formatTanggal(item.tanggal)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-normal hover:opacity-80 ${jenisStyle[item.jenis]}`}>{item.jenis}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-normal hover:opacity-80 ${statusStyle[item.status]}`}>{item.status}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            data-testid={`button-lihat-${item._id}`}
                            onClick={() => setViewItem(item)}
                            className="text-xs font-medium text-[#3a5f94] hover:underline [font-family:'Inter',Helvetica]"
                          >
                            Lihat
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            data-testid={`button-hapus-arsip-${item._id}`}
                            onClick={() => handleDelete(item._id)}
                            className="text-xs font-medium text-[#ba1a1a] hover:underline [font-family:'Inter',Helvetica]"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {isLoading && (
              <div className="py-10 text-center text-sm text-slate-400">Memuat data…</div>
            )}
            {!isLoading && arsipList.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">Belum ada surat diarsipkan.</div>
            )}
            {!isLoading && arsipList.length > 0 && filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">Tidak ada data yang sesuai pencarian.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Tambah Surat Dialog ──────────────────────────────────────── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#001e40]">Tambah Arsip Surat</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Isi detail surat dan opsional unggah scan dokumen PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5f5e5e]">Nomor Surat *</label>
              <Input data-testid="input-nomor-surat" value={form.nomor} onChange={(e) => setForm((f) => ({ ...f, nomor: e.target.value }))} placeholder="001/KKP/V/2024" className="border-slate-200 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5f5e5e]">Perihal *</label>
              <Input data-testid="input-perihal" value={form.perihal} onChange={(e) => setForm((f) => ({ ...f, perihal: e.target.value }))} placeholder="Perihal surat" className="border-slate-200 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5f5e5e]">Pengirim / Tujuan *</label>
              <Input data-testid="input-pengirim" value={form.pengirimTujuan} onChange={(e) => setForm((f) => ({ ...f, pengirimTujuan: e.target.value }))} placeholder="Nama instansi / pengirim" className="border-slate-200 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e]">Tanggal</label>
                <Input data-testid="input-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} className="border-slate-200 text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e]">Jenis Surat</label>
                <Select value={form.jenis} onValueChange={(v) => setForm((f) => ({ ...f, jenis: v as Jenis }))}>
                  <SelectTrigger data-testid="select-jenis" className="border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masuk">Masuk</SelectItem>
                    <SelectItem value="Keluar">Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5f5e5e]">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}>
                <SelectTrigger data-testid="select-status" className="border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Dibaca">Belum Dibaca</SelectItem>
                  <SelectItem value="Terarsip">Terarsip</SelectItem>
                  <SelectItem value="Terkirim">Terkirim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#5f5e5e]">Upload Scan Surat (PDF/Gambar, maks. 20 MB)</label>
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleUploadPdf} />
              <div className="flex items-center gap-3">
                <Button data-testid="button-upload-pdf" type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-slate-200 text-xs">
                  {uploading ? "Mengunggah…" : "Pilih File"}
                </Button>
                {form.pdfUrl
                  ? <a href={form.pdfUrl} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-[#3a5f94] underline">File terunggah ✓</a>
                  : <span className="text-xs text-slate-400">Opsional</span>
                }
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDialog(false)} className="text-sm">Batal</Button>
            <Button data-testid="button-simpan-surat" onClick={handleSubmit} disabled={createMut.isPending} className="bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90">
              {createMut.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Surat Dialog ──────────────────────────────────────── */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#001e40]">Detail Surat</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Informasi lengkap surat yang diarsipkan.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="flex flex-col gap-3 py-2 text-sm">
              {[
                { label: "Nomor Surat", val: viewItem.nomor },
                { label: "Perihal", val: viewItem.perihal },
                { label: "Pengirim / Tujuan", val: viewItem.pengirimTujuan },
                { label: "Tanggal", val: formatTanggal(viewItem.tanggal) },
                { label: "Jenis", val: viewItem.jenis },
                { label: "Status", val: viewItem.status },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <span className="w-40 shrink-0 text-xs text-[#5f5e5e]">{row.label}</span>
                  <span className="font-medium text-[#191c1e]">{row.val}</span>
                </div>
              ))}
              {viewItem.pdfUrl && (
                <div className="flex gap-2">
                  <span className="w-40 shrink-0 text-xs text-[#5f5e5e]">Dokumen Scan</span>
                  <a href={viewItem.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#3a5f94] underline">Buka Dokumen</a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewItem(null)} className="bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
