import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { groupSkmEntriesByYear } from "@/lib/skm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Plus, Save, Trash2, Upload } from "lucide-react";

type SkmEntry = {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  year: number;
  quarter: string;
  imageUrl?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: number;
};

function createSlug(quarter: string, year: number) {
  return `skm-${quarter.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${year}`;
}

function SkmEntryCard({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: SkmEntry;
  onUpdate: (id: string, data: Partial<Omit<SkmEntry, "_id" | "_creationTime" | "createdAt">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(entry.title);
  const [year, setYear] = useState(String(entry.year));
  const [quarter, setQuarter] = useState(entry.quarter);
  const [slug, setSlug] = useState(entry.slug);
  const [description, setDescription] = useState(entry.description || "");
  const [displayOrder, setDisplayOrder] = useState(String(entry.displayOrder));
  const [imageUrl, setImageUrl] = useState(entry.imageUrl || "");
  const [isActive, setIsActive] = useState(entry.isActive);
  const [uploading, setUploading] = useState(false);

  const handleActiveChange = async (checked: boolean) => {
    setIsActive(checked);
    try {
      await onUpdate(entry._id, { isActive: checked });
      toast({ title: checked ? "Data SKM ditampilkan di navbar" : "Data SKM disembunyikan dari navbar" });
    } catch (error: any) {
      setIsActive(!checked);
      toast({ title: "Gagal memperbarui navbar", description: error.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    await onUpdate(entry._id, {
      title,
      year: Number(year) || new Date().getFullYear(),
      quarter,
      slug,
      description,
      displayOrder: Number(displayOrder) || 0,
      imageUrl,
      isActive,
    });
    toast({ title: "Data SKM disimpan" });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload gagal");

      setImageUrl(data.url);
      await onUpdate(entry._id, { imageUrl: data.url });
      toast({ title: "Foto hasil SKM diunggah" });
    } catch (error: any) {
      toast({ title: "Upload gagal", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
      <CardContent className="grid gap-5 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-5">
        <div className="relative h-40 overflow-hidden rounded-lg bg-slate-100 md:h-full md:min-h-[210px]">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">Belum ada foto</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button
            type="button"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 gap-1 rounded-full bg-[#001e40]/90 px-3 text-xs text-white hover:bg-[#001e40]"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Mengunggah" : "Foto"}
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge className="rounded-full bg-[#c6e7ff] px-3 py-1 text-xs font-normal tracking-[0.6px] text-[#001e2d] hover:bg-[#c6e7ff]">
                {quarter} {year}
              </Badge>
              <h2 className="mt-2 font-['Public_Sans',Helvetica] text-lg font-bold text-[#001e40]">
                {title}
              </h2>
            </div>
            <label className="flex items-center gap-2 text-sm text-[#5f5e5e]">
              <Checkbox checked={isActive} onCheckedChange={(checked) => void handleActiveChange(checked === true)} />
              Tampilkan di navbar
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              Judul Menu
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              Slug URL
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              Tahun
              <Input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              Triwulan
              <Input value={quarter} onChange={(e) => setQuarter(e.target.value)} className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              Urutan
              <Input value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} inputMode="numeric" className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e]">
              URL Foto
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 border-slate-200 text-sm text-[#191c1e]" />
            </label>
            <label className="space-y-1 text-xs text-[#5f5e5e] md:col-span-2">
              Deskripsi
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-[76px] border-slate-200 text-sm text-[#191c1e]" />
            </label>
          </div>

          <div className="flex flex-wrap justify-between gap-2">
            <Button onClick={handleSave} className="gap-2 rounded bg-[#001e40] text-white hover:bg-[#001e40]/90">
              <Save className="h-4 w-4" />
              Simpan
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm("Hapus data SKM ini?")) void onDelete(entry._id);
              }}
              className="gap-2 text-[#ba1a1a] hover:bg-red-50 hover:text-[#ba1a1a]"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SkmAdminPage() {
  const { toast } = useToast();
  const { data: entries = [], isLoading } = useQuery<SkmEntry[]>({
    queryKey: ["/api/skm"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createEntry = useMutation({
    mutationFn: (data: Partial<SkmEntry>) => apiRequest("POST", "/api/skm", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/skm"] }),
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SkmEntry> }) =>
      apiRequest("PATCH", `/api/skm/${id}`, data),
    onSuccess: (_response, { id, data }) => {
      queryClient.setQueryData<SkmEntry[]>(["/api/skm"], (current) =>
        current?.map((entry) => (entry._id === id ? { ...entry, ...data } : entry)),
      );
      void queryClient.invalidateQueries({ queryKey: ["/api/skm"] });
    },
  });

  const removeEntry = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/skm/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/skm"] }),
  });

  const seed2025 = useMutation({
    mutationFn: () => apiRequest("POST", "/api/skm/seed-2025"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/skm"] }),
  });

  const handleCreate = async () => {
    const year = new Date().getFullYear();
    const quarter = "Triwulan I";
    const order = entries.length;
    await createEntry.mutateAsync({
      title: `SKM ${quarter} ${year}`,
      slug: createSlug(quarter, year),
      year,
      quarter,
      imageUrl: "",
      description: "Hasil Survey Kepuasan Masyarakat Cabang Dinas Kelautan dan Perikanan Kab. Malang.",
      displayOrder: order,
      isActive: true,
    });
    toast({ title: "Kolom SKM baru ditambahkan" });
  };

  const handleSeed2025 = async () => {
    await seed2025.mutateAsync();
    toast({ title: "Template SKM 2025 disiapkan" });
  };

  const handleUpdate = async (
    id: string,
    data: Partial<Omit<SkmEntry, "_id" | "_creationTime" | "createdAt">>,
  ) => {
    await updateEntry.mutateAsync({ id, data });
  };

  const handleDelete = async (id: string) => {
    await removeEntry.mutateAsync(id);
    toast({ title: "Data SKM dihapus" });
  };

  const activeCount = entries.filter((entry) => entry.isActive).length;
  const entryGroups = groupSkmEntriesByYear(entries);

  return (
    <AdminLayout>
      <header className="mb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Data SKM Per Tahun
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola menu SKM di navbar publik dan unggah foto hasil Survey Kepuasan Masyarakat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSeed2025} className="rounded-full border-slate-200">
            Template 2025
          </Button>
          <Button onClick={handleCreate} className="gap-2 rounded-full bg-[#001e40] text-white hover:bg-[#001e40]/90">
            <Plus className="h-4 w-4" />
            Tambah Kolom
          </Button>
        </div>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Kolom SKM", value: entries.length },
          { label: "Tampil di Navbar", value: activeCount },
          { label: "Menunggu Foto", value: entries.filter((entry) => !entry.imageUrl).length },
        ].map((item) => (
          <Card key={item.label} className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-5">
              <div className="font-['Public_Sans',Helvetica] text-2xl font-bold text-[#001e40]">{item.value}</div>
              <div className="mt-0.5 text-sm text-[#5f5e5e]">{item.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {entryGroups.map((group) => (
          <section key={group.year} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#001e40]">
                Tahun {group.year}
              </h2>
              <div className="h-px flex-1 bg-[#d7deea]" />
            </div>
            <div className="flex flex-col gap-5">
              {group.items.map((entry) => (
                <SkmEntryCard key={entry._id} entry={entry} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        ))}
        {entries.length === 0 && (
          <Card className="rounded-xl border border-dashed border-slate-300 bg-white">
            <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <ImageIcon className="h-10 w-10 text-slate-400" />
              <p className="text-sm text-[#5f5e5e]">
                {isLoading ? "Memuat data SKM..." : "Belum ada data SKM. Gunakan Template 2025 atau Tambah Kolom."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
