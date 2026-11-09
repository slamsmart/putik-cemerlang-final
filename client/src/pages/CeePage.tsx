import { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import CeeForm, { CEE_AKSES_KEY } from "@/components/cee/CeeForm";
import CeeRekap from "@/components/cee/CeeRekap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Lock, Table2 } from "lucide-react";

export default function CeePage() {
  const [tab, setTab] = useState("kuesioner");
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(CEE_AKSES_KEY) === "1";
    } catch {
      return false;
    }
  });

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-['Inter',Helvetica] text-[#191c1e]">
      <PublicNavbar />

      <main className="pt-20">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1280px] px-6 py-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Control Environment Evaluation
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#001e40] sm:text-3xl">
              Analisis CEE — Cabang Dinas Kelautan dan Perikanan Kabupaten Malang
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
              Kuesioner penilaian lingkungan pengendalian intern (CEE). Setiap pengisian otomatis diberi kode
              responden berurutan (R1, R2, R3, …) dan langsung terhitung pada tabel rekapitulasi beserta simpulan
              per sub-unsur.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-8">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-6">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-xl border border-[#c3c6d1] bg-white p-1.5 sm:w-auto">
              <TabsTrigger
                value="kuesioner"
                className="h-auto gap-2 rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#001e40] data-[state=active]:text-white"
              >
                <ClipboardList className="h-4 w-4" /> Form Kuesioner
              </TabsTrigger>
              <TabsTrigger
                value="rekap"
                disabled={!unlocked}
                title={unlocked ? undefined : "Buka kuesioner dengan kata sandi terlebih dahulu."}
                className="h-auto gap-2 rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-[#001e40] data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {unlocked ? <Table2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />} Rekapitulasi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kuesioner" className="mt-0">
              <CeeForm onUnlock={() => setUnlocked(true)} />
            </TabsContent>

            <TabsContent value="rekap" className="mt-0">
              <CeeRekap tampilkanResponden={false} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
