import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/lib/auth";
import { Menu, X } from "lucide-react";

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
    label: "Pengaduan Masyarakat",
    icon: "/figmaAssets/container-4.svg",
    href: "/admin/pengaduan-masyarakat",
  },
  {
    label: "Whistle Blowing",
    icon: "/figmaAssets/container-4.svg",
    href: "/admin/whistle-blowing",
  },
  {
    label: "Laporan Gratifikasi",
    icon: "/figmaAssets/container-4.svg",
    href: "/admin/pelaporan-gratifikasi",
  },
  {
    label: "Voting EOM",
    icon: "/figmaAssets/container-2.svg",
    href: "/admin/voting-eom",
  },
  {
    label: "Data SKM",
    icon: "/figmaAssets/container-12.svg",
    href: "/admin/skm",
  },
  {
    label: "Konten & Slider",
    icon: "/figmaAssets/container-2.svg",
    href: "/admin/konten-slider",
  },
  {
    label: "Statistik Layanan",
    icon: "/figmaAssets/container-12.svg",
    href: "/admin/statistik-layanan",
  },
  {
    label: "Statistik Pengunjung",
    icon: "/figmaAssets/container-12.svg",
    href: "/admin/statistik-pengunjung",
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

function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  // Close sidebar on route change in mobile
  useEffect(() => {
    onClose();
  }, [location]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed left-0 top-0 flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-slate-50 p-4 z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex flex-col h-full overflow-y-auto">
          <header className="flex w-full flex-col px-4 pb-8 pt-4 relative">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer mb-2">
                <img 
                  src="/logo.png?v=2" 
                  alt="" 
                  className="h-8 w-auto" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <h1 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 tracking-[0] text-blue-900 truncate">
                  PUTIK CEMERLANG
                </h1>
              </div>
            </Link>
            <p className="[font-family:'Inter',Helvetica] text-xs font-normal leading-4 tracking-[0] text-[#5f5e5e]">
              Admin Portal - Malang
            </p>
            {/* Close button for mobile */}
            <button onClick={onClose} className="lg:hidden absolute top-4 right-0 p-1 text-slate-500 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>
          </header>
          
          <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-2">
            {primaryNavItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
              return (
                <Link key={item.label} href={item.href}>
                  <button
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--/g, "-")}`}
                    type="button"
                    className={`h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      isActive
                        ? "bg-blue-50 text-blue-900"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <img className="shrink-0" alt="" aria-hidden="true" src={item.icon} />
                    <span
                      className={`[font-family:'Inter',Helvetica] text-sm md:text-base leading-6 tracking-[0] text-left ${
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

        <div className="flex w-full flex-col gap-2 pt-4 bg-slate-50">
          <Separator className="bg-slate-200" />
          <nav aria-label="Secondary navigation" className="flex flex-col gap-2">
            {secondaryNavItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <button
                  type="button"
                  className="h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-700 transition-colors text-left"
                >
                  <img className="shrink-0" alt="" aria-hidden="true" src={item.icon} />
                  <span className="[font-family:'Inter',Helvetica] text-sm md:text-base font-normal leading-6 tracking-[0] text-left">
                    {item.label}
                  </span>
                </button>
              </Link>
            ))}
            <button
              data-testid="button-logout"
              type="button"
              onClick={handleLogout}
              className="h-auto w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg text-[#ba1a1a] hover:bg-red-50 transition-colors text-left"
            >
              <img className="shrink-0" alt="" aria-hidden="true" src="/figmaAssets/container.svg" />
              <span className="[font-family:'Inter',Helvetica] text-sm md:text-base font-normal leading-6 tracking-[0] text-left">
                Keluar
              </span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

function AdminFooter() {
  return (
    <footer className="relative flex flex-col items-start gap-8 border-t border-[#ffffff1a] bg-blue-950 px-6 lg:px-10 py-10 w-full">
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:justify-between">
        <section className="flex flex-col items-start gap-3 md:max-w-xs">
          <h2 className="[font-family:'Inter',Helvetica] text-lg font-bold leading-7 text-white">
            PUTIK CEMERLANG
          </h2>
          <p className="[font-family:'Inter',Helvetica] text-sm font-normal leading-[22px] text-slate-300 text-justify">
            Pusat Informasi Kelautan Cabang Dinas Kelautan dan Perikanan Malang yang menyediakan data dan informasi kelautan untuk mendukung pelayanan publik, memudahkan akses informasi bagi masyarakat dan pemangku kepentingan secara cepat, akurat, dan informatif.
          </p>
        </section>
        <nav aria-label="Footer navigation" className="w-full md:w-fit">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 md:gap-x-12">
            {footerLinks.map((link) => (
              <li key={link}>
                <button className="[font-family:'Inter',Helvetica] text-sm font-normal text-slate-300 hover:text-white transition-all duration-300 hover:[text-shadow:0_0_8px_rgba(0,166,228,0.6),0_0_16px_rgba(0,166,228,0.3)] text-left">
                  {link}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="w-full border-t border-[#ffffff1a] pt-6">
        <p className="[font-family:'Inter',Helvetica] text-xs md:text-sm font-normal text-slate-400">
          © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] relative w-full overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shadow-sm">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img 
              src="/logo.png?v=2" 
              alt="" 
              className="h-8 w-auto" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <h1 className="[font-family:'Inter',Helvetica] text-lg font-bold text-blue-900 truncate">
              PUTIK CEMERLANG
            </h1>
          </div>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 pt-16 lg:pt-0 lg:ml-64 w-full min-w-0 max-w-full">
        <main className="flex-1 w-full max-w-full p-4 sm:p-6 lg:p-10 overflow-x-hidden">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
