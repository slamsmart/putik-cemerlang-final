import { AdminLayout } from "@/components/AdminLayout";
import CeeRekap from "@/components/cee/CeeRekap";
import { Badge } from "@/components/ui/badge";

export default function CeeAdminPage() {
  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col gap-3">
        <Badge className="w-fit rounded-full bg-slate-200 text-slate-600 hover:bg-slate-200">
          CEE • CABDIN KP MALANG
        </Badge>
        <h1 className="text-2xl font-bold text-[#001e40] sm:text-3xl [font-family:'Public_Sans',Helvetica]">
          Analisis CEE
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base [font-family:'Inter',Helvetica]">
          Rekapitulasi hasil kuesioner Control Environment Evaluation: nilai tiap responden (R1, R2, …), modus per
          butir, serta simpulan per sub-unsur. Dapat diunduh sebagai PDF atau Excel.
        </p>
      </header>

      <CeeRekap />
    </AdminLayout>
  );
}
