import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const footerLinks = [
  "Kebijakan Privasi",
  "Syarat & Ketentuan",
  "Peta Situs",
  "Hubungi Kami",
];

export const FooterSubsection = (): JSX.Element => {
  return (
    <footer className="relative flex w-[calc(100%_-_256px)] flex-col items-start gap-12 border-t border-[#ffffff1a] bg-blue-950 px-10 py-12">
      <Card className="w-full max-w-screen-xl border-0 bg-transparent p-0 shadow-none">
        <CardContent className="grid w-full grid-cols-1 gap-10 p-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:justify-between">
          <section className="flex max-w-xs flex-col items-start gap-[14.75px]">
            <header className="w-full">
              <h2 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 tracking-[0] text-white">
                PUTIK CEMERLANG
              </h2>
            </header>
            <p className="w-[298.11px] [font-family:'Inter',Helvetica] text-sm font-normal leading-[22.8px] tracking-[0] text-slate-300">
              Sistem Informasi Maritim Terpadu Kabupaten
              <br />
              Malang. Mewujudkan tata kelola laut yang
              <br />
              transparan dan berkelanjutan.
            </p>
          </section>
          <nav aria-label="Footer navigation" className="w-fit">
            <ul className="grid w-fit grid-cols-2 grid-rows-2 gap-x-16 gap-y-4">
              {footerLinks.map((link) => (
                <li key={link} className="w-fit">
                  <Button
                    variant="link"
                    className="h-auto p-0 [font-family:'Inter',Helvetica] text-sm font-normal leading-5 tracking-[0] text-slate-300 no-underline hover:text-white hover:no-underline"
                  >
                    {link}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </CardContent>
      </Card>
      <img
        className="pointer-events-none absolute bottom-[-200px] right-[-150px] h-[200px] w-[450px]"
        alt="Container"
        src="/figmaAssets/container-5.svg"
      />
      <Card className="w-full max-w-screen-xl border-0 border-t border-[#ffffff1a] bg-transparent pt-8 shadow-none">
        <CardContent className="p-0">
          <p className="[font-family:'Inter',Helvetica] text-sm font-normal leading-5 tracking-[0] text-slate-400">
            © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
          </p>
        </CardContent>
      </Card>
    </footer>
  );
};
