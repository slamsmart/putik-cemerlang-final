import { useRef, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { GripVertical, Plus } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  tanggalSurat?: string;
  jenis: Jenis;
  status: Status;
  pdfUrl?: string;
  customFields?: Record<string, string>;
  createdAt: number;
}

interface CustomColumn {
  _id: string;
  key: string;
  label: string;
  type: "text" | "number" | "date";
  displayOrder: number;
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
  tanggalSurat: "",
  jenis: "Masuk" as Jenis, status: "Terarsip" as Status, pdfUrl: "",
  customFields: {} as Record<string, string>,
};

const statusByJenis = (jenis: Jenis): Status => jenis === "Masuk" ? "Terarsip" : "Terkirim";

// ── Form field ordering ─────────────────────────────────────────────────────
// Setiap field (built-in + kustom) direpresentasikan sebagai FormFieldItem.
// Urutan disimpan di localStorage agar preferensi admin persisten.
interface FormFieldItem {
  id: string; // unique key: "builtin:nomor" atau "custom:indeks_surat"
  type: "builtin" | "custom";
  key: string; // field key
}

const BUILTIN_FIELDS: FormFieldItem[] = [
  { id: "builtin:nomor", type: "builtin", key: "nomor" },
  { id: "builtin:perihal", type: "builtin", key: "perihal" },
  { id: "builtin:pengirimTujuan", type: "builtin", key: "pengirimTujuan" },
  { id: "builtin:tanggalSurat", type: "builtin", key: "tanggalSurat" },
  { id: "builtin:tanggal_jenis", type: "builtin", key: "tanggal_jenis" },
  { id: "builtin:status", type: "builtin", key: "status" },
];

const FORM_ORDER_KEY = "arsip-surat-form-order";

