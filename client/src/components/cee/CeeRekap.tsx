import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { buildRekap, CEE_AMBANG_MEMADAI } from "@shared/cee";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Database, Download, FileSpreadsheet, FileText, Loader2, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

type Props = {
  /** Tampilkan daftar responden (kode, posisi, waktu isi). */
  tampilkanResponden?: boolean;
};

export default function CeeRekap({ tampilkanResponden = true }: Props) {
  const { toast } = useToast();
  const responses = useQuery(api.cee.list);
  const seedDummy = useMutation(api.cee.seedDummy);
  const removeResponse = useMutation(api.cee.remove);

  const daftarTahun = useMemo(() => {
    const tersedia: number[] = [];
    for (const response of responses ?? []) {
      if (!tersedia.includes(response.tahun)) tersedia.push(response.tahun);
    }
    return tersedia.sort((a, b) => b - a);
  }, [responses]);
  const [tahunDipilih, setTahunDipilih] = useState<number | null>(null);

  const tahun = tahunDipilih ?? daftarTahun[0] ?? new Date().getFullYear();
  const tahunAktif = useMemo(
    () => (responses ?? []).filter((response) => response.tahun === tahun),
    [responses, tahun],
  );
  const rekap = useMemo(() => buildRekap(tahunAktif), [tahunAktif]);
  const jumlahResponden = rekap.responden.length;
  const subUnsurMemadai = rekap.groups.filter((group) => group.simpulan === "Memadai").length;
  const simpulanKeseluruhan =
    jumlahResponden === 0
      ? "-"
      : subUnsurMemadai === rekap.groups.length
        ? "Memadai"
        : "Kurang Memadai";

  const namaFile = `Rekapitulasi-CEE-Cabdin-KP-Malang-${tahun}`;

  const handleSeed = async () => {
    try {
      const jumlah = await seedDummy({});
      if (jumlah === 0) {
        toast({ title: "Data sudah ada", description: "Contoh data hanya dimuat saat tabel masih kosong." });
        return;
      }
      toast({ title: `${jumlah} responden contoh dimuat`, description: "R1, R2, dan R3 siap dilihat pada rekapitulasi." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal memuat data contoh",
        description: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
      });
    }
  };

  const handleHapusResponden = async (id: Id<"ceeResponses">, kode: string) => {
    if (!window.confirm(`Hapus responden ${kode}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await removeResponse({ id });
      toast({ title: `Responden ${kode} dihapus` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal menghapus responden",
        description: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
      });
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(13);
    doc.text("REKAPITULASI HASIL KUESIONER PENILAIAN LINGKUNGAN PENGENDALIAN INTERN", pageWidth / 2, 40, {
      align: "center",
    });
    doc.setFontSize(11);
    doc.text("CONTROL ENVIRONMENT EVALUATION (CEE)", pageWidth / 2, 58, { align: "center" });
    doc.setFontSize(10);
    doc.text("CABANG DINAS KELAUTAN DAN PERIKANAN KABUPATEN MALANG", pageWidth / 2, 74, { align: "center" });
    doc.setFontSize(9);
    doc.text(`Tahun Penilaian: ${tahun} • Jumlah Responden: ${jumlahResponden}`, pageWidth / 2, 90, {
      align: "center",
    });

    autoTable(doc, {
      startY: 104,
      head: [["NO.", "PERTANYAAN / KUESIONER", ...rekap.responden, "MODUS", "SIMPULAN KUESIONER CEE"]],
      body: susunBarisTabel().map((row) =>
        row.map((cell) =>
          typeof cell === "string" || typeof cell === "number"
            ? String(cell)
            : {
                content: cell.text,
                colSpan: cell.colSpan,
                styles: { fontStyle: "bold" as const, fillColor: [226, 232, 240] as [number, number, number] },
              },
        ),
      ),
      styles: { fontSize: 7, cellPadding: 3, valign: "middle", lineColor: [195, 198, 209], lineWidth: 0.4 },
      headStyles: { fillColor: [0, 30, 64], textColor: 255, halign: "center", fontSize: 7.5 },
      columnStyles: { 0: { cellWidth: 26, halign: "center" }, 1: { cellWidth: 250 } },
      didParseCell: (data) => {
        if (data.section !== "body" || data.column.index !== data.table.columns.length - 1) return;
        data.cell.styles.halign = "center";
        data.cell.styles.fontStyle = "bold";
        if (data.cell.text[0] === "Kurang Memadai") data.cell.styles.textColor = [180, 30, 30];
      },
    });

    doc.save(`${namaFile}.pdf`);
    toast({ title: "Rekapitulasi PDF berhasil diunduh" });
  };

  const handleExportExcel = () => {
    const rows = susunBarisTabel();
    const head = ["NO.", "PERTANYAAN / KUESIONER", ...rekap.responden, "MODUS", "SIMPULAN KUESIONER CEE"];
    const html = [
      "<html><head><meta charset=\"utf-8\" /></head><body>",
      `<table border="1" cellspacing="0" cellpadding="4">
        <thead><tr>${head.map((cell) => `<th style="background:#001e40;color:#fff">${cell}</th>`).join("")}</tr></thead>
        <tbody>`,
      ...rows.map(
        (row) =>
          `<tr>${row
            .map((cell) => {
              if (typeof cell === "string" || typeof cell === "number") {
                return `<td>${cell}</td>`;
              }
              return `<td colspan="${cell.colSpan}" style="background:#e2e8f0;font-weight:bold">${cell.text}</td>`;
            })
            .join("")}</tr>`,
      ),
      "</tbody></table></body></html>",
    ].join("");

    saveAs(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" }), `${namaFile}.xls`);
    toast({ title: "Rekapitulasi Excel berhasil diunduh" });
  };

  type BarisTabel = (string | number | { text: string; colSpan: number })[];

  function susunBarisTabel(): BarisTabel[] {
    const rows: BarisTabel[] = [];
    for (const group of rekap.groups) {
      rows.push([
        `${group.kode}.`,
        { text: group.judul.toUpperCase(), colSpan: jumlahResponden + 2 },
        group.simpulan,
      ]);
      for (const item of rekap.items.filter((row) => row.grup === group.kode)) {
        rows.push([item.no, item.text, ...item.values.map((value) => value ?? "-"), item.modus ?? "-", item.simpulan]);
      }
    }
    return rows;
  }

  if (responses === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat rekapitulasi…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Jumlah Responden", value: String(jumlahResponden), tone: "text-blue-700" },
          { label: "Tahun Penilaian", value: String(tahun), tone: "text-indigo-700" },
          { label: "Sub-unsur Memadai", value: `${subUnsurMemadai}/${rekap.groups.length}`, tone: "text-emerald-700" },
          { label: "Simpulan CEE", value: simpulanKeseluruhan, tone: simpulanKeseluruhan === "Memadai" ? "text-emerald-700" : "text-amber-700" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#c3c6d1] bg-white p-4 shadow-sm">
            <p className={cn("text-xl font-bold", stat.tone)}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#c3c6d1] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#001e40]">Rekapitulasi Kuesioner CEE</h2>
          <p className="text-xs text-slate-500">
            Nilai 1–4 per responden, modus per butir, dan simpulan per sub-unsur (ambang batas {CEE_AMBANG_MEMADAI}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {daftarTahun.length > 1 && (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              Tahun
              <select
                value={tahun}
                onChange={(event) => setTahunDipilih(Number(event.target.value))}
                className="h-auto rounded-lg border border-[#c3c6d1] bg-white px-2 py-1.5 text-sm font-normal text-[#001e40]"
              >
                {daftarTahun.map((opsi) => (
                  <option key={opsi} value={opsi}>
                    {opsi}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button
            onClick={handleExportPdf}
            disabled={jumlahResponden === 0}
            className="h-auto rounded-lg bg-[#001e40] px-4 py-2 text-sm text-white hover:bg-[#001e40]/90"
          >
            <FileText className="mr-2 h-4 w-4" /> Unduh PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={jumlahResponden === 0}
            variant="outline"
            className="h-auto rounded-lg border-[#001e40] px-4 py-2 text-sm text-[#001e40] hover:bg-blue-50"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Unduh Excel
          </Button>
        </div>
      </div>

      {jumlahResponden === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Database className="h-10 w-10 text-slate-300" />
          <div>
            <h3 className="text-base font-bold text-[#001e40]">Belum ada data responden</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Tabel rekapitulasi akan terisi otomatis setelah kuesioner diisi. Untuk mencoba tampilan dan unduhan,
              muat 3 responden contoh (R1–R3) dari berkas <code className="rounded bg-slate-100 px-1">doc/cee-dummy</code>.
            </p>
          </div>
          {tampilkanResponden && (
            <Button
              onClick={handleSeed}
              className="h-auto rounded-lg bg-[#001e40] px-5 py-2.5 text-sm text-white hover:bg-[#001e40]/90"
            >
              <Download className="mr-2 h-4 w-4" /> Muat 3 data contoh (R1–R3)
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#c3c6d1] bg-white shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#001e40] text-white">
                <th className="w-14 px-3 py-3 text-center text-xs font-bold uppercase">No.</th>
                <th className="min-w-[320px] px-3 py-3 text-left text-xs font-bold uppercase">Pertanyaan / Kuesioner</th>
                {rekap.responden.map((kode) => (
                  <th key={kode} className="w-14 px-2 py-3 text-center text-xs font-bold uppercase">
                    {kode}
                  </th>
                ))}
                <th className="w-16 px-2 py-3 text-center text-xs font-bold uppercase">Modus</th>
                <th className="w-32 px-3 py-3 text-center text-xs font-bold uppercase">Simpulan Kuesioner CEE</th>
              </tr>
            </thead>
            <tbody>
              {rekap.groups.map((group) => (
                <Fragment key={group.kode}>
                  <tr className="bg-slate-100">
                    <td className="px-3 py-2 text-center font-bold text-[#001e40]">{group.kode}.</td>
                    <td colSpan={jumlahResponden + 2} className="px-3 py-2 font-bold uppercase tracking-wide text-[#001e40]">
                      {group.judul}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-center text-xs font-bold",
                        group.simpulan === "Memadai" ? "text-emerald-700" : "text-red-700",
                      )}
                    >
                      {group.simpulan.toUpperCase()}
                    </td>
                  </tr>
                  {rekap.items
                    .filter((item) => item.grup === group.kode)
                    .map((item) => (
                      <tr key={item.no} className="border-t border-slate-100 hover:bg-blue-50/40">
                        <td className="px-3 py-2 text-center font-semibold text-slate-500">{item.no}</td>
                        <td className="px-3 py-2 text-slate-700">{item.text}</td>
                        {item.values.map((value, index) => (
                          <td key={`${item.no}-${rekap.responden[index]}`} className="px-2 py-2 text-center text-slate-700">
                            {value ?? "-"}
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center font-bold text-[#001e40]">{item.modus ?? "-"}</td>
                        <td
                          className={cn(
                            "px-3 py-2 text-center text-xs font-semibold",
                            item.simpulan === "Memadai" ? "text-emerald-700" : "text-red-700",
                          )}
                        >
                          {item.simpulan}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tampilkanResponden && jumlahResponden > 0 && (
        <div className="rounded-2xl border border-[#c3c6d1] bg-white shadow-sm">
          <h3 className="border-b border-slate-200 px-5 py-3 text-sm font-bold text-[#001e40]">Daftar Responden</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                  <th className="px-5 py-2">Kode</th>
                  <th className="px-5 py-2">Posisi</th>
                  <th className="px-5 py-2 text-center">Butir Terisi</th>
                  <th className="px-5 py-2">Waktu Input</th>
                  <th className="px-5 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tahunAktif.map((response) => (
                  <tr key={response._id} className="border-t border-slate-100">
                    <td className="px-5 py-2 font-bold text-[#001e40]">{response.kode}</td>
                    <td className="px-5 py-2 text-slate-600">{response.posisi}</td>
                    <td className="px-5 py-2 text-center text-slate-600">{response.answers.length}</td>
                    <td className="px-5 py-2 text-slate-600">
                      {new Date(response.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-2 text-right">
                      <Button
                        variant="outline"
                        onClick={() => handleHapusResponden(response._id, response.kode)}
                        className="h-auto rounded-lg border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
