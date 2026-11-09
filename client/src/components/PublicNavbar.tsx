import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { groupSkmEntriesByYear, skmPath, type PublicSkmEntry } from "@/lib/skm";
import { useQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChevronDown, Menu, Trophy, X } from "lucide-react";
export default function PublicNavbar() {
  const [location, setLocation] = useLocation();
  const { data: skmData } = useQuery<PublicSkmEntry[]>({
    queryKey: ["/api/skm"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const skmEntries = (skmData ?? []).filter((entry) => entry.isActive);
  const skmGroups = groupSkmEntriesByYear(skmEntries);
  const eomHistory = useConvexQuery(api.votingEom.getPeriodeHistory) ?? [];
  const quarterWinners = eomHistory.filter(
    (item) => /triwulan|(?:^|\s)tw\s*[ivx\d]+/i.test(item.periode) && item.winner
  );
  const [selectedWinner, setSelectedWinner] = useState<(typeof quarterWinners)[number] | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [skmOpen, setSkmOpen] = useState(false);
  const [pengaduanOpen, setPengaduanOpen] = useState(false);
  const [bestEmployeeOpen, setBestEmployeeOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);


  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

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
    <>
      <header className="landing-fade bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm fixed top-0 w-full z-40">
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

        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
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
            <DropdownMenuTrigger className="flex items-center gap-1 font-['Public_Sans',Helvetica] text-sm font-semibold tracking-tight text-[#fb8c00] transition-colors hover:text-[#c96f00] focus:outline-none">
              <Trophy className="h-4 w-4" /> Best Employee <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              style={{ backgroundColor: "#001e40", borderColor: "#0b2a52" }}
              className="min-w-[280px] rounded-xl border p-1.5 shadow-lg"
            >
              <DropdownMenuLabel className="px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#b8d7f4]">
                Pemenang Voting EOM
              </DropdownMenuLabel>
              {quarterWinners.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-300">Belum ada data pemenang</p>
              ) : (
                quarterWinners.map((item) => (
                  <DropdownMenuItem
                    key={item.periode}
                    className="cursor-pointer rounded-lg px-4 py-3 text-white hover:bg-[#0b2a52] hover:text-white focus:bg-[#0b2a52] focus:text-white"
                    onSelect={() => setSelectedWinner(item)}
                  >
                    {item.winner?.imageUrl ? (
                      <img
                        src={item.winner.imageUrl}
                        alt={item.winner.nama}
                        className="mr-3 h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <Trophy className="mr-3 h-4 w-4 shrink-0 text-[#fb8c00]" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-wide text-[#b8d7f4]">{item.periode}</span>
                      <span className="block truncate text-sm font-semibold">{item.winner?.nama ?? "Belum ada pemenang"}</span>
                      <span className="block text-xs text-slate-300">{item.winner?.voteCount ?? 0} suara</span>
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 font-['Public_Sans',Helvetica] text-sm font-semibold tracking-tight transition-colors focus:outline-none ${
                isActive("/skm") ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-slate-600 hover:text-blue-900"
              }`}
            >
              SKM <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              style={{ backgroundColor: "#001e40", borderColor: "#0b2a52" }}
              className="min-w-[260px] rounded-xl border p-1.5 shadow-lg"
            >
              {skmGroups.map((group) => (
                <div key={group.year} className="py-1 first:pt-0">
                  <DropdownMenuLabel className="px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#b8d7f4]">
                    Tahun {group.year}
                  </DropdownMenuLabel>
                  {group.items.map((entry) => (
                    <DropdownMenuItem
                      key={entry.slug}
                      className="cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b2a52] hover:text-white focus:bg-[#0b2a52] focus:text-white"
                      onSelect={() => setLocation(skmPath(entry.slug))}
                    >
                      {entry.title}
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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

          <Link href="/analisis-cee">
            <a className={`${linkBase} ${isActive("/analisis-cee") ? activeCls : inactiveCls}`}>
              Analisis CEE
            </a>
          </Link>

          <Link href="/kontak">
            <a className={`${linkBase} ${isActive("/kontak") ? activeCls : inactiveCls}`}>
              Kontak
            </a>
          </Link>
        </div>

        <button
          aria-label="Buka menu navigasi"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#003366] shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>
    </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            aria-label="Tutup menu"
            onClick={closeMobile}
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[86vw] max-w-[340px] flex-col overflow-y-auto bg-[#001e40] text-white shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-sm font-bold uppercase tracking-widest text-white">Menu</span>
              <button
                aria-label="Tutup menu"
                onClick={closeMobile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-4">
              <button onClick={() => { setLocation("/"); closeMobile(); }} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location === "/" ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>Beranda</button>
              <button onClick={() => { setLocation("/buku-tamu"); closeMobile(); }} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location.startsWith("/buku-tamu") ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>Buku Tamu</button>
              <button onClick={() => { setLocation("/profile"); closeMobile(); }} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location.startsWith("/profile") ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>Profile</button>
              <button onClick={() => { setLocation("/voting-eom"); closeMobile(); }} className="mt-1 rounded-full bg-[#fb8c00] px-4 py-3 text-center text-sm font-bold text-white shadow hover:bg-[#e67e00]">Voting EOM</button>
              <Collapsible open={bestEmployeeOpen} onOpenChange={setBestEmployeeOpen} className="mt-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#fb8c00] hover:bg-white/10">
                  <span className="flex items-center gap-2"><Trophy className="h-4 w-4" /> Best Employee</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${bestEmployeeOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="mt-1 rounded-xl bg-[#0b2a52] p-2">
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#b8d7f4]">Pemenang Voting EOM</p>
                    {quarterWinners.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-slate-300">Belum ada data pemenang</p>
                    ) : (
                      quarterWinners.map((item) => (
                        <button
                          key={item.periode}
                          onClick={() => { setSelectedWinner(item); closeMobile(); }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/10"
                        >
                          {item.winner?.imageUrl ? (
                            <img src={item.winner.imageUrl} alt={item.winner.nama} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10"><Trophy className="h-4 w-4 text-[#fb8c00]" /></span>
                          )}
                          <span className="min-w-0">
                            <span className="block text-xs font-bold uppercase tracking-wide text-[#b8d7f4]">{item.periode}</span>
                            <span className="block truncate text-sm font-semibold text-white">{item.winner?.nama ?? "Belum ada pemenang"}</span>
                            <span className="block text-xs text-slate-300">{item.winner?.voteCount ?? 0} suara</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={skmOpen} onOpenChange={setSkmOpen}>
                <CollapsibleTrigger className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location.startsWith("/skm") ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>
                  <span>SKM</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${skmOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="mt-1 rounded-xl bg-[#0b2a52] p-2">
                    {skmGroups.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-slate-300">Belum ada data SKM</p>
                    ) : (
                      skmGroups.map((group) => (
                        <div key={group.year} className="py-1">
                          <p className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#b8d7f4]">Tahun {group.year}</p>
                          {group.items.map((entry) => (
                            <button
                              key={entry.slug}
                              onClick={() => { setLocation(skmPath(entry.slug)); closeMobile(); }}
                              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-white/10"
                            >
                              {entry.title}
                            </button>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={pengaduanOpen} onOpenChange={setPengaduanOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-white hover:bg-white/10">
                  <span>Pengaduan</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${pengaduanOpen ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pb-2">
                  <div className="mt-1 flex flex-col gap-1 rounded-xl bg-[#0b2a52] p-2">
                    <button onClick={() => { setLocation("/pengaduan-masyarakat"); closeMobile(); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-white/10">Pengaduan Masyarakat</button>
                    <button onClick={() => { setLocation("/whistle-blowing"); closeMobile(); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-white/10">Whistle Blowing System</button>
                    <button onClick={() => { setLocation("/pelaporan-gratifikasi"); closeMobile(); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-white/10">Pelaporan Gratifikasi</button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <button onClick={() => { setLocation("/analisis-cee"); closeMobile(); }} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location.startsWith("/analisis-cee") ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>Analisis CEE</button>
              <button onClick={() => { setLocation("/kontak"); closeMobile(); }} className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${location.startsWith("/kontak") ? "bg-white text-[#001e40]" : "text-white hover:bg-white/10"}`}>Kontak</button>
            </nav>
          </div>
        </div>
      )}

      <Dialog open={!!selectedWinner} onOpenChange={(open) => !open && setSelectedWinner(null)}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl p-0">
          {selectedWinner && (
            <>
              <div className="bg-[#001e40] px-6 py-5 text-center text-white">
                <Trophy className="mx-auto mb-2 h-8 w-8 text-[#fb8c00]" />
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Best Employee {selectedWinner.periode}</DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-6 text-center">
                {selectedWinner.winner?.imageUrl ? (
                  <img
                    src={selectedWinner.winner.imageUrl}
                    alt={selectedWinner.winner.nama}
                    className="mx-auto h-56 w-44 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="mx-auto flex h-56 w-44 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    Foto belum tersedia
                  </div>
                )}
                <h3 className="mt-4 text-lg font-bold text-[#001e40]">{selectedWinner.winner?.nama ?? "Belum ada pemenang"}</h3>
                {selectedWinner.winner?.seksi && <p className="mt-1 text-sm text-slate-500">{selectedWinner.winner.seksi}</p>}
                <p className="mt-3 text-sm font-semibold text-[#fb8c00]">{selectedWinner.winner?.voteCount ?? 0} suara terbanyak</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