function loadFormOrder(): string[] | null {
  try {
    const raw = localStorage.getItem(FORM_ORDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveFormOrder(ids: string[]) {
  try {
    localStorage.setItem(FORM_ORDER_KEY, JSON.stringify(ids));
  } catch {}
}

/**
 * Generic draggable form row — wraps any children with a grip handle.
 * Handle hanya tampil saat editLayout=true.
 */
function DraggableFormRow({
  item,
  children,
  editLayout,
}: {
  item: FormFieldItem;
  children: React.ReactNode;
  editLayout: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-start gap-2 rounded-md bg-white"
      whileDrag={editLayout ? {
        scale: 1.01,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        zIndex: 50,
      } : undefined}
      transition={{ duration: 0.2 }}
    >
      {editLayout && (
        <span
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
          className="mt-6 flex h-8 w-6 shrink-0 select-none items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          style={{ cursor: "grab", touchAction: "none" }}
          role="button"
          aria-label="Tarik untuk mengurutkan"
          title="Tarik untuk mengurutkan"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      <div className="flex-1">{children}</div>
    </Reorder.Item>
  );
}

function DraggableColumnManageRow({
  column,
  onRemove,
  removing,
}: {
  column: CustomColumn;
  onRemove: (c: CustomColumn) => void;
  removing: boolean;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={column}
      dragListener={false}
      dragControls={controls}
      data-testid={`column-item-${column.key}`}
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2"
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        backgroundColor: "#ffffff",
        zIndex: 50,
      }}
      transition={{ duration: 0.2 }}
    >
      <span
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        style={{ cursor: "grab", touchAction: "none" }}
        role="button"
        aria-label={`Tarik untuk mengurutkan ${column.label}`}
        title="Tarik untuk mengurutkan"
      >
        <GripVertical className="h-4 w-4" />
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium text-[#191c1e]">{column.label}</span>
        <span className="text-xs text-slate-500">
          {column.type === "date" ? "Tanggal" : column.type === "number" ? "Angka" : "Teks"} · key: {column.key}
        </span>
      </div>
      <Button
        data-testid={`button-remove-column-${column.key}`}
        variant="outline"
        size="sm"
        onClick={() => onRemove(column)}
        disabled={removing}
        className="rounded-md border-red-200 text-xs text-[#ba1a1a] hover:bg-red-50"
      >
        Hapus
      </Button>
    </Reorder.Item>
  );
}

export default function ArsipSuratPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [showDialog, setShowDialog] = useState(false);
  const [editLayout, setEditLayout] = useState(false);
  const [editItem, setEditItem] = useState<ArsipItem | null>(null);
  const [viewItem, setViewItem] = useState<ArsipItem | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: arsipList = [], isLoading } = useQuery<ArsipItem[]>({
    queryKey: ["/api/arsip-surat"],
    refetchInterval: 10000,
  });

  const { data: customColumns = [] } = useQuery<CustomColumn[]>({
    queryKey: ["/api/arsip-surat/custom-columns"],
    refetchInterval: 30000,
  });

  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [newColumnType, setNewColumnType] = useState<"text" | "number" | "date">("text");

  const createColumnMut = useMutation({
    mutationFn: (body: { label: string; type: "text" | "number" | "date" }) =>
      apiRequest("POST", "/api/arsip-surat/custom-columns", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat/custom-columns"] });
      setNewColumnLabel("");
      setNewColumnType("text");
      toast({ title: "Kolom berhasil ditambahkan" });
    },
    onError: (err: any) => toast({
      title: "Gagal menambah kolom",
      description: err?.message,
      variant: "destructive",
    }),
  });

  const removeColumnMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/arsip-surat/custom-columns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat/custom-columns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Kolom dihapus" });
    },
    onError: () => toast({ title: "Gagal menghapus kolom", variant: "destructive" }),
  });

  const reorderColumnMut = useMutation({
    mutationFn: (ids: string[]) =>
      apiRequest("PATCH", "/api/arsip-surat/custom-columns/reorder", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat/custom-columns"] });
    },
    onError: () => toast({ title: "Gagal menyimpan urutan kolom", variant: "destructive" }),
  });

  // Optimistic local copy agar drag & drop smooth; sinkron saat data server berubah.
  const [columnsLocal, setColumnsLocal] = useState<CustomColumn[]>([]);
  useEffect(() => {
    setColumnsLocal(customColumns);
  }, [customColumns]);

  const handleReorderColumns = (next: CustomColumn[]) => {
    setColumnsLocal(next);
    reorderColumnMut.mutate(next.map((c) => c._id));
  };

  // ── Form field ordering (all fields draggable) ──────────────────────────────
  const buildFormFields = useCallback((cols: CustomColumn[]): FormFieldItem[] => {
    const customItems: FormFieldItem[] = cols.map((c) => ({
      id: `custom:${c.key}`,
      type: "custom" as const,
      key: c.key,
    }));
    const allItems = [...BUILTIN_FIELDS, ...customItems];

    // Restore saved order from localStorage
    const savedOrder = loadFormOrder();
    if (savedOrder && savedOrder.length > 0) {
      const map = new Map(allItems.map((item) => [item.id, item]));
      const ordered: FormFieldItem[] = [];
      for (const id of savedOrder) {
        const item = map.get(id);
        if (item) {
          ordered.push(item);
          map.delete(id);
        }
      }
      // Append any new fields not in saved order (newly added columns)
      for (const item of map.values()) {
        ordered.push(item);
      }
      return ordered;
    }
    return allItems;
  }, []);

  const [formFields, setFormFields] = useState<FormFieldItem[]>(() => buildFormFields([]));

  // Rebuild when custom columns change (new column added / removed)
  useEffect(() => {
    setFormFields(buildFormFields(columnsLocal));
  }, [columnsLocal, buildFormFields]);

  const handleAddColumn = () => {
    const label = newColumnLabel.trim();
    if (!label) {
      toast({ title: "Label kolom tidak boleh kosong", variant: "destructive" });
      return;
    }
    createColumnMut.mutate({ label, type: newColumnType });
  };

  const handleRemoveColumn = (col: CustomColumn) => {
    if (!confirm(`Hapus kolom "${col.label}"? Nilai kolom ini pada semua surat juga akan ikut terhapus.`)) return;
    removeColumnMut.mutate(col._id);
  };

  const createMut = useMutation({
    mutationFn: (body: typeof defaultForm) => apiRequest("POST", "/api/arsip-surat", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Surat berhasil ditambahkan" });
      setShowDialog(false);
      setForm(defaultForm);
      setEditItem(null);
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (body: { id: string } & typeof defaultForm) =>
      apiRequest("PUT", `/api/arsip-surat/${body.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Surat berhasil diperbarui" });
      setShowDialog(false);
      setForm(defaultForm);
      setEditItem(null);
    },
    onError: () => toast({ title: "Gagal memperbarui", variant: "destructive" }),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/arsip-surat/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Surat dihapus dari arsip" });
    },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const removeAllMut = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/arsip-surat"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
      toast({ title: "Semua surat berhasil dihapus" });
    },
    onError: () => toast({ title: "Gagal menghapus semua surat", variant: "destructive" }),
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
    if (editItem) {
      updateMut.mutate({ id: editItem._id, ...form, status: statusByJenis(form.jenis) });
    } else {
      createMut.mutate({ ...form, status: statusByJenis(form.jenis) });
    }
  };

  const handleEdit = (item: ArsipItem) => {
    setEditItem(item);
    setForm({
      nomor: item.nomor,
      perihal: item.perihal,
      pengirimTujuan: item.pengirimTujuan,
      tanggal: item.tanggal,
      tanggalSurat: item.tanggalSurat || "",
      jenis: item.jenis,
      status: item.status,
      pdfUrl: item.pdfUrl || "",
      customFields: item.customFields || {},
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Hapus surat ini dari arsip?")) return;
    removeMut.mutate(id);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Hapus ${selectedIds.size} surat yang dipilih? Tindakan ini tidak bisa dibatalkan.`)) return;
    const ids = Array.from(selectedIds);
    setSelectedIds(new Set());
    await Promise.all(ids.map((id) => apiRequest("DELETE", `/api/arsip-surat/${id}`)));
    queryClient.invalidateQueries({ queryKey: ["/api/arsip-surat"] });
    toast({ title: `${ids.length} surat berhasil dihapus` });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f._id)));
    }
  };

  const handleDeleteAll = () => {
    if (arsipList.length === 0) return;
    if (!confirm(`Hapus semua ${arsipList.length} surat dari arsip? Tindakan ini tidak bisa dibatalkan.`)) return;
    removeAllMut.mutate();
  };

  const filtered = arsipList.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.nomor.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      item.pengirimTujuan.toLowerCase().includes(q) ||
      Object.values(item.customFields || {}).some((v) => String(v).toLowerCase().includes(q));
    const matchJenis = filterJenis === "Semua" || item.jenis === filterJenis;
    // Cek kecocokan bulan/tahun terhadap Tanggal Surat ATAU Tanggal Arsip,
    // supaya hasil filter tidak "hilang" karena salah satu tanggal jatuh di bulan berbeda.
    const candidateDates = [item.tanggal, item.tanggalSurat].filter(Boolean) as string[];
    const matchBulan =
      filterBulan === "Semua" ||
      candidateDates.some((iso) => {
        const d = new Date(iso);
        return !isNaN(d.getTime()) && (d.getMonth() + 1).toString() === filterBulan;
      });
    const matchTahun =
      filterTahun === "Semua" ||
      candidateDates.some((iso) => {
        const d = new Date(iso);
        return !isNaN(d.getTime()) && d.getFullYear().toString() === filterTahun;
      });
    return matchSearch && matchJenis && matchBulan && matchTahun;
  });

  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    const targetItems = selectedIds.size > 0 
      ? filtered.filter(item => selectedIds.has(item._id))
      : filtered;

    if (targetItems.length === 0) {
      toast({ title: "Tidak ada data untuk diunduh", variant: "destructive" });
      return;
    }

    // Jika yang dipilih tepat 1
    if (selectedIds.size === 1 && targetItems.length === 1) {
      const item = targetItems[0];
      if (!item.pdfUrl) {
        toast({ title: "Surat yang dipilih tidak memiliki file PDF", variant: "destructive" });
        return;
      }
      
      setExporting(true);
      toast({ title: `Mengunduh file surat ${item.nomor}…` });
      try {
        const fetchUrl = item.pdfUrl.startsWith("http")
          ? item.pdfUrl
          : `${window.location.origin}${item.pdfUrl}`;
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error("Gagal mengunduh file");
        const blob = await res.blob();
        const ext = item.pdfUrl.split("?")[0].split(".").pop() || "pdf";
        const safeName = item.nomor.replace(/[^a-zA-Z0-9_\-]/g, "_");
        saveAs(blob, `${safeName}.${ext}`);
        toast({ title: "File berhasil diunduh" });
      } catch (err: any) {
        toast({ title: "Gagal mengunduh", description: err?.message, variant: "destructive" });
      } finally {
        setExporting(false);
      }
      return;
    }

    // Jika > 1 atau 0 (semua filtered)
    setExporting(true);
    toast({ title: `Mengunduh ${targetItems.length} surat dalam ZIP, mohon tunggu…` });

    try {
      const zip = new JSZip();
      const bulanNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const bulanLabel = filterBulan !== "Semua" ? bulanNames[parseInt(filterBulan)] : "";
      const tahunLabel = filterTahun !== "Semua" ? filterTahun : "";
      const folderName = `Arsip_Surat${bulanLabel ? `_${bulanLabel}` : ""}${tahunLabel ? `_${tahunLabel}` : "_Semua"}`;
      const folder = zip.folder(folderName)!;

      let csv = "No,Nomor Surat,Perihal,Pengirim/Tujuan,Tanggal Surat,Tanggal Arsip,Jenis,Status,File";
      if (columnsLocal.length > 0) {
        csv += "," + columnsLocal.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
      }
      csv += "\n";
      let pdfCount = 0;

      const renderCustomCsv = (item: ArsipItem) =>
        columnsLocal.length > 0
          ? "," + columnsLocal.map((c) => `"${(item.customFields?.[c.key] || "").replace(/"/g, '""')}"`).join(",")
          : "";

      for (let i = 0; i < targetItems.length; i++) {
        const item = targetItems[i];
        const safeName = item.nomor.replace(/[^a-zA-Z0-9_\-]/g, "_");

        if (item.pdfUrl) {
          try {
            // Build absolute URL for local files
            const fetchUrl = item.pdfUrl.startsWith("http")
              ? item.pdfUrl
              : `${window.location.origin}${item.pdfUrl}`;

            const res = await fetch(fetchUrl);
            if (res.ok) {
              const arrayBuf = await res.arrayBuffer();
              const ext = item.pdfUrl.split("?")[0].split(".").pop() || "pdf";
              const fileName = `${String(i + 1).padStart(2, "0")}_${safeName}.${ext}`;
              folder.file(fileName, arrayBuf);
              csv += `${i + 1},"${item.nomor}","${item.perihal}","${item.pengirimTujuan}","${item.tanggalSurat || "-"}","${formatTanggal(item.tanggal)}","${item.jenis}","${item.status}","${fileName}"${renderCustomCsv(item)}\n`;
              pdfCount++;
              continue;
            }
          } catch (err) {
            console.warn(`Failed to fetch PDF for ${item.nomor}:`, err);
          }
        }
        csv += `${i + 1},"${item.nomor}","${item.perihal}","${item.pengirimTujuan}","${item.tanggalSurat || "-"}","${formatTanggal(item.tanggal)}","${item.jenis}","${item.status}",""${renderCustomCsv(item)}\n`;
      }

      folder.file("index.csv", csv);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
      toast({ title: `ZIP berhasil diunduh — ${pdfCount} PDF dari ${targetItems.length} surat` });
    } catch (err: any) {
      console.error("Export ZIP error:", err);
      toast({ title: "Gagal membuat ZIP", description: err?.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const masukCount = filtered.filter((a) => a.jenis === "Masuk").length;
  const keluarCount = filtered.filter((a) => a.jenis === "Keluar").length;
  const terkirimCount = filtered.filter((a) => a.status === "Terkirim").length;

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">Arsip Surat</h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola dan arsipkan surat masuk dan surat keluar Dinas Kelautan &amp; Perikanan Kabupaten Malang.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="button-kelola-kolom"
            variant="outline"
            onClick={() => setShowColumnsDialog(true)}
            className="rounded-lg border-slate-200 px-5 py-2.5 text-sm text-[#001e40] hover:bg-slate-50 [font-family:'Public_Sans',Helvetica]"
          >
            Kelola Kolom
          </Button>
          <Button
            data-testid="button-tambah-surat"
            onClick={() => { setEditItem(null); setForm(defaultForm); setShowDialog(true); }}
            className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
          >
            + Tambah Surat
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Total Surat", value: filtered.length, color: "text-[#001e40]" },
          { label: "Surat Masuk", value: masukCount, color: "text-slate-700" },
          { label: "Surat Keluar", value: keluarCount, color: "text-purple-700" },
          { label: "Terkirim", value: terkirimCount, color: "text-blue-700" },
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
                  aria-pressed={filterJenis === f}
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
                  {[2023, 2024, 2025, 2026].map((t) => (
                    <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              data-testid="button-export-zip"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={exporting}
              className="ml-auto rounded-md border-slate-200 text-xs text-[#001e40] hover:bg-slate-50"
            >
              {exporting ? "Mengunduh…" : "Download"}
            </Button>
            {selectedIds.size > 0 && (
              <Button
                data-testid="button-hapus-terpilih"
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="rounded-md border-red-200 text-xs text-[#ba1a1a] hover:bg-red-50"
              >
                Hapus Terpilih ({selectedIds.size})
              </Button>
            )}
            <Button
              data-testid="button-hapus-semua-arsip"
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={removeAllMut.isPending || arsipList.length === 0}
              className="rounded-md border-red-200 text-xs text-[#ba1a1a] hover:bg-red-50"
            >
              {removeAllMut.isPending ? "Menghapus…" : "Hapus Semua"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pr-2 text-left">
                    <Checkbox
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onCheckedChange={selectAllFiltered}
                      aria-label="Pilih semua"
                      className="border-slate-300"
                    />
                  </th>
                  {["No. Surat", "Perihal", "Pengirim/Tujuan"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">{h}</th>
                  ))}
                  {columnsLocal.map((c) => (
                    <th key={c._id} className="pb-3 pr-4 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">{c.label}</th>
                  ))}
                  {["Tgl Surat", "Tgl Arsip", "Jenis", "Status"].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">{h}</th>
                  ))}
                  <th className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    data-testid={`row-arsip-${item._id}`}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-3 pr-2">
                      <Checkbox
                        checked={selectedIds.has(item._id)}
                        onCheckedChange={() => toggleSelect(item._id)}
                        aria-label={`Pilih ${item.nomor}`}
                        className="border-slate-300"
                      />
                    </td>
                    <td className="py-3 pr-4 text-xs font-mono text-[#3a5f94] whitespace-nowrap">{item.nomor}</td>
                      <td className="max-w-[200px] py-3 pr-4">
                        <p className="line-clamp-2 text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">{item.perihal}</p>
                      </td>
                      <td className="max-w-[180px] py-3 pr-4">
                        <p className="line-clamp-2 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">{item.pengirimTujuan}</p>
                      </td>
                      {columnsLocal.map((c) => (
                        <td key={c._id} className="py-3 pr-4 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                          {item.customFields?.[c.key]
                            ? (c.type === "date" ? formatTanggal(item.customFields[c.key]) : item.customFields[c.key])
                            : "-"}
                        </td>
                      ))}
                      <td className="py-3 pr-4 text-sm text-[#5f5e5e] whitespace-nowrap [font-family:'Inter',Helvetica]">
                        {item.tanggalSurat ? formatTanggal(item.tanggalSurat) : "-"}
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
                            data-testid={`button-edit-${item._id}`}
                            onClick={() => handleEdit(item)}
                            className="text-xs font-medium text-[#001e40] hover:underline [font-family:'Inter',Helvetica]"
                          >
                            Edit
                          </button>
                          <span className="text-slate-300">|</span>
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
                    </tr>
                  ))}
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
      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#001e40]">{editItem ? "Edit Arsip Surat" : "Tambah Arsip Surat"}</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {editItem ? "Perbarui detail surat yang sudah diarsipkan." : "Isi detail surat dan opsional unggah scan dokumen PDF."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center justify-end gap-2">
              {editLayout && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem(FORM_ORDER_KEY);
                    setFormFields(buildFormFields(columnsLocal));
                    toast({ title: "Urutan form direset ke default" });
                  }}
                  className="h-6 px-2 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Reset Urutan
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditLayout((v) => !v)}
                className={`h-7 gap-1 px-3 text-[11px] ${editLayout ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"}`}
              >
                <GripVertical className="h-3 w-3" />
                {editLayout ? "Selesai Atur" : "Atur Urutan"}
              </Button>
            </div>
            <Reorder.Group
              axis="y"
              values={formFields}
              onReorder={(next) => {
                if (!editLayout) return;
                setFormFields(next);
                saveFormOrder(next.map((f) => f.id));
              }}
              layoutScroll
              className="flex flex-col gap-4"
            >
              {formFields.map((field) => {
                if (field.type === "builtin") {
                  switch (field.key) {
                    case "nomor":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="flex flex-col gap-1">
                            <label htmlFor="input-nomor" className="text-xs text-[#5f5e5e]">Nomor Surat *</label>
                            <Input id="input-nomor" required aria-required="true" data-testid="input-nomor-surat" value={form.nomor} onChange={(e) => setForm((f) => ({ ...f, nomor: e.target.value }))} placeholder="001/KKP/V/2024" className="border-slate-200 text-sm" />
                          </div>
                        </DraggableFormRow>
                      );
                    case "perihal":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="flex flex-col gap-1">
                            <label htmlFor="input-perihal" className="text-xs text-[#5f5e5e]">Perihal *</label>
                            <Input id="input-perihal" required aria-required="true" data-testid="input-perihal" value={form.perihal} onChange={(e) => setForm((f) => ({ ...f, perihal: e.target.value }))} placeholder="Perihal surat" className="border-slate-200 text-sm" />
                          </div>
                        </DraggableFormRow>
                      );
                    case "pengirimTujuan":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="flex flex-col gap-1">
                            <label htmlFor="input-pengirim" className="text-xs text-[#5f5e5e]">Pengirim / Tujuan *</label>
                            <Input id="input-pengirim" required aria-required="true" data-testid="input-pengirim" value={form.pengirimTujuan} onChange={(e) => setForm((f) => ({ ...f, pengirimTujuan: e.target.value }))} placeholder="Nama instansi / pengirim" className="border-slate-200 text-sm" />
                          </div>
                        </DraggableFormRow>
                      );
                    case "tanggalSurat":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="flex flex-col gap-1">
                            <label htmlFor="input-tanggal-surat" className="text-xs text-[#5f5e5e]">Tanggal Surat</label>
                            <Input id="input-tanggal-surat" data-testid="input-tanggal-surat" type="date" value={form.tanggalSurat} onChange={(e) => setForm((f) => ({ ...f, tanggalSurat: e.target.value }))} className="border-slate-200 text-sm" />
                          </div>
                        </DraggableFormRow>
                      );
                    case "tanggal_jenis":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label htmlFor="input-tanggal" className="text-xs text-[#5f5e5e]">Tanggal</label>
                              <Input id="input-tanggal" data-testid="input-tanggal" type="date" value={form.tanggal} onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))} className="border-slate-200 text-sm" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label htmlFor="select-jenis" className="text-xs text-[#5f5e5e]">Jenis Surat</label>
                              <Select value={form.jenis} onValueChange={(v) => {
                                const jenis = v as Jenis;
                                setForm((f) => ({ ...f, jenis, status: statusByJenis(jenis) }));
                              }}>
                                <SelectTrigger id="select-jenis" data-testid="select-jenis" className="border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Masuk">Masuk</SelectItem>
                                  <SelectItem value="Keluar">Keluar</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DraggableFormRow>
                      );
                    case "status":
                      return (
                        <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                          <div className="flex flex-col gap-1">
                            <label htmlFor="select-status" className="text-xs text-[#5f5e5e]">Status</label>
                            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}>
                              <SelectTrigger id="select-status" data-testid="select-status" className="border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Terarsip">Terarsip</SelectItem>
                                <SelectItem value="Terkirim">Terkirim</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </DraggableFormRow>
                      );
                    default:
                      return null;
                  }
                }
                // Custom field
                const col = columnsLocal.find((c) => c.key === field.key);
                if (!col) return null;
                return (
                  <DraggableFormRow key={field.id} item={field} editLayout={editLayout}>
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`input-custom-${col.key}`} className="text-xs text-[#5f5e5e]">{col.label}</label>
                      <Input
                        id={`input-custom-${col.key}`}
                        data-testid={`input-custom-${col.key}`}
                        type={col.type === "date" ? "date" : col.type === "number" ? "number" : "text"}
                        value={form.customFields?.[col.key] ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            customFields: { ...(f.customFields || {}), [col.key]: e.target.value },
                          }))
                        }
                        placeholder={col.label}
                        className="border-slate-200 text-sm"
                      />
                    </div>
                  </DraggableFormRow>
                );
              })}
            </Reorder.Group>

            {/* Quick add column inline — hanya tampil saat mode edit layout */}
            {editLayout && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  data-testid="input-quick-add-column"
                  value={newColumnLabel}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  placeholder="Tambah kolom baru..."
                  className="flex-1 border-dashed border-slate-300 text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddColumn(); } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddColumn}
                  disabled={createColumnMut.isPending}
                  className="gap-1 border-slate-300 text-xs text-[#001e40]"
                >
                  <Plus className="h-3 w-3" />
                  {createColumnMut.isPending ? "..." : "Tambah"}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="upload-pdf" className="text-xs text-[#5f5e5e]">Upload Scan Surat (PDF/Gambar, maks. 20 MB)</label>
              <input id="upload-pdf" ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleUploadPdf} />
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
            <Button data-testid="button-simpan-surat" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending} className="bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90">
              {(createMut.isPending || updateMut.isPending) ? "Menyimpan…" : editItem ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Surat Dialog ──────────────────────────────────────── */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent
          className={`max-h-[90vh] overflow-y-auto p-0 ${viewItem?.pdfUrl ? "max-w-5xl [&>button.absolute]:right-2 [&>button.absolute]:top-2 [&>button.absolute]:z-10 [&>button.absolute]:bg-white/80 [&>button.absolute]:rounded-full [&>button.absolute]:p-1" : "max-w-lg"}`}
        >
          {viewItem && (() => {
            const infoRows = [
              { label: "Nomor Surat", val: viewItem.nomor },
              { label: "Perihal", val: viewItem.perihal },
              { label: "Pengirim / Tujuan", val: viewItem.pengirimTujuan },
              { label: "Tanggal Surat", val: viewItem.tanggalSurat ? formatTanggal(viewItem.tanggalSurat) : "-" },
              { label: "Tanggal Arsip", val: formatTanggal(viewItem.tanggal) },
              { label: "Jenis", val: viewItem.jenis },
              { label: "Status", val: viewItem.status },
            ];
            const raw = viewItem.pdfUrl;
            const isLegacyConvexStorage = raw ? /convex\.cloud\/api\/storage\//i.test(raw) : false;
            const needsProxy = raw ? (raw.includes("cloudinary.com") || isLegacyConvexStorage) : false;
            const viewUrl = raw ? (needsProxy ? `/api/pdf-proxy?url=${encodeURIComponent(raw)}` : raw) : "";
            const isImage = raw ? /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(raw) : false;

            const header = (
              <DialogHeader>
                <DialogTitle className="text-[#001e40]">Detail Surat</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">Informasi lengkap surat yang diarsipkan.</DialogDescription>
              </DialogHeader>
            );

            const infoPane = (
              <div className="flex flex-col gap-3 py-2 text-sm">
                {infoRows.map((row) => (
                  <div key={row.label} className="flex gap-2">
                    <span className="w-36 shrink-0 text-xs text-[#5f5e5e]">{row.label}</span>
                    <span className="font-medium text-[#191c1e] break-words">{row.val}</span>
                  </div>
                ))}
                {columnsLocal.map((c) => {
                  const rawVal = viewItem.customFields?.[c.key];
                  const val = rawVal ? (c.type === "date" ? formatTanggal(rawVal) : rawVal) : "-";
                  return (
                    <div key={c._id} className="flex gap-2">
                      <span className="w-36 shrink-0 text-xs text-[#5f5e5e]">{c.label}</span>
                      <span className="font-medium text-[#191c1e] break-words">{val}</span>
                    </div>
                  );
                })}
                {raw && (
                  <div className="flex gap-2">
                    <span className="w-36 shrink-0 text-xs text-[#5f5e5e]">Dokumen Scan</span>
                    <div className="flex gap-3">
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3a5f94] underline hover:text-[#001e40]"
                      >
                        Buka di Tab Baru
                      </a>
                      <a
                        href={viewUrl}
                        download
                        className="text-[#3a5f94] underline hover:text-[#001e40]"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );

            const footer = (
              <DialogFooter>
                <Button onClick={() => setViewItem(null)} className="bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90">Tutup</Button>
              </DialogFooter>
            );

            if (!raw) {
              return (
                <div className="p-6 flex flex-col gap-4">
                  {header}
                  {infoPane}
                  {footer}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
                {/* Kiri: header + info + footer */}
                <div className="flex flex-col p-6 lg:border-r border-slate-200">
                  {header}
                  {infoPane}
                  <div className="mt-auto pt-4">
                    {footer}
                  </div>
                </div>
                {/* Kanan: preview dokumen sejajar dari atas */}
                <div className="p-4 lg:pr-10 lg:pt-6">
                  {isImage ? (
                    <img
                      src={viewUrl}
                      alt="Scan dokumen"
                      className="h-[600px] w-full rounded-md border border-slate-200 object-contain bg-slate-50"
                    />
                  ) : (
                    <iframe
                      src={viewUrl}
                      title="Preview PDF"
                      className="h-[600px] w-full rounded-md border border-slate-200"
                    />
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Kelola Kolom Dialog ──────────────────────────────────────── */}
      <Dialog open={showColumnsDialog} onOpenChange={setShowColumnsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#001e40]">Kelola Kolom Kustom</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tambah atau hapus kolom tambahan sewaktu-waktu. Kolom kustom akan muncul pada form, tabel, detail, dan hasil export.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3">
              <span className="text-xs font-medium text-[#5f5e5e]">Tambah Kolom Baru</span>
              <div className="flex gap-2">
                <Input
                  data-testid="input-new-column-label"
                  value={newColumnLabel}
                  onChange={(e) => setNewColumnLabel(e.target.value)}
                  placeholder="Nama kolom (mis. Indeks Surat)"
                  className="flex-1 border-slate-200 text-sm"
                />
                <Select value={newColumnType} onValueChange={(v) => setNewColumnType(v as "text" | "number" | "date")}>
                  <SelectTrigger className="w-[120px] border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Teks</SelectItem>
                    <SelectItem value="number">Angka</SelectItem>
                    <SelectItem value="date">Tanggal</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  data-testid="button-add-column"
                  onClick={handleAddColumn}
                  disabled={createColumnMut.isPending}
                  className="bg-[#001e40] text-xs text-white hover:bg-[#001e40]/90"
                >
                  {createColumnMut.isPending ? "Menambah…" : "Tambah"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#5f5e5e]">
                Kolom Tersimpan ({columnsLocal.length}){columnsLocal.length > 1 ? " · tarik untuk mengurutkan" : ""}
              </span>
              {columnsLocal.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">Belum ada kolom kustom.</p>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={columnsLocal}
                  onReorder={handleReorderColumns}
                  layoutScroll
                  className="flex flex-col gap-2"
                >
                  {columnsLocal.map((c) => (
                    <DraggableColumnManageRow
                      key={c._id}
                      column={c}
                      onRemove={handleRemoveColumn}
                      removing={removeColumnMut.isPending}
                    />
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowColumnsDialog(false)} className="bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
