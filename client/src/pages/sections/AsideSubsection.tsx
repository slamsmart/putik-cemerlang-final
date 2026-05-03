import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const primaryNavItems = [
  {
    label: "Dashboard",
    icon: "/figmaAssets/container-14.svg",
    active: false,
  },
  {
    label: "Buku Tamu",
    icon: "/figmaAssets/container-3.svg",
    active: false,
  },
  {
    label: "Arsip Surat",
    icon: "/figmaAssets/container-4.svg",
    active: false,
  },
  {
    label: "Konten & Slider",
    icon: "/figmaAssets/container-2.svg",
    active: true,
  },
];

const secondaryNavItems = [
  {
    label: "Pengaturan",
    icon: "/figmaAssets/container-8.svg",
  },
  {
    label: "Keluar",
    icon: "/figmaAssets/container.svg",
  },
];

export const AsideSubsection = (): JSX.Element => {
  return (
    <aside className="flex h-[1690px] w-64 flex-col justify-between border-r border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col">
        <header className="flex w-full flex-col px-4 pb-10">
          <h1 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 tracking-[0] text-blue-900">
            PUTIK CEMERLANG
          </h1>
          <p className="[font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
            Admin Portal - Malang
          </p>
        </header>
        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-2"
        >
          {primaryNavItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              className={`h-auto w-full justify-start gap-3 px-4 py-3 ${
                item.active
                  ? "rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-50 hover:text-blue-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <img
                className="shrink-0"
                alt=""
                aria-hidden="true"
                src={item.icon}
              />
              <span
                className={`[font-family:'Inter',Helvetica] text-base leading-6 tracking-[0] ${
                  item.active ? "font-bold" : "font-normal"
                }`}
              >
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex w-full flex-col gap-2 pt-4">
        <Separator className="bg-slate-200" />
        <nav aria-label="Secondary navigation" className="flex flex-col gap-2">
          {secondaryNavItems.map((item) => (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
            >
              <img
                className="shrink-0"
                alt=""
                aria-hidden="true"
                src={item.icon}
              />
              <span className="[font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0]">
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
};
