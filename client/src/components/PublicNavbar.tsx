import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";

export default function PublicNavbar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  const linkBase =
    "font-['Public_Sans',Helvetica] text-sm font-semibold tracking-tight transition-colors";
  const activeCls = "text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 pb-1";
  const inactiveCls =
    "text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-white";

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm fixed top-0 w-full z-50">
      <nav className="flex justify-between items-center max-w-[1280px] mx-auto px-6 h-20">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.png?v=2"
            alt=""
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="text-xl font-bold tracking-tight text-[#003366] dark:text-white uppercase">
            Putik Cemerlang
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/">
            <a className={`${linkBase} ${isActive("/") ? activeCls : inactiveCls}`}>
              Beranda
            </a>
          </Link>
          <Link href="/buku-tamu">
            <a className={`${linkBase} ${isActive("/buku-tamu") ? activeCls : inactiveCls}`}>
              Buku Tamu
            </a>
          </Link>
          <Link href="/profile">
            <a className={`${linkBase} ${isActive("/profile") ? activeCls : inactiveCls}`}>
              Profile
            </a>
          </Link>
          <Link href="/voting-eom">
            <a className={`${linkBase} ${isActive("/voting-eom") ? "text-white bg-[#001e40] px-4 py-1.5 rounded-full" : "text-white bg-[#003366] px-4 py-1.5 rounded-full hover:bg-[#001e40]"} transition-all`}>
              Voting EOM
            </a>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-['Public_Sans',Helvetica] text-sm font-semibold tracking-tight text-slate-600 transition-colors hover:text-blue-900 focus:outline-none">
              Pengaduan <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="min-w-[240px] rounded-xl border border-slate-200 bg-white shadow-lg p-1"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                onSelect={() => setLocation("/pengaduan-masyarakat")}
              >
                Pengaduan Masyarakat
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                onSelect={() => setLocation("/whistle-blowing")}
              >
                Whistle Blowing System
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                onSelect={() => setLocation("/pelaporan-gratifikasi")}
              >
                Pelaporan Gratifikasi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/kontak">
            <a className={`${linkBase} ${isActive("/kontak") ? activeCls : inactiveCls}`}>
              Kontak
            </a>
          </Link>
        </div>

        <div className="md:hidden">
          <Menu className="text-blue-900" />
        </div>
      </nav>
    </header>
  );
}
