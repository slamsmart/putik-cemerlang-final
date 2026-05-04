import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Send, ShieldCheck, AlertTriangle, FileText,
  Clock, Lock, Upload, CheckCircle2, Info,
} from "lucide-react";

const jenisGratifikasiList = [
  "Uang / Transfer",
  "Barang / Hadiah",
  "Fasilitas / Hiburan",
  "Makanan / Minuman",
  "Perjalanan Wisata",
  "Diskon / Keringanan",
  "Bentuk Lainnya",
];

const hubunganPemberiList = [
  "Rekanan / Vendor / Kontraktor",
  "Masyarakat / Wajib Pajak",
  "Atasan Langsung",
  "Sesama Pegawai",
  "Tidak Dikenal",
  "Lainnya",
];

const EMPTY_FORM = {
  nama: "",
  nip: "",
  jabatan: "",
  unitKerja: "",
  telepon: "",
  email: "",
  tanggalPenerimaan: "",
  jenisGratifikasi: "",
  nilaiGratifikasi: "",
  pemberGratifikasi: "",
  hubunganPemberi: "",
  kronologi: "",
};

export default function PelaporanGratifikasiPage() {
  const { toast } = useToast();
  const [anonim, setAnonim] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      toast({ title: "Bukti berhasil diunggah ✓" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonim && (!form.nama || !form.nip || !form.jabatan)) {
      toast({ title: "Data belum lengkap", description: "Nama, NIP, dan Jabatan wajib diisi jika tidak anonim.", variant: "destructive" });
      return;
    }
    if (!form.unitKerja || !form.telepon || !form.tanggalPenerimaan || !form.jenisGratifikasi || !form.nilaiGratifikasi || !form.pemberGratifikasi || !form.hubunganPemberi || !form.kronologi) {
      toast({ title: "Data belum lengkap", description: "Harap lengkapi semua kolom yang wajib diisi.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pelaporan-gratifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: anonim ? "Anonim" : form.nama,
          nip: anonim ? undefined : (form.nip || undefined),
          jabatan: anonim ? "Anonim" : form.jabatan,
          unitKerja: form.unitKerja,
          telepon: anonim ? "" : form.telepon,
          email: anonim ? "" : form.email,
          tanggalPenerimaan: form.tanggalPenerimaan,
          jenisGratifikasi: form.jenisGratifikasi,
          nilaiGratifikasi: form.nilaiGratifikasi,
          pemberGratifikasi: form.pemberGratifikasi,
          hubunganPemberi: form.hubunganPemberi,
          kronologi: form.kronologi,
          imageUrl: imageUrl || undefined,
          isAnonymous: anonim,
          status: "Baru",
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: "Gagal mengirim laporan" }));
        throw new Error(errData.message || "Gagal mengirim laporan");
      }
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setImageUrl("");
      setAnonim(false);
    } catch (err: any) {
      toast({ title: "Gagal mengirim", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4fa] to-[#f7f9fb] font-['Inter',Helvetica]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-[#001e40] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png?v=2" alt="" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-sm font-bold text-[#001e40]">PUTIK CEMERLANG</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#001e40] via-[#003366] to-[#00539b] py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-widest uppercase">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Zona Integritas — Menuju WBK/WBBM
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Pelaporan Gratifikasi
            </h1>
            <p className="mx-auto max-w-2xl text-base text-blue-100">
              Sarana pelaporan gratifikasi bagi Aparatur Sipil Negara (ASN) di lingkungan Cabang Dinas Kelautan dan Perikanan Kabupaten Malang, sesuai ketentuan KPK RI dan standar Zona Integritas.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
          {[
            { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, title: "Wajib Dilaporkan", desc: "Setiap penerimaan gratifikasi wajib dilaporkan dalam 30 hari kerja." },
            { icon: <Lock className="h-5 w-5 text-blue-500" />, title: "Kerahasiaan Terjaga", desc: "Identitas pelapor dilindungi dan dijaga kerahasiaannya." },
            { icon: <Clock className="h-5 w-5 text-amber-500" />, title: "30 Hari Kerja", desc: "Batas waktu pelaporan 30 hari kerja sejak penerimaan gratifikasi." },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
              <Card className="h-full rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">{c.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#001e40]">{c.title}</p>
                    <p className="text-xs text-[#5f5e5e] mt-1">{c.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Dasar Hukum */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mb-8 rounded-xl border border-amber-200 bg-amber-50">
            <CardContent className="flex gap-3 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Dasar Hukum Pelaporan Gratifikasi</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>UU No. 20 Tahun 2001 tentang Pemberantasan Tindak Pidana Korupsi</li>
                  <li>Peraturan KPK No. 2 Tahun 2019 tentang Pelaporan Gratifikasi</li>
                  <li>Permenpan-RB No. 60 Tahun 2012 tentang Pedoman Pembangunan ZI</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success State */}
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-xl border border-emerald-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-[#001e40]">Laporan Berhasil Dikirim!</h2>
                <p className="mb-6 max-w-md text-sm text-[#5f5e5e]">
                  Laporan gratifikasi Anda telah diterima dan akan segera diproses oleh Tim Unit Pengendalian Gratifikasi (UPG). Terima kasih atas komitmen Anda terhadap integritas.
                </p>
                <Button onClick={() => setSubmitted(false)} className="bg-[#001e40] text-white hover:bg-[#001e40]/90">
                  Buat Laporan Baru
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Form */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#003366]" />
                  <h2 className="text-base font-bold text-[#001e40]">Formulir Pelaporan Gratifikasi</h2>
                </div>
                <p className="mt-1 text-xs text-[#5f5e5e]">Semua kolom bertanda <span className="text-red-500 font-medium">*</span> wajib diisi.</p>
              </div>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Opsi Anonim */}
                  <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <Checkbox id="anonim" checked={anonim} onCheckedChange={(v) => setAnonim(!!v)} className="mt-0.5" />
                    <div>
                      <Label htmlFor="anonim" className="cursor-pointer text-sm font-semibold text-[#001e40]">Laporkan Secara Anonim</Label>
                      <p className="text-xs text-[#5f5e5e] mt-0.5">Identitas Anda tidak akan disimpan dalam sistem. Anda tetap wajib mengisi informasi unit kerja dan kronologi.</p>
                    </div>
                  </div>

                  {/* Seksi A: Data Pelapor */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">A</span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#003366]">Data Pelapor</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {!anonim && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input id="nama" placeholder="Nama lengkap ASN" value={form.nama} onChange={(e) => handleChange("nama", e.target.value)} className="border-slate-200" disabled={anonim} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nip">NIP <span className="text-red-500">*</span></Label>
                            <Input id="nip" placeholder="NIP 18 digit" value={form.nip} onChange={(e) => handleChange("nip", e.target.value)} className="border-slate-200" maxLength={18} disabled={anonim} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telepon">No. Telepon <span className="text-red-500">*</span></Label>
                            <Input id="telepon" placeholder="08xx-xxxx-xxxx" value={form.telepon} onChange={(e) => handleChange("telepon", e.target.value)} className="border-slate-200" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Dinas</Label>
                            <Input id="email" type="email" placeholder="nama@malangkab.go.id" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="border-slate-200" />
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan <span className="text-red-500">*</span></Label>
                        <Input id="jabatan" placeholder="Jabatan saat ini" value={form.jabatan} onChange={(e) => handleChange("jabatan", e.target.value)} className="border-slate-200" disabled={anonim} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitKerja">Unit Kerja <span className="text-red-500">*</span></Label>
                        <Input id="unitKerja" placeholder="Nama unit/bidang/seksi" value={form.unitKerja} onChange={(e) => handleChange("unitKerja", e.target.value)} className="border-slate-200" />
                      </div>
                    </div>
                  </div>

                  {/* Seksi B: Data Gratifikasi */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">B</span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#003366]">Data Gratifikasi</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="tanggalPenerimaan">Tanggal Penerimaan <span className="text-red-500">*</span></Label>
                        <Input id="tanggalPenerimaan" type="date" value={form.tanggalPenerimaan} onChange={(e) => handleChange("tanggalPenerimaan", e.target.value)} className="border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <Label>Jenis Gratifikasi <span className="text-red-500">*</span></Label>
                        <Select value={form.jenisGratifikasi} onValueChange={(v) => handleChange("jenisGratifikasi", v)}>
                          <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                          <SelectContent>{jenisGratifikasiList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nilaiGratifikasi">Perkiraan Nilai <span className="text-red-500">*</span></Label>
                        <Input id="nilaiGratifikasi" placeholder="Contoh: Rp 500.000 atau Tas senilai ±Rp 1.000.000" value={form.nilaiGratifikasi} onChange={(e) => handleChange("nilaiGratifikasi", e.target.value)} className="border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pemberGratifikasi">Nama / Instansi Pemberi <span className="text-red-500">*</span></Label>
                        <Input id="pemberGratifikasi" placeholder="Nama lengkap atau nama perusahaan" value={form.pemberGratifikasi} onChange={(e) => handleChange("pemberGratifikasi", e.target.value)} className="border-slate-200" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Hubungan Pelapor dengan Pemberi <span className="text-red-500">*</span></Label>
                        <Select value={form.hubunganPemberi} onValueChange={(v) => handleChange("hubunganPemberi", v)}>
                          <SelectTrigger className="border-slate-200"><SelectValue placeholder="Pilih hubungan" /></SelectTrigger>
                          <SelectContent>{hubunganPemberiList.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Seksi C: Kronologi */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">C</span>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#003366]">Kronologi & Bukti</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kronologi">Kronologi Penerimaan <span className="text-red-500">*</span></Label>
                        <Textarea
                          id="kronologi"
                          placeholder="Jelaskan secara rinci: kapan, di mana, bagaimana gratifikasi diterima, dan konteks pemberian..."
                          rows={5}
                          value={form.kronologi}
                          onChange={(e) => handleChange("kronologi", e.target.value)}
                          className="border-slate-200 resize-none"
                        />
                        <p className="text-xs text-[#5f5e5e] flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Semakin detail keterangan Anda, semakin mudah tim UPG memproses laporan ini.
                        </p>
                      </div>

                      {/* Upload Bukti */}
                      <div className="space-y-2">
                        <Label>Bukti / Dokumentasi (opsional)</Label>
                        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
                        <div
                          onClick={() => fileRef.current?.click()}
                          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
                            imageUrl ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-[#003366] hover:bg-blue-50/30"
                          }`}
                        >
                          {imageUrl ? (
                            <>
                              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                              <p className="text-sm font-medium text-emerald-700">Bukti berhasil diunggah ✓</p>
                              <button
                                type="button"
                                onClick={(ev) => { ev.stopPropagation(); setImageUrl(""); }}
                                className="text-xs text-slate-500 hover:text-red-500 underline"
                              >Hapus & upload ulang</button>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-slate-400" />
                              <p className="text-sm font-medium text-slate-600">
                                {uploading ? "Sedang mengunggah…" : "Klik untuk pilih file"}
                              </p>
                              <p className="text-xs text-slate-400">JPG, PNG, atau PDF — Maks. 5 MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pernyataan */}
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
                    <p className="font-semibold mb-1">Pernyataan Pelapor</p>
                    <p>Dengan mengirimkan formulir ini, saya menyatakan bahwa informasi yang saya berikan adalah benar dan dapat dipertanggungjawabkan. Saya memahami bahwa pelaporan gratifikasi adalah kewajiban ASN sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full rounded-lg bg-[#001e40] py-3 text-sm font-semibold text-white hover:bg-[#003366] transition-all"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Mengirim Laporan…" : "Kirim Laporan Gratifikasi"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-[#001428] px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-400">
          © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
