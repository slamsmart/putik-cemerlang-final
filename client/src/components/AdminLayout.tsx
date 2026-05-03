import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/auth";

const primaryNavItems = [
  {
    label: "Dashboard",
    icon: "/figmaAssets/container-14.svg",
    href: "/admin",
  },
  {
    label: "Buku Tamu",
    icon: "/figmaAssets/container-3.svg",
    href: "/admin/buku-tamu",
  },
  {
    label: "Arsip Surat",
    icon: "/figmaAssets/container-4.svg",
    href: "/admin/arsip-surat",
  },
  {
    label: "Konten & Slider",
    icon: "/figmaAssets/container-2.svg",
    href: "/admin/konten-slider",
  },
];

const secondaryNavItems = [
  {
    label: "Pengaturan",
    icon: "/figmaAssets/container-8.svg",
    href: "/admin/pengaturan",
  },
];

const footerLinks = [
  "Kebijakan Privasi",
  "Syarat & Ketentuan",
  "Peta Situs",
  "Hubungi Kami",
];

function AdminSidebar() {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-slate-50 p-4 z-10">
      <div className="flex flex-col">
        <header className="flex w-full flex-col px-4 pb-10 pt-4">
          <Link href="/admin">
            <h1 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 tracking-[0] text-blue-900 cursor-pointer">
              PUTIK CEMERLANG
            </h1>
          </Link>
          <p className="[font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
            Admin Portal - Malang
          </p>
        </header>
        <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-2">
          {primaryNavItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            return (
              <Link key={item.label} href={item.href}>
                <button
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--/g, "-")}`}
                  type="button"
                  className={`h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <img className="shrink-0" alt="" aria-hidden="true" src={item.icon} />
                  <span
                    className={`[font-family:'Inter',Helvetica] text-base leading-6 tracking-[0] ${
                      isActive ? "font-bold" : "font-normal"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex w-full flex-col gap-2 pt-4">
        <Separator className="bg-slate-200" />
        <nav aria-label="Secondary navigation" className="flex flex-col gap-2">
          {secondaryNavItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <button
                type="button"
                className="h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <img className="shrink-0" alt="" aria-hidden="true" src={item.icon} />
                <span className="[font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0]">
                  {item.label}
                </span>
              </button>
            </Link>
          ))}
          <button
            data-testid="button-logout"
            type="button"
            onClick={handleLogout}
            className="h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-[#ba1a1a] hover:bg-red-50 transition-colors"
          >
            <img className="shrink-0" alt="" aria-hidden="true" src="/figmaAssets/container.svg" />
            <span className="[font-family:'Inter',Helvetica] text-base font-normal leading-6 tracking-[0]">
              Keluar
            </span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

function AdminFooter() {
  return (
    <footer className="relative flex flex-col items-start gap-8 border-t border-[#ffffff1a] bg-blue-950 px-10 py-10">
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:justify-between">
        <section className="flex max-w-xs flex-col items-start gap-3">
          <h2 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 text-white">
            PUTIK CEMERLANG
          </h2>
          <p className="[font-family:'Inter',Helvetica] text-sm font-normal leading-[22px] text-slate-300">
            Sistem Informasi Maritim Terpadu Kabupaten Malang.
            Mewujudkan tata kelola laut yang transparan dan berkelanjutan.
          </p>
        </section>
        <nav aria-label="Footer navigation" className="w-fit">
          <ul className="grid w-fit grid-cols-2 gap-x-12 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link}>
                <button className="[font-family:'Inter',Helvetica] text-sm font-normal text-slate-300 hover:text-white transition-colors">
                  {link}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="w-full border-t border-[#ffffff1a] pt-6">
        <p className="[font-family:'Inter',Helvetica] text-sm font-normal text-slate-400">
          © 2024 Marine Information Center - Kabupaten Malang. Seluruh Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f7f9fb]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col ml-64">
        <main className="flex-1 px-10 py-10">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
