import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";

const StatEditor = forwardRef(({ stat, onUpdate, onDelete }: { stat: any; onUpdate: any; onDelete: any }, ref) => {
  const [value, setValue] = useState(stat.value);
  const [label, setLabel] = useState(stat.label);
  const [linkUrl, setLinkUrl] = useState(stat.linkUrl || "");
  const [icon, setIcon] = useState(stat.icon);
  const [highlight, setHighlight] = useState(stat.highlight);
  const { toast } = useToast();
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;

  const handleSave = () => {
    return onUpdate({
      id: stat._id,
      value,
      label,
      linkUrl,
      icon,
      highlight
    }).then(() => {
      toast({ title: "Statistik berhasil disimpan" });
    }).catch(() => {
      toast({ title: "Gagal menyimpan statistik", variant: "destructive" });
    });
  };

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 mb-2">
         <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${highlight ? "bg-[#001e40] text-white" : "bg-[#d5e3ff]/30 text-[#001e40]"}`}>
            <IconComponent className="h-5 w-5" />
         </div>
         <div className="flex-1 font-semibold text-sm text-[#001e40]">{label || "Statistik Baru"}</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
           <label className="text-xs text-[#5f5e5e]">Angka/Nilai</label>
           <Input value={value} onChange={e => setValue(e.target.value)} className="text-sm h-8" />
        </div>
        <div className="flex flex-col gap-1">
           <label className="text-xs text-[#5f5e5e]">Label Deskripsi</label>
           <Input value={label} onChange={e => setLabel(e.target.value)} className="text-sm h-8" />
        </div>
        <div className="flex flex-col gap-1">
           <label className="text-xs text-[#5f5e5e]">Link Tujuan</label>
           <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="Contoh: /layanan" className="text-sm h-8" />
        </div>
        <div className="flex flex-col gap-1">
           <label className="text-xs text-[#5f5e5e]">Icon (Nama Lucide)</label>
           <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Contoh: Anchor, Users" className="text-sm h-8" />
        </div>
        <div className="flex items-center gap-2 col-span-2 pt-2">
           <input type="checkbox" id={`highlight-${stat._id}`} checked={highlight} onChange={e => setHighlight(e.target.checked)} className="rounded border-slate-300 text-[#001e40] focus:ring-[#001e40]" />
           <label htmlFor={`highlight-${stat._id}`} className="text-xs text-[#5f5e5e] cursor-pointer">Gunakan gaya highlight warna gelap</label>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3">
        <Button size="sm" onClick={handleSave} className="h-8 rounded bg-[#001e40] px-4 text-xs text-white hover:bg-[#001e40]/90">Simpan</Button>
        <Button variant="ghost" size="sm" onClick={() => {
           onDelete({ id: stat._id })
             .then(() => toast({ title: "Statistik dihapus" }))
             .catch(() => toast({ title: "Gagal menghapus statistik", variant: "destructive" }));
        }} className="h-8 gap-1 p-0 text-[#ba1a1a] hover:bg-transparent hover:text-[#ba1a1a]">
           <img src="/figmaAssets/container-1.svg" alt="" className="shrink-0" />
           <span className="text-xs">Hapus</span>
        </Button>
      </div>
    </div>
  )
});

const fallbackStats = [
  { icon: "Anchor", value: "350+", label: "Nelayan Terdaftar", highlight: false, displayOrder: 0, isActive: true, linkUrl: "#" },
  { icon: "Fish", value: "3", label: "Pembudidaya Ikan", highlight: false, displayOrder: 1, isActive: true, linkUrl: "#" },
  { icon: "Ship", value: "928", label: "Unit Perikanan", highlight: false, displayOrder: 2, isActive: true, linkUrl: "#" },
  { icon: "Sailboat", value: "142", label: "Kapal Terverifikasi", highlight: false, displayOrder: 3, isActive: true, linkUrl: "#" },
  { icon: "ShieldCheck", value: "19", label: "Pokmaswas Aktif", highlight: false, displayOrder: 4, isActive: true, linkUrl: "#" },
  { icon: "TreePine", value: "5.7", label: "Luas Mangrove (Ha)", highlight: false, displayOrder: 5, isActive: true, linkUrl: "#" },
  { icon: "Waves", value: "2.3", label: "Terumbu Karang (Ha)", highlight: false, displayOrder: 6, isActive: true, linkUrl: "#" },
  { icon: "MapPin", value: "25", label: "Titik Penyu", highlight: false, displayOrder: 7, isActive: true, linkUrl: "#" },
  { icon: "Users", value: "785", label: "Masyarakat Terlayani", highlight: false, displayOrder: 8, isActive: true, linkUrl: "#" },
  { icon: "TrendingUp", value: "95.12%", label: "Survey Kepuasan", highlight: true, displayOrder: 9, isActive: true, linkUrl: "#" },
];

export default function StatistikLayananPage() {
  const { toast } = useToast();
  const editorRefs = useRef<Map<string, any>>(new Map());
  
  const apiStats = useConvexQuery(api.stats.list);
  const updateStat = useConvexMutation(api.stats.update);
  const createStat = useConvexMutation(api.stats.create);
  const deleteStat = useConvexMutation(api.stats.remove);
  const stats = apiStats ?? [];
  const activeStatsCount = stats.filter(s => s.isActive).length;

  const handleLoadDummy = async () => {
    try {
      for (const stat of fallbackStats) {
        await createStat(stat);
      }
      toast({ title: "Data bawaan berhasil dimuat" });
    } catch {
      toast({ title: "Gagal memuat data", variant: "destructive" });
    }
  };

  const handleSimpanSemua = async () => {
    try {
      const promises = Array.from(editorRefs.current.values()).map(ref => ref.save());
      await Promise.all(promises);
      toast({ title: "Semua perubahan berhasil disimpan secara massal!" });
    } catch {
      toast({ title: "Beberapa perubahan gagal disimpan", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Statistik Layanan
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola data statistik capaian dan jangkauan layanan yang tampil di halaman utama.
          </p>
        </div>
        <Button
          onClick={handleSimpanSemua}
          className="h-auto rounded-lg bg-[#001e40] px-10 py-2.5 shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica] text-sm text-white"
        >
          <img src="/figmaAssets/container-13.svg" alt="" className="mr-2 shrink-0" />
          Simpan Semua
        </Button>
      </header>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-[1_/_13] flex flex-col gap-6">
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                    Manajemen Jangkauan Layanan
                  </h2>
                  <p className="text-xs text-[#5f5e5e] mt-1">
                    Atur statistik yang akan dimunculkan. Gunakan tautan valid jika ingin mengarahkan pengguna ke halaman lain saat di klik.
                  </p>
                </div>
                <Badge className="rounded-full bg-[#c6e7ff] px-3 py-1 text-xs font-normal tracking-[0.6px] text-[#001e2d] hover:bg-[#c6e7ff]">
                  AKTIF: {activeStatsCount} DATA
                </Badge>
              </div>

              {apiStats === undefined ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {stats.length === 0 && (
                    <div className="col-[1_/_span_1] lg:col-[1_/_span_2] xl:col-[1_/_span_3] flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                      <p className="text-sm text-slate-500 mb-4 text-center">
                        Basis data statistik Anda masih kosong.<br/>Klik tombol di bawah ini untuk memuat seluruh 10 data statistik bawaan (dummy).
                      </p>
                      <Button onClick={handleLoadDummy} className="bg-[#001e40] text-white hover:bg-[#001e40]/90">
                        Muat 10 Data Bawaan (Dummy)
                      </Button>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <StatEditor
                          ref={(el) => {
                            if (el) {
                              editorRefs.current.set(stat._id, el);
                            } else {
                              editorRefs.current.delete(stat._id);
                            }
                          }}
                          stat={stat}
                          onDelete={deleteStat}
                          onUpdate={updateStat}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button
                    variant="ghost"
                    onClick={() => {
                       createStat({
                         value: "0",
                         label: "Statistik Baru",
                         linkUrl: "#",
                         icon: "Circle",
                         highlight: false,
                         displayOrder: stats.length,
                         isActive: true,
                       }).then(() => toast({ title: "Statistik ditambahkan" }))
                         .catch(() => toast({ title: "Gagal menambah statistik", variant: "destructive" }));
                    }}
                    className="h-auto w-full flex-col justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-12 text-[#5f5e5e] hover:bg-slate-50"
                  >
                    <LucideIcons.PlusCircle className="h-6 w-6 text-slate-400" />
                    <span className="text-sm">Tambah Data Statistik</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminLayout>
  );
}
