import { useRoute } from "wouter";
import PublicNavbar from "@/components/PublicNavbar";
import { Button } from "@/components/ui/button";
import { groupSkmEntriesByYear, skmPath, type PublicSkmEntry } from "@/lib/skm";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Link } from "wouter";

export default function SkmPage() {
  const [, params] = useRoute("/skm/:slug");
  const { data: skmData } = useQuery<PublicSkmEntry[]>({
    queryKey: ["/api/skm"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const entries = (skmData ?? []).filter((entry) => entry.isActive);
  const entryGroups = groupSkmEntriesByYear(entries);

  const selectedEntry = entries.find((entry) => entry.slug === params?.slug) ?? entries[0];

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-['Inter',Helvetica] text-[#191c1e]">
      <PublicNavbar />

      <main className="pt-20">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-6 py-10 md:flex-row md:items-end md:justify-between">
            <div>
              <Link href="/">
                <a className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3a5f94] hover:text-[#001e40]">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Beranda
                </a>
              </Link>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#006e9c]">
                Survey Kepuasan Masyarakat
              </p>
              <h1 className="mt-2 font-['Public_Sans',Helvetica] text-2xl font-bold leading-tight text-[#001e40] md:text-4xl">
                {selectedEntry?.title ?? "Data SKM"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f5e5e] md:text-base">
                {selectedEntry?.description ||
                  "Hasil Survey Kepuasan Masyarakat Cabang Dinas Kelautan dan Perikanan Kab. Malang."}
              </p>
            </div>
            <div className="flex max-w-full flex-col gap-2 md:items-end">
              {entryGroups.map((group) => (
                <div key={group.year} className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className="rounded-full border border-[#c8d4e5] bg-[#f5f8fc] px-3 py-2 text-xs font-bold text-[#001e40]">
                    Tahun {group.year}
                  </span>
                  {group.items.map((entry) => (
                    <Link key={entry.slug} href={skmPath(entry.slug)}>
                      <a
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                          entry.slug === selectedEntry?.slug
                            ? "bg-[#001e40] text-white"
                            : "border border-[#c8d4e5] bg-white text-[#001e40] hover:bg-[#001e40] hover:text-white"
                        }`}
                      >
                        {entry.quarter}
                      </a>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-10">
          <div className="overflow-hidden rounded-2xl border border-[#c3c6d1] bg-white shadow-[0px_2px_10px_#0000000a]">
            {selectedEntry?.imageUrl ? (
              <a href={selectedEntry.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={selectedEntry.imageUrl}
                  alt={`Hasil ${selectedEntry.title}`}
                  className="max-h-[78vh] w-full bg-slate-100 object-contain"
                />
              </a>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d5e3ff] text-[#001e40]">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-['Public_Sans',Helvetica] text-lg font-bold text-[#001e40]">
                    Foto hasil SKM belum tersedia
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#5f5e5e]">
                    Admin dapat menambahkan foto hasil SKM melalui dashboard.
                  </p>
                </div>
                <Link href="/admin/skm">
                  <Button className="rounded-full bg-[#003a7a] px-5 text-white hover:bg-[#001e40]">
                    Kelola di Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
