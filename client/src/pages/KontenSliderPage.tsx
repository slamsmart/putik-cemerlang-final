import { useRef, useState } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Convex slider doc type (has _id instead of id)
type ConvexSlider = {
  _id: Id<"sliders">;
  _creationTime: number;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

interface SliderCardProps {
  slider: ConvexSlider;
  onDelete: (id: Id<"sliders">) => void;
  onUpdate: (id: Id<"sliders">, data: Partial<Omit<ConvexSlider, "_id" | "_creationTime">>) => void;
}

function SliderCard({ slider, onDelete, onUpdate }: SliderCardProps) {
  const [title, setTitle] = useState(slider.title);
  const [subtitle, setSubtitle] = useState(slider.subtitle);
  const [ctaText, setCtaText] = useState(slider.ctaText);
  const [ctaLink, setCtaLink] = useState(slider.ctaLink);
  const [imageUrl, setImageUrl] = useState(slider.imageUrl);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdate(slider._id, { title, subtitle, ctaText, ctaLink, imageUrl });
    toast({ title: "Slider berhasil disimpan" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImageUrl(data.url);
      // Auto-save to Convex immediately after upload
      onUpdate(slider._id, { imageUrl: data.url });
      if (data.note) toast({ title: "Info", description: data.note });
      else toast({ title: "Gambar berhasil diunggah & disimpan" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      data-testid={`card-slider-${slider._id}`}
      className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 rounded-lg border border-slate-200 bg-white p-4"
    >
      {/* Image preview */}
      <div className="relative h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt="Slider" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Belum ada gambar
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          aria-label="Upload gambar baru untuk slider"
          data-testid={`button-upload-image-${slider._id}`}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-1.5 right-1.5 rounded bg-[#001e40]/80 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#001e40] disabled:opacity-60"
        >
          {uploading ? "Mengunggah…" : "Ganti Gambar"}
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-full flex flex-col gap-1">
            <label htmlFor={`headline-${slider._id}`} className="text-xs text-[#5f5e5e]">Headline Utama</label>
            <Input
              id={`headline-${slider._id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="col-span-full flex flex-col gap-1">
            <label htmlFor={`subheadline-${slider._id}`} className="text-xs text-[#5f5e5e]">Sub-headline</label>
            <Textarea
              id={`subheadline-${slider._id}`}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="min-h-[72px] resize-none border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`cta-text-${slider._id}`} className="text-xs text-[#5f5e5e]">Teks Tombol (CTA)</label>
            <Input
              id={`cta-text-${slider._id}`}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`cta-link-${slider._id}`} className="text-xs text-[#5f5e5e]">Link Tujuan</label>
            <Input
              id={`cta-link-${slider._id}`}
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Button
            onClick={handleSave}
            size="sm"
            className="rounded bg-[#001e40] px-4 text-xs text-white hover:bg-[#001e40]/90"
          >
            Simpan
          </Button>
          <Button
            aria-label={`Hapus slider ${title || 'ini'}`}
            variant="ghost"
            size="sm"
            onClick={() => onDelete(slider._id)}
            className="gap-1 p-0 text-[#ba1a1a] hover:bg-transparent hover:text-[#ba1a1a]"
          >
            <span aria-hidden="true" className="text-sm">🗑 Hapus</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function KontenSliderPage() {
  const { toast } = useToast();

  // ✅ Convex real-time query — persists on refresh
  const sliders = useConvexQuery(api.sliders.list) ?? [];
  const isLoading = sliders === undefined;

  const createSlider = useConvexMutation(api.sliders.create);
  const updateSlider = useConvexMutation(api.sliders.update);
  const deleteSlider = useConvexMutation(api.sliders.remove);

  const handleCreate = async () => {
    try {
      await createSlider({
        title: "Judul Banner Baru",
        subtitle: "Deskripsi banner baru. Klik Edit untuk mengubah.",
        ctaText: "Selengkapnya",
        ctaLink: "/",
        imageUrl: "",
        displayOrder: (sliders as ConvexSlider[]).length,
        isActive: true,
      });
      toast({ title: "Slider baru ditambahkan" });
    } catch {
      toast({ title: "Gagal menambah slider", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: Id<"sliders">, data: Partial<Omit<ConvexSlider, "_id" | "_creationTime">>) => {
    try {
      await updateSlider({ id, ...data });
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (id: Id<"sliders">) => {
    try {
      await deleteSlider({ id });
      toast({ title: "Slider dihapus" });
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const activeCount = (sliders as ConvexSlider[]).filter((s) => s.isActive).length;

  return (
    <AdminLayout>
      <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Konten &amp; Slider
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola visual utama dan metadata informasi situs Putik Cemerlang.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium w-fit">
          ✅ Real-time via Convex — data tidak hilang saat refresh
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Slider Management */}
        <Card className="lg:col-span-8 rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Manajemen Hero Slider
              </h2>
              <Badge className="rounded-full bg-[#c6e7ff] px-3 py-1 text-xs font-normal tracking-[0.6px] text-[#001e2d] hover:bg-[#c6e7ff]">
                AKTIF: {activeCount} BANNER
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-40 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <AnimatePresence mode="popLayout">
                  {(sliders as ConvexSlider[]).map((slider) => (
                    <motion.div
                      key={slider._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <SliderCard
                        slider={slider}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  data-testid="button-tambah-banner"
                  variant="ghost"
                  onClick={handleCreate}
                  className="h-auto w-full justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-4 text-[#5f5e5e] hover:bg-slate-50"
                >
                  <span className="text-base">+ Tambah Banner Baru</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
              <h2 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Metadata Situs
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="meta-title" className="text-xs text-[#5f5e5e]">Meta Title</label>
                  <Input
                    id="meta-title"
                    defaultValue="Putik Cemerlang | Kab. Malang"
                    className="border-slate-200 text-sm"
                  />
                  <p className="text-[10px] text-slate-400">Disarankan 50–60 karakter.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="meta-desc" className="text-xs text-[#5f5e5e]">Meta Description</label>
                  <Textarea
                    id="meta-desc"
                    defaultValue="Portal pusat informasi maritim resmi Kabupaten Malang untuk pelayanan publik, data perikanan, dan edukasi konservasi laut."
                    className="min-h-[80px] resize-none border-slate-200 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="meta-keywords" className="text-xs text-[#5f5e5e]">Keywords (SEO)</label>
                  <Input
                    id="meta-keywords"
                    defaultValue="maritim, malang, perikanan, informasi laut"
                    className="border-slate-200 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 bg-[#003366]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">Tip Optimasi Gambar</h3>
                  <p className="text-xs leading-relaxed text-[#799dd6]">
                    Gunakan gambar rasio 16:9 dan resolusi minimal 1920×1080px. Pastikan ukuran
                    file di bawah 500 KB. Cloudinary akan mengompresi ke WebP otomatis saat diunggah.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </AdminLayout>
  );
}
