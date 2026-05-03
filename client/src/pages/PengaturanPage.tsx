import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function PengaturanPage() {
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
          className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
        >
          Simpan Perubahan
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
                  defaultValue="Admin Putik Cemerlang"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Email Admin
                </label>
                <Input
                  data-testid="input-email-admin"
                  defaultValue="admin@putik-cemerlang.malangkab.go.id"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Jabatan
                </label>
                <Input
                  data-testid="input-jabatan"
                  defaultValue="Kepala Bidang Informasi Maritim"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  No. Telepon
                </label>
                <Input
                  data-testid="input-telepon"
                  defaultValue="+62 341 000 0000"
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
                  defaultValue="Putik Cemerlang"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Instansi
                </label>
                <Input
                  data-testid="input-instansi"
                  defaultValue="Dinas Kelautan & Perikanan Kabupaten Malang"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Alamat Instansi
                </label>
                <Input
                  data-testid="input-alamat"
                  defaultValue="Jl. Panji No. 158, Kepanjen, Kabupaten Malang"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                  Email Kontak Publik
                </label>
                <Input
                  data-testid="input-email-publik"
                  defaultValue="info@dkp.malangkab.go.id"
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
                  placeholder="••••••••"
                  className="rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
                />
              </div>
            </div>
            <Separator className="my-5 bg-slate-100" />
            <Button
              data-testid="button-ganti-sandi"
              variant="outline"
              className="rounded-lg border-[#001e40] text-[#001e40] hover:bg-slate-50 [font-family:'Inter',Helvetica] text-sm"
            >
              Ganti Kata Sandi
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
