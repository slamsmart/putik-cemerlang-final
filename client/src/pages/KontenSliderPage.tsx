import { useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Slider } from "@shared/schema";

interface SliderCardProps {
  slider: Slider;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Slider>) => void;
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
    onUpdate(slider.id, { title, subtitle, ctaText, ctaLink, imageUrl });
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
      if (data.note) toast({ title: "Info", description: data.note });
      else toast({ title: "Gambar berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      data-testid={`card-slider-${slider.id}`}
      className="flex items-start gap-6 rounded-lg border border-slate-200 bg-white p-4"
    >
      {/* Image preview */}
      <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-md bg-slate-100">
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
          data-testid={`button-upload-image-${slider.id}`}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-1.5 right-1.5 rounded bg-[#001e40]/80 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#001e40] disabled:opacity-60"
        >
          {uploading ? "Mengunggah…" : "Ganti Gambar"}
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#5f5e5e]">Headline Utama</label>
            <Input
              data-testid={`input-headline-${slider.id}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs text-[#5f5e5e]">Sub-headline</label>
            <Textarea
              data-testid={`input-subheadline-${slider.id}`}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="min-h-[72px] resize-none border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#5f5e5e]">Teks Tombol (CTA)</label>
            <Input
              data-testid={`input-cta-${slider.id}`}
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#5f5e5e]">Link Tujuan</label>
            <Input
              data-testid={`input-link-${slider.id}`}
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              className="border-slate-200 text-sm text-[#191c1e]"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Button
            data-testid={`button-simpan-slider-${slider.id}`}
            onClick={handleSave}
            size="sm"
            className="rounded bg-[#001e40] px-4 text-xs text-white hover:bg-[#001e40]/90"
          >
            Simpan
          </Button>
          <Button
            data-testid={`button-hapus-slider-${slider.id}`}
            variant="ghost"
            size="sm"
            onClick={() => onDelete(slider.id)}
            className="gap-1 p-0 text-[#ba1a1a] hover:bg-transparent hover:text-[#ba1a1a]"
          >
            <img src="/figmaAssets/container-1.svg" alt="" className="shrink-0" />
            <span className="text-sm">Hapus</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function KontenSliderPage() {
  const { toast } = useToast();

  const { data: sliders = [], isLoading } = useQuery<Slider[]>({
    queryKey: ["/api/sliders"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slider> }) =>
      apiRequest("PUT", `/api/sliders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sliders"] });
      toast({ title: "Slider berhasil disimpan" });
    },
    onError: () => toast({ title: "Gagal menyimpan", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/sliders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sliders"] });
      toast({ title: "Slider dihapus" });
    },
    onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/sliders", {
        title: "Judul Banner Baru",
        subtitle: "Deskripsi banner baru.",
        ctaText: "Selengkapnya",
        ctaLink: "/",
        imageUrl: "",
        displayOrder: sliders.length,
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sliders"] });
      toast({ title: "Slider baru ditambahkan" });
    },
    onError: () => toast({ title: "Gagal menambah", variant: "destructive" }),
  });

  const activeCount = sliders.filter((s) => s.isActive).length;

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Konten &amp; Slider
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola visual utama dan metadata informasi situs Putik Cemerlang.
          </p>
        </div>
        <Button
          data-testid="button-simpan-perubahan"
          className="h-auto rounded-lg bg-[#001e40] px-10 py-2.5 shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica] text-sm text-white"
        >
          <img src="/figmaAssets/container-13.svg" alt="" className="mr-2 shrink-0" />
          Simpan Perubahan
        </Button>
      </header>

      <section className="grid grid-cols-12 gap-6">
        {/* Slider Management */}
        <Card className="col-[1_/_9] rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="flex flex-col gap-6 p-6">
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
                  {sliders.map((slider) => (
                    <motion.div
                      key={slider.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                    >
                      <SliderCard
                        slider={slider}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  data-testid="button-tambah-banner"
                  variant="ghost"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className="h-auto w-full justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-4 text-[#5f5e5e] hover:bg-slate-50"
                >
                  <img src="/figmaAssets/container-11.svg" alt="" className="shrink-0" />
                  <span className="text-base">
                    {createMutation.isPending ? "Menambahkan…" : "Tambah Banner Baru"}
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <aside className="col-[9_/_13] flex flex-col gap-6">
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-5 p-6">
              <h2 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Metadata Situs
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#5f5e5e]">Meta Title</label>
                  <Input
                    data-testid="input-meta-title"
                    defaultValue="Putik Cemerlang | Kab. Malang"
                    className="border-slate-200 text-sm"
                  />
                  <p className="text-[10px] text-slate-400">Disarankan 50–60 karakter.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#5f5e5e]">Meta Description</label>
                  <Textarea
                    data-testid="input-meta-description"
                    defaultValue="Portal pusat informasi maritim resmi Kabupaten Malang untuk pelayanan publik, data perikanan, dan edukasi konservasi laut."
                    className="min-h-[100px] resize-none border-slate-200 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#5f5e5e]">Keywords (SEO)</label>
                  <Input
                    data-testid="input-keywords"
                    defaultValue="maritim, malang, perikanan, informasi laut"
                    className="border-slate-200 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 bg-[#003366]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <img src="/figmaAssets/icon.svg" alt="" className="h-6 w-6 shrink-0" />
                <div>
                  <h3 className="mb-1.5 text-sm font-bold text-white">Tip Optimasi Gambar</h3>
                  <p className="text-xs leading-relaxed text-[#799dd6]">
                    Gunakan gambar rasio 16:9 dan resolusi minimal 1920×1080px. Pastikan ukuran
                    file di bawah 500 KB. Cloudinary akan mengompresi otomatis saat diunggah.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-4 p-6">
              <h2 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Konten General
              </h2>
              {[
                { icon: "/figmaAssets/container-6.svg", label: "Running Text" },
                { icon: "/figmaAssets/container-9.svg", label: "FAQ Section" },
                { icon: "/figmaAssets/container-12.svg", label: "Marine Alerts" },
              ].map((item, i) => (
                <button
                  key={i}
                  data-testid={`button-konten-general-${i}`}
                  className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                >
                  <span className="flex items-center gap-3">
                    <img src={item.icon} alt="" className="shrink-0" />
                    <span className="text-sm font-medium text-[#191c1e]">{item.label}</span>
                  </span>
                  <span className="text-sm text-[#3a5f94]">Edit</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>
      </section>
    </AdminLayout>
  );
}
