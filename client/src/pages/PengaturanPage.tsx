import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";

export default function PengaturanPage() {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const settings = useConvexQuery(api.settings.getAll);
  const setMultipleSettings = useConvexMutation(api.settings.setMultiple);

  // Settings state
  const [formData, setFormData] = useState({
    namaLengkap: "Admin Putik Cemerlang",
    emailAdmin: "admin@putik-cemerlang.malangkab.go.id",
    jabatan: "Kepala Bidang Informasi Maritim",
    telepon: "+62 341 000 0000",
    namaPortal: "Putik Cemerlang",
    instansi: "Dinas Kelautan & Perikanan Kabupaten Malang",
    alamat: "Jl. Panji No. 158, Kepanjen, Kabupaten Malang",
    emailPublik: "info@dkp.malangkab.go.id"
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load from Convex
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        namaLengkap: settings.namaLengkap || prev.namaLengkap,
        emailAdmin: settings.emailAdmin || prev.emailAdmin,
        jabatan: settings.jabatan || prev.jabatan,
        telepon: settings.telepon || prev.telepon,
        namaPortal: settings.namaPortal || prev.namaPortal,
        instansi: settings.instansi || prev.instansi,
        alamat: settings.alamat || prev.alamat,
        emailPublik: settings.emailPublik || prev.emailPublik,
      }));
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await setMultipleSettings({ settings: formData });
      toast({ title: "Pengaturan berhasil disimpan!" });
    } catch (err: any) {
      toast({ title: "Gagal menyimpan pengaturan", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = useConvexMutation(api.settings.updatePassword);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "Semua kolom kata sandi harus diisi", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Kata sandi baru tidak cocok", variant: "destructive" });
      return;
    }
    
    setIsUpdating(true);
    try {
      await updatePassword({ oldPassword, newPassword });
      toast({ title: "Kata sandi berhasil diubah!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: err.message || "Gagal mengubah kata sandi", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Pengaturan
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola konfigurasi sistem dan profil admin portal Putik Cemerlang.
          </p>
        </div>
        <Button
          data-testid="button-simpan-pengaturan"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </header>

      <div className="flex flex-col gap-6">
        {/* Profil Admin */}
        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
              Profil Administrator
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Nama Lengkap
                </label>
                <Input
                  data-testid="input-nama-admin"
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Email Admin
                </label>
                <Input
                  data-testid="input-email-admin"
                  value={formData.emailAdmin}
                  onChange={(e) => setFormData({ ...formData, emailAdmin: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Jabatan
                </label>
                <Input
                  data-testid="input-jabatan"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  No. Telepon
                </label>
                <Input
                  data-testid="input-telepon"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Portal */}
        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
              Informasi Portal
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Nama Portal
                </label>
                <Input
                  data-testid="input-nama-portal"
                  value={formData.namaPortal}
                  onChange={(e) => setFormData({ ...formData, namaPortal: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Instansi
                </label>
                <Input
                  data-testid="input-instansi"
                  value={formData.instansi}
                  onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Alamat Instansi
                </label>
                <Input
                  data-testid="input-alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Email Kontak Publik
                </label>
                <Input
                  data-testid="input-email-publik"
                  value={formData.emailPublik}
                  onChange={(e) => setFormData({ ...formData, emailPublik: e.target.value })}
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keamanan */}
        <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6">
            <h2 className="mb-5 text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
              Keamanan & Kata Sandi
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Kata Sandi Saat Ini
                </label>
                <Input
                  data-testid="input-sandi-lama"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div />
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Kata Sandi Baru
                </label>
                <Input
                  data-testid="input-sandi-baru"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Konfirmasi Kata Sandi Baru
                </label>
                <Input
                  data-testid="input-sandi-konfirmasi"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
            </div>
            <Separator className="my-5 bg-slate-100" />
            <Button
              data-testid="button-ganti-sandi"
              variant="outline"
              onClick={handleUpdatePassword}
              disabled={isUpdating}
              className="rounded-lg border-[#001e40] text-[#001e40] hover:bg-slate-50 [font-family:'Inter',Helvetica] text-sm"
            >
              {isUpdating ? "Menyimpan..." : "Ganti Kata Sandi"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Sistem */}
        <Card className="rounded-xl border-0 bg-[#003366] shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img src="/figmaAssets/icon.svg" alt="" className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="mb-2 text-sm font-bold text-white [font-family:'Inter',Helvetica]">
                  Informasi Sistem
                </h3>
                <div className="grid grid-cols-3 gap-4 text-xs text-[#799dd6]">
                  <div>
                    <span className="block font-medium text-white/80">Versi Sistem</span>
                    v2.4.1
                  </div>
                  <div>
                    <span className="block font-medium text-white/80">Backup Terakhir</span>
                    03 Mei 2024, 03:00 WIB
                  </div>
                  <div>
                    <span className="block font-medium text-white/80">Status Server</span>
                    <span className="text-green-400">● Online</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
