import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const heroSliders = [
  {
    image: "/figmaAssets/background.svg",
    headline: "Pelayanan Informasi Maritim Terpadu",
    subheadline:
      "Akses data kelautan dan perikanan\nKabupaten Malang secara transparan\ndan akuntabel.",
    cta: "Pelajari Selengkapnya",
    link: "/layanan",
  },
  {
    image: "/figmaAssets/background-2.svg",
    headline: "Modernisasi Sektor Perikanan",
    subheadline:
      "Mendukung nelayan lokal dengan\nteknologi dan informasi data laut\nterkini.",
    cta: "Lihat Program",
    link: "/program",
  },
  {
    image: "/figmaAssets/background-1.svg",
    headline: "Konservasi Ekosistem Laut",
    subheadline:
      "Bersama menjaga kelestarian laut\nMalang untuk generasi yang akan\ndatang.",
    cta: "Gabung Relawan",
    link: "/konservasi",
  },
];

const generalContents = [
  {
    icon: "/figmaAssets/container-6.svg",
    label: "Running Text",
  },
  {
    icon: "/figmaAssets/container-9.svg",
    label: "FAQ Section",
  },
  {
    icon: "/figmaAssets/container-12.svg",
    label: "Marine Alerts",
  },
];

export const MainSubsection = (): JSX.Element => {
  return (
    <main className="flex w-[calc(100%_-_256px)] min-h-[1690px] flex-col items-start gap-10 px-10 pb-[368px] pt-10 absolute left-64 top-0">
      <header className="flex w-full items-end justify-between bg-transparent">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col items-start">
            <h1 className="mt-[-1.00px] flex h-5 items-center [font-family:'Public_Sans',Helvetica] text-base font-normal leading-5 tracking-[0] text-[#001e40] whitespace-nowrap">
              Konten &amp; Slider
            </h1>
          </div>
          <p className="mt-[-1.00px] flex h-6 w-[501.48px] items-center [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#5f5e5e] whitespace-nowrap">
            Kelola visual utama dan metadata informasi situs Putik Cemerlang.
          </p>
        </div>
        <Button className="h-auto rounded-lg bg-[#001e40] px-12 pb-[12.5px] pt-[11.5px] shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90">
          <img
            className="relative flex-[0_0_auto]"
            alt="Container"
            src="/figmaAssets/container-13.svg"
          />
          <span className="flex h-6 w-[140.34px] items-center justify-center [font-family:'Public_Sans',Helvetica] text-base font-normal leading-6 tracking-[0] text-white whitespace-nowrap">
            Simpan Perubahan
          </span>
        </Button>
      </header>
      <section className="grid h-fit grid-cols-12 gap-6">
        <Card className="col-[1_/_9] rounded-xl border border-solid border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <h2 className="mt-[-1.00px] flex h-6 items-center [font-family:'Public_Sans',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#001e40] whitespace-nowrap">
                Manajemen Hero Slider
              </h2>
              <Badge className="rounded-full bg-[#c6e7ff] px-3 py-1 [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0.60px] text-[#001e2d] hover:bg-[#c6e7ff]">
                AKTIF: 3 BANNER
              </Badge>
            </div>
            <div className="flex flex-col gap-6">
              {heroSliders.map((slider, index) => (
                <article
                  key={`hero-slider-${index}`}
                  className="flex items-start gap-6 rounded-lg border border-solid border-slate-200 bg-white p-4"
                >
                  <img
                    className="h-32 w-48 shrink-0"
                    alt="Background"
                    src={slider.image}
                  />
                  <div className="flex flex-1 flex-col items-start gap-3 self-stretch">
                    <div className="grid h-fit grid-cols-2 gap-4">
                      <div className="col-[1_/_3] flex flex-col items-start gap-1">
                        <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                          Headline Utama
                        </label>
                        <Input
                          defaultValue={slider.headline}
                          className="h-auto rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e]"
                        />
                      </div>
                      <div className="col-[1_/_3] flex flex-col items-start gap-1">
                        <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                          Sub-headline
                        </label>
                        <Textarea
                          defaultValue={slider.subheadline}
                          className="min-h-[83px] rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e] resize-none"
                        />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                          Teks Tombol (CTA)
                        </label>
                        <Input
                          defaultValue={slider.cta}
                          className="h-auto rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e]"
                        />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                          Link Tujuan
                        </label>
                        <Input
                          defaultValue={slider.link}
                          className="h-auto rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e]"
                        />
                      </div>
                    </div>
                    <div className="flex w-full items-start justify-end pt-2">
                      <Button
                        variant="ghost"
                        className="h-auto gap-1 p-0 text-[#ba1a1a] hover:bg-transparent hover:text-[#ba1a1a]"
                      >
                        <img
                          className="relative flex-[0_0_auto]"
                          alt="Container"
                          src="/figmaAssets/container-1.svg"
                        />
                        <span className="mt-[-1.00px] flex h-6 w-[48.58px] items-center justify-center [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-center whitespace-nowrap">
                          Hapus
                        </span>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}

              <Button
                variant="ghost"
                className="h-auto w-full justify-center gap-[7.99px] rounded-lg border-2 border-dashed border-slate-200 px-0 py-4 text-[#5f5e5e] hover:bg-slate-50"
              >
                <img
                  className="relative flex-[0_0_auto]"
                  alt="Container"
                  src="/figmaAssets/container-11.svg"
                />
                <span className="flex h-6 w-[158.2px] items-center justify-center [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-center whitespace-nowrap">
                  Tambah Banner Baru
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <aside className="col-[9_/_13] flex h-fit flex-col items-start gap-6">
          <Card className="w-full rounded-xl border border-solid border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-6 p-6">
              <h2 className="mt-[-1.00px] flex items-center self-stretch [font-family:'Public_Sans',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#001e40]">
                Metadata Situs
              </h2>
              <div className="flex flex-col gap-[15px]">
                <div className="flex flex-col gap-1">
                  <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                    Meta Title
                  </label>
                  <Input
                    defaultValue="Putik Cemerlang | Kab. Malang"
                    className="h-auto rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e]"
                  />
                  <p className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-[10px] font-normal leading-[15px] tracking-[0] text-slate-400">
                    Disarankan 50-60 karakter.
                  </p>
                </div>
                <div className="flex flex-col gap-1 pt-px">
                  <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                    Meta Description
                  </label>
                  <Textarea
                    defaultValue={
                      "Portal pusat informasi\nmaritim resmi Kabupaten\nMalang untuk pelayanan\npublik, data perikanan, dan\nedukasi konservasi laut."
                    }
                    className="min-h-[115px] rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e] resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="mt-[-1.00px] flex items-center self-stretch [font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
                    Keywords (SEO)
                  </label>
                  <Input
                    defaultValue="maritim, malang, perikanan, informasi laut"
                    className="h-auto rounded-md border-slate-200 bg-white px-3 py-2 [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#191c1e]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full rounded-xl border-0 bg-[#003366] shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img
                  className="h-[25px] w-[25px] shrink-0"
                  alt="Icon"
                  src="/figmaAssets/icon.svg"
                />
                <div className="inline-flex flex-col items-start gap-[6.75px]">
                  <h3 className="mt-[-1.00px] flex h-6 w-[164.42px] items-center [font-family:'Inter',Helvetica] text-base font-bold leading-6 tracking-[0] text-white whitespace-nowrap">
                    Tip Optimasi Gambar
                  </h3>
                  <p className="mt-[-1.00px] w-[203.08px] [font-family:'Inter',Helvetica] text-sm font-normal leading-[22.8px] tracking-[0] text-[#799dd6] opacity-90">
                    Gunakan gambar dengan rasio
                    <br />
                    16:9 dan resolusi minimal
                    <br />
                    1920x1080px untuk hasil
                    <br />
                    terbaik pada slider utama.
                    <br />
                    Pastikan ukuran file di bawah
                    <br />
                    500KB untuk kecepatan
                    <br />
                    akses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full rounded-xl border border-solid border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
            <CardContent className="flex flex-col gap-6 p-6">
              <h2 className="mt-[-1.00px] flex items-center self-stretch [font-family:'Public_Sans',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#001e40]">
                Konten General
              </h2>
              <div className="flex flex-col gap-4">
                {generalContents.map((item, index) => (
                  <button
                    key={`general-content-${index}`}
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                  >
                    <span className="inline-flex items-center gap-[11.99px]">
                      <img
                        className="relative flex-[0_0_auto]"
                        alt="Container"
                        src={item.icon}
                      />
                      <span className="mt-[-1.00px] flex h-5 items-center [font-family:'Inter',Helvetica] text-sm font-medium leading-5 tracking-[0] text-[#191c1e] whitespace-nowrap">
                        {item.label}
                      </span>
                    </span>
                    <span className="mt-[-1.00px] flex h-6 items-center justify-center [font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0] text-[#3a5f94] whitespace-nowrap">
                      Edit
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
};
