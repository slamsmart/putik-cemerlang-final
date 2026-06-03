import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import {
  Building,
  ShieldCheck,
  Info,
  Anchor,
  ArrowRight,
  User,
  Phone,
  Building2,
  Calendar,
  Send,
} from "lucide-react";

import { useState, useEffect } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

export default function BukuTamuPublicPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAntiGratifikasi, setAgreeAntiGratifikasi] = useState(false);
  const { toast } = useToast();
  const createGuestbook = useConvexMutation(api.guestbook.create);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [formData, setFormData] = useState({
    nama: "",
    nomor: "",
    instansi: "",
    tanggal: "",
    tujuan: "",
    pesan: "",
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.nama || !formData.nomor || !formData.tanggal || !formData.tujuan || !formData.pesan) {
      toast({ title: "Mohon lengkapi semua field wajib", variant: "destructive" });
      return;
    }
    if (!agreeTerms) {
      toast({ title: "Harap centang persetujuan Kebijakan Privasi", variant: "destructive" });
      return;
    }
    if (!agreeAntiGratifikasi) {
      toast({ title: "Harap centang pernyataan Anti Gratifikasi", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date(formData.tanggal);
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const formattedDate = `${today.getDate().toString().padStart(2, '0')} ${months[today.getMonth()]} ${today.getFullYear()}`;

      await createGuestbook({
        nama: formData.nama,
        email: formData.nomor,
        pekerjaan: formData.instansi || formData.tujuan,
        pesan: formData.pesan,
        tanggal: formattedDate,
        status: "Belum Dibalas",
      });
      setIsSubmitted(true);
      toast({ title: "Formulir berhasil dikirim! Terima kasih.", description: "Silakan download Sertifikat Anti Gratifikasi Anda." });
    } catch (err) {
      toast({ title: "Terjadi kesalahan. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSertifikat = async () => {
    const visitorNameInput = document.getElementById("input-nama") as HTMLInputElement;
    const visitorName = visitorNameInput?.value?.trim() || formData.nama || "NAMA PENGUNJUNG";

    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Embed Cinzel Medium font (client/public/fonts/Cinzel-Medium.ttf)
    let cinzelLoaded = false;
    try {
      const fontRes = await fetch("/fonts/Cinzel-Medium.ttf");
      if (fontRes.ok) {
        const fontBuf = await fontRes.arrayBuffer();
        const uint8 = new Uint8Array(fontBuf);
        let binary = "";
        uint8.forEach((b) => { binary += String.fromCharCode(b); });
        const fontBase64 = btoa(binary);
        doc.addFileToVFS("Cinzel-Medium.ttf", fontBase64);
        doc.addFont("Cinzel-Medium.ttf", "Cinzel", "normal");
        cinzelLoaded = true;
      }
    } catch (_) { }

    const generateContent = () => {
      // Nama pengunjung — Cinzel Medium size 33
      doc.setFont(cinzelLoaded ? "Cinzel" : "helvetica", cinzelLoaded ? "normal" : "bold");
      doc.setFontSize(33);
      doc.setTextColor(0, 0, 0);
      doc.text(visitorName.toUpperCase(), width / 2, 95, { align: "center" });

      // Tanggal — Times Bold size 16
      doc.setFont("times", "bold");
      doc.setFontSize(16);

      const date = new Date();
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const dateString = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

      doc.text(dateString, width / 2 + 5, 134, { align: "center" });

      doc.save(`Sertifikat_Anti_Gratifikasi_${visitorName.replace(/\s+/g, "_")}.pdf`);
    };

    // Load background image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/figmaAssets/sertifikat-bg.jpg";
    img.onload = () => {
      doc.addImage(img, "JPEG", 0, 0, width, height);
      generateContent();
    };
    img.onerror = () => {
      generateContent();
    };
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-['Inter',Helvetica] overflow-x-hidden min-h-screen">
      <PublicNavbar />

      <main className="pt-20 pb-24" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23003366' fill-opacity='0.05' d='M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,112C672,107,768,149,864,154.7C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\")",
        backgroundPosition: "bottom",
        backgroundRepeat: "no-repeat"
      }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Section for Guestbook */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-16">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c6e7ff] text-[#004c6b] text-sm font-medium mb-6">
                <Building className="w-[18px] h-[18px]" />
                Portal Resmi Cabdin KP Kab. Malang
              </div>
              <h1 className="font-['Public_Sans',Helvetica] text-5xl font-bold text-[#001e40] mb-6 tracking-tight">Buku Tamu Layanan</h1>
              <p className="text-lg text-[#43474f] max-w-2xl leading-relaxed">
                Selamat datang di Portal Resmi Informasi Kami. Silakan isi formulir kunjungan Anda untuk dokumentasi dan peningkatan kualitas layanan.
              </p>
            </div>
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-[#c3c6d1]">
                <img className="w-full h-full object-cover" alt="Keamanan Data Buku Tamu" src="/figmaAssets/buku-tamu-hero.jpg" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg border border-slate-200 shadow-md hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#003366] flex items-center justify-center text-[#799dd6]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#001e40]">Keamanan Data</p>
                    <p className="text-xs text-[#43474f]">Terenkripsi &amp; Terlindungi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Submission Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Information Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-semibold text-[#001e40] mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-[#00374f]" />
                  Panduan
                </h3>
                <ul className="space-y-4 text-base text-[#43474f]">
                  <li className="flex gap-3">
                    <span className="font-bold text-[#001e40]">01</span>
                    <span>Isi data diri dengan lengkap sesuai kartu identitas resmi.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-[#001e40]">02</span>
                    <span>Pilih instansi asal jika Anda mewakili organisasi atau lembaga.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-[#001e40]">03</span>
                    <span>Sampaikan maksud dan tujuan kunjungan secara spesifik.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#003366] p-6 rounded-xl text-white shadow-md relative overflow-hidden">
                <Anchor className="w-32 h-32 absolute -right-4 -bottom-4 opacity-10" />
                <h4 className="text-xl font-semibold mb-2">Butuh Bantuan?</h4>
                <p className="text-blue-100 text-sm mb-6">Petugas kami siap membantu jika Anda mengalami kesulitan dalam pengisian formulir.</p>
                <a
                  className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:text-white transition-colors"
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=cabangdinasmalang@gmail.com&su=${encodeURIComponent("Permohonan Bantuan – Pengisian Formulir Buku Tamu Dinas Kelautan & Perikanan Kab. Malang")}&body=${encodeURIComponent(`Yth. Petugas Helpdesk Dinas Kelautan & Perikanan Kabupaten Malang,\n\nDengan hormat, saya mengalami kesulitan dalam pengisian formulir Buku Tamu Dinas Kelautan & Perikanan Kabupaten Malang. Mohon bantuan dan panduan teknis dari petugas helpdesk agar saya dapat menyelesaikan pengisian formulir dengan benar.\n\nAtas perhatian dan bantuannya, saya ucapkan terima kasih.\n\nHormat saya,\n\n[Nama Lengkap]\n[No. Telepon]`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hubungi Helpdesk
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right: The Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-medium text-[#5f5e5e] uppercase tracking-widest">Formulir Kunjungan</span>
                  <span className="text-xs text-[#43474f] italic">* Wajib Diisi</span>
                </div>
                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#191c1e]">Nama Lengkap *</label>
                      <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-3 text-[#737780]" />
                        <input id="input-nama" className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all" placeholder="Masukkan nama sesuai KTP" type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#191c1e]">Nomor Kontak / WhatsApp *</label>
                      <div className="relative">
                        <Phone className="w-5 h-5 absolute left-3 top-3 text-[#737780]" />
                        <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all" placeholder="0812xxxx" type="tel" value={formData.nomor} onChange={(e) => setFormData({ ...formData, nomor: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#191c1e]">Instansi / Organisasi</label>
                      <div className="relative">
                        <Building2 className="w-5 h-5 absolute left-3 top-3 text-[#737780]" />
                        <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all" placeholder="Nama instansi (opsional)" type="text" value={formData.instansi} onChange={(e) => setFormData({ ...formData, instansi: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#191c1e]">Tanggal Kunjungan *</label>
                      <div className="relative">
                        <Calendar className="w-5 h-5 absolute left-3 top-3 text-[#737780]" />
                        <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all" type="date" value={formData.tanggal} onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#191c1e]">Tujuan Kunjungan *</label>
                    <select className="w-full px-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]" style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23737780%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')" }} value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} required>
                      <option value="">Pilih Tujuan</option>
                      <option>Konsultasi Data Kemaritiman</option>
                      <option>Koordinasi Instansi</option>
                      <option>Penelitian / Riset Akademik</option>
                      <option>Kunjungan Kedinasan</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#191c1e]">Pesan / Keterangan Tambahan *</label>
                    <textarea className="w-full px-4 py-3 rounded-lg border border-[#c3c6d1] focus:border-[#001e40] focus:ring-1 focus:ring-[#001e40] outline-none transition-all" placeholder="Tuliskan pesan atau maksud detail kedatangan Anda..." rows={4} value={formData.pesan} onChange={(e) => setFormData({ ...formData, pesan: e.target.value })} required></textarea>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${agreeTerms ? 'bg-blue-50 border-[#003366]/40' : 'bg-[#f2f4f6] border-[#c3c6d1]/30'}`}>
                      <input
                        className="mt-1 w-4 h-4 rounded border-[#737780] text-[#001e40] focus:ring-[#001e40] cursor-pointer"
                        id="terms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <label className="text-sm text-[#43474f] cursor-pointer" htmlFor="terms">
                        Saya menyatakan bahwa data yang saya masukkan adalah benar dan dapat dipertanggungjawabkan. Saya setuju data ini digunakan untuk kepentingan administrasi sesuai dengan <a className="text-[#003366] font-semibold underline" href="#">Kebijakan Privasi</a>. <span className="text-red-500 font-bold">*</span>
                      </label>
                    </div>
                    <div className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${agreeAntiGratifikasi ? 'bg-green-50 border-green-500/40' : 'bg-[#f2f4f6] border-[#c3c6d1]/30'}`}>
                      <input
                        className="mt-1 w-4 h-4 rounded border-[#737780] text-[#001e40] focus:ring-[#001e40] cursor-pointer"
                        id="anti-gratifikasi"
                        type="checkbox"
                        checked={agreeAntiGratifikasi}
                        onChange={(e) => setAgreeAntiGratifikasi(e.target.checked)}
                      />
                      <label className="text-sm text-[#43474f] cursor-pointer" htmlFor="anti-gratifikasi">
                        <span className="font-semibold text-green-700">Pernyataan Anti Gratifikasi:</span> Saya mendukung anti gratifikasi dan layanan yang telah diberikan adalah gratis serta bebas dari korupsi, kolusi, dan nepotisme. <span className="text-red-500 font-bold">*</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    {!isSubmitted ? (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-[#001e40] text-white font-semibold py-4 rounded-lg shadow-md hover:bg-[#003366] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Kirim Data
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleDownloadSertifikat}
                          className="flex-1 bg-green-600 text-white font-semibold py-4 rounded-lg shadow-md hover:bg-green-700 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                          type="button"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          Download Sertifikat Anti Gratifikasi
                        </button>
                        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                          <p className="text-sm text-green-700 font-medium">Data berhasil dikirim! Terima kasih atas kunjungan Anda.</p>
                        </div>
                      </>
                    )}
                    <button
                      className="px-8 py-4 border border-[#c3c6d1] text-[#5f5e5e] font-semibold rounded-lg hover:bg-[#eceef0] transition-all"
                      type="reset"
                      onClick={() => {
                        setIsSubmitted(false);
                        setAgreeTerms(false);
                        setAgreeAntiGratifikasi(false);
                      }}
                    >
                      Bersihkan Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#001428] px-8 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <h3 className="mb-3 text-lg font-bold uppercase">PUTIK CEMERLANG</h3>
              <p className="text-sm leading-relaxed text-slate-400 text-justify">
                Pusat Informasi Kelautan Cabang Dinas Kelautan dan Perikanan Malang yang menyediakan data dan informasi kelautan untuk mendukung pelayanan publik, memudahkan akses informasi bagi masyarakat dan pemangku kepentingan secara cepat, akurat, dan informatif.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-slate-400">
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Peta Situs", "Hubungi Kami"].map((l) => (
                <a key={l} href="#" className="transition-colors hover:text-white">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-slate-700 pt-6 text-center md:text-left">
            <p className="text-sm text-slate-500">
              © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
