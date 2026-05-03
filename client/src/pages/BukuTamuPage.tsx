import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// We no longer need static bukuTamuData.

const statusStyle: Record<string, string> = {
  "Belum Dibalas": "bg-amber-100 text-amber-800",
  "Sudah Dibalas": "bg-green-100 text-green-700",
  "Diarsipkan": "bg-slate-100 text-slate-600",
};

const monthMap: Record<string, string> = {
  "Jan": "1", "Januari": "1",
  "Feb": "2", "Februari": "2",
  "Mar": "3", "Maret": "3",
  "Apr": "4", "April": "4",
  "Mei": "5",
  "Jun": "6", "Juni": "6",
  "Jul": "7", "Juli": "7",
  "Ags": "8", "Agustus": "8",
  "Sep": "9", "September": "9",
  "Okt": "10", "Oktober": "10",
  "Nov": "11", "November": "11",
  "Des": "12", "Desember": "12"
};

export default function BukuTamuPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Semua");
  const [filterTahun, setFilterTahun] = useState("Semua");
  
  const rawData = useConvexQuery(api.guestbook.list) || [];
  const removeMut = useConvexMutation(api.guestbook.remove);
  const updateStatusMut = useConvexMutation(api.guestbook.updateStatus);

  const filtered = rawData.filter((item) => {
    const matchSearch =
      (item.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.pesan || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    
    const parts = (item.tanggal || "").split(" ");
    let m = "Semua", y = "Semua";
    if (parts.length >= 3) {
      m = monthMap[parts[1]] || "Semua";
      y = parts[2];
    }
    const matchBulan = filterBulan === "Semua" || m === filterBulan;
    const matchTahun = filterTahun === "Semua" || y === filterTahun;

    return matchSearch && matchStatus && matchBulan && matchTahun;
  });

  const handleExportPDF = () => {
    if (filtered.length === 0) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }
    const doc = new jsPDF();
    doc.text("Laporan Buku Tamu Digital", 14, 15);
    const tableColumn = ["No", "Nama / Email", "Pekerjaan", "Pesan", "Tanggal", "Status"];
    const tableRows: any[] = [];
    
    filtered.forEach((item, index) => {
      const row = [
        index + 1,
        `${item.nama}\n${item.email}`,
        item.pekerjaan,
        item.pesan,
        item.tanggal,
        item.status
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 30, 64] }
    });

    const monthName = filterBulan !== "Semua" ? filterBulan : "SemuaBulan";
    const yearName = filterTahun !== "Semua" ? filterTahun : "SemuaTahun";
    doc.save(`BukuTamu_${monthName}_${yearName}.pdf`);
    toast({ title: "PDF berhasil diekspor" });
  };

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Buku Tamu
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola pesan dan pertanyaan dari masyarakat yang masuk ke portal Putik Cemerlang.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="button-ekspor-buku-tamu"
            className="rounded-lg bg-slate-100 text-[#001e40] px-6 py-2.5 text-sm hover:bg-slate-200 [font-family:'Public_Sans',Helvetica]"
          >
            Export ZIP
          </Button>
          <Button
            onClick={handleExportPDF}
            className="rounded-lg bg-[#001e40] px-6 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
          >
            Export PDF
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Pesan", value: rawData.length.toString(), color: "text-[#001e40]" },
          { label: "Belum Dibalas", value: rawData.filter(b => b.status === "Belum Dibalas").length.toString(), color: "text-amber-600" },
          { label: "Sudah Dibalas", value: rawData.filter(b => b.status === "Sudah Dibalas").length.toString(), color: "text-green-600" },
        ].map((s, i) => (
          <Card
            key={i}
            data-testid={`card-stat-bukutamu-${i}`}
            className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]"
          >
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${s.color} [font-family:'Public_Sans',Helvetica]`}>
                {s.value}
              </div>
              <div className="mt-0.5 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                {s.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border border-[#c3c6d1] bg-white shadow-[0px_1px_2px_#0000000d]">
        <CardContent className="p-6">
          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Input
              data-testid="input-search-bukutamu"
              placeholder="Cari nama atau pesan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm rounded-md border-slate-200 [font-family:'Inter',Helvetica] text-sm"
            />
            <div className="flex gap-2">
              {["Semua", "Belum Dibalas", "Sudah Dibalas", "Diarsipkan"].map((f) => (
                <button
                  key={f}
                  data-testid={`filter-${f.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setFilterStatus(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    filterStatus === f
                      ? "bg-[#001e40] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={filterBulan} onValueChange={setFilterBulan}>
                <SelectTrigger className="w-[140px] rounded-md border-slate-200 text-xs"><SelectValue placeholder="Bulan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Bulan</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger className="w-[120px] rounded-md border-slate-200 text-xs"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Tahun</SelectItem>
                  {[2023, 2024, 2025].map((t) => (
                    <SelectItem key={t} value={t.toString()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Nama", "Pekerjaan", "Pesan", "Tanggal", "Status", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    data-testid={`row-bukutamu-${item._id}`}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-3 pr-4">
                      <div className="text-sm font-medium text-[#191c1e] [font-family:'Inter',Helvetica]">
                        {item.nama}
                      </div>
                      <div className="text-xs text-slate-400">{item.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                      {item.pekerjaan}
                    </td>
                    <td className="max-w-xs py-3 pr-4">
                      <p className="line-clamp-2 text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">
                        {item.pesan}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica] whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-normal hover:opacity-80 ${statusStyle[item.status]}`}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          data-testid={`button-balas-${item._id}`}
                          onClick={() => {
                            updateStatusMut({ id: item._id as any, status: "Sudah Dibalas" });
                            toast({ title: "Status diperbarui" });
                          }}
                          className="text-xs font-medium text-[#3a5f94] hover:underline [font-family:'Inter',Helvetica]"
                        >
                          Tandai Dibalas
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          data-testid={`button-hapus-${item._id}`}
                          onClick={() => {
                            if (confirm("Hapus pesan tamu ini?")) {
                              removeMut({ id: item._id as any });
                              toast({ title: "Pesan dihapus" });
                            }
                          }}
                          className="text-xs font-medium text-[#ba1a1a] hover:underline [font-family:'Inter',Helvetica]"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-400">
                Tidak ada data yang sesuai dengan pencarian.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
