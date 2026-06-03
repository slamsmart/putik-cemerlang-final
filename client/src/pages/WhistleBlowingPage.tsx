import { useState, useRef } from "react";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const kategoriList = ["Pelanggaran Disiplin","Korupsi","Fraud","Benturan Kepentingan","Pungutan Liar","Penyalahgunaan Wewenang","Lainnya"];

export default function WhistleBlowingPage() {
  const { toast } = useToast();
  const [anonim, setAnonim] = useState(false);
  const [form, setForm] = useState({ nama: "", kontak: "", judul: "", kategori: "", uraian: "" });
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImageUrl(data.url);
      toast({ title: "Gambar berhasil diunggah" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonim && (!form.nama || !form.kontak)) {
      toast({ title: "Data belum lengkap", description: "Nama dan kontak wajib diisi jika tidak anonim.", variant: "destructive" });
      return;
    }
    if (!form.judul || !form.kategori || !form.uraian) {
      toast({ title: "Data belum lengkap", description: "Harap isi judul, kategori, dan uraian laporan.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/whistle-blowing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: anonim ? "Anonim" : form.nama,
          email: (!anonim && form.kontak.includes("@")) ? form.kontak : "",
          telepon: (!anonim && !form.kontak.includes("@")) ? form.kontak : "",
          judul: form.judul,
          isi: form.uraian,
          imageUrl: imageUrl || undefined,
          isAnonymous: anonim,
          status: "Baru",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Gagal mengirim laporan" }));
        throw new Error(errData.message || "Gagal mengirim laporan");
      }
      toast({ title: "Laporan WBS berhasil terkirim", description: "Terima kasih atas keberanian Anda melaporkan." });
      setForm({ nama: "", kontak: "", judul: "", kategori: "", uraian: "" });
      setImageUrl("");
      setAnonim(false);
    } catch (err: any) {
      toast({ title: "Gagal mengirim", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-['Inter',Helvetica]">
      <PublicNavbar />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#001e40]">Whistle Blowing System</h1>
            <p className="mt-2 text-sm text-[#5f5e5e]">Laporkan indikasi pelanggaran secara rahasia sesuai standar Zona Integritas (ZI).</p>
          </div>
          <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex items-start gap-3 rounded-md bg-slate-50 p-4">
                  <Checkbox id="anonim" checked={anonim} onCheckedChange={v => setAnonim(!!v)} />
                  <div className="flex flex-col">
                    <Label htmlFor="anonim" className="cursor-pointer text-sm font-medium">Laporkan Secara Anonim</Label>
                    <p className="text-xs text-[#5f5e5e]">Identitas Anda tidak akan dicatat dalam sistem.</p>
                  </div>
                </div>
                {!anonim && (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                      <Input id="nama" placeholder="Nama lengkap pelapor" value={form.nama} onChange={e => handleChange("nama", e.target.value)} className="rounded-md border-slate-200" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="kontak">Email / No. Telepon <span className="text-red-500">*</span></Label>
                      <Input id="kontak" placeholder="email@contoh.com atau 0812..." value={form.kontak} onChange={e => handleChange("kontak", e.target.value)} className="rounded-md border-slate-200" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="judul">Judul Laporan <span className="text-red-500">*</span></Label>
                  <Input id="judul" placeholder="Ringkasan singkat laporan" value={form.judul} onChange={e => handleChange("judul", e.target.value)} className="rounded-md border-slate-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Kategori Laporan <span className="text-red-500">*</span></Label>
                  <Select value={form.kategori} onValueChange={v => handleChange("kategori", v)}>
                    <SelectTrigger className="rounded-md border-slate-200"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                    <SelectContent>{kategoriList.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="uraian">Uraian Laporan <span className="text-red-500">*</span></Label>
                  <Textarea id="uraian" placeholder="Jelaskan detail indikasi pelanggaran..." rows={5} value={form.uraian} onChange={e => handleChange("uraian", e.target.value)} className="rounded-md border-slate-200" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lampiran">Lampiran (opsional)</Label>
                  <input ref={fileRef} id="lampiran" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-slate-200 text-xs">
                      {uploading ? "Mengunggah…" : "Pilih File"}
                    </Button>
                    {imageUrl ? (
                      <span className="text-xs text-green-600">File terunggah ✓</span>
                    ) : (
                      <span className="text-xs text-slate-400">Maks. 5 MB. JPG/PNG/PDF</span>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="mt-2 w-full rounded-lg bg-[#001e40] py-3 text-sm text-white hover:bg-[#001e40]/90">
                  <Send className="mr-2 h-4 w-4" /> {loading ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <footer className="bg-[#001428] px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-400">
          &copy; 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
