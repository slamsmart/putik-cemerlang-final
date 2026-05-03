import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const arsipData = [
  {
    id: 1,
    nomor: "001/KKP/V/2024",
    perihal: "Undangan Rapat Koordinasi Perikanan",
    pengirim: "Dinas Kelautan & Perikanan Provinsi Jawa Timur",
    tanggal: "03 Mei 2024",
    jenis: "Masuk",
    status: "Terbaca",
  },
  {
    id: 2,
    nomor: "022/DKP/V/2024",
    perihal: "Laporan Hasil Monitoring Zona Tangkap Q1 2024",
    pengirim: "Bidang Pengawasan DKP Kab. Malang",
    tanggal: "02 Mei 2024",
    jenis: "Keluar",
    status: "Terkirim",
  },
  {
    id: 3,
    nomor: "035/KKP/V/2024",
    perihal: "Surat Edaran Tata Cara Perizinan Kapal Nelayan",
    pengirim: "Kementerian Kelautan dan Perikanan RI",
    tanggal: "01 Mei 2024",
    jenis: "Masuk",
    status: "Terbaca",
  },
  {
    id: 4,
    nomor: "018/DKP/IV/2024",
    perihal: "Permohonan Data Statistik Perikanan 2023",
    pengirim: "BPS Kabupaten Malang",
    tanggal: "28 Apr 2024",
    jenis: "Masuk",
    status: "Belum Dibaca",
  },
  {
    id: 5,
    nomor: "045/DKP/IV/2024",
    perihal: "Rekomendasi Lokasi Budidaya Rumput Laut",
    pengirim: "Bidang Budidaya DKP Kab. Malang",
    tanggal: "25 Apr 2024",
    jenis: "Keluar",
    status: "Terkirim",
  },
  {
    id: 6,
    nomor: "012/BAPPEDA/IV/2024",
    perihal: "Koordinasi Program APBD 2025 Sektor Maritim",
    pengirim: "Bappeda Kabupaten Malang",
    tanggal: "22 Apr 2024",
    jenis: "Masuk",
    status: "Terbaca",
  },
  {
    id: 7,
    nomor: "055/DKP/IV/2024",
    perihal: "Laporan Pelaksanaan Program Konservasi Terumbu Karang",
    pengirim: "Bidang Konservasi DKP Kab. Malang",
    tanggal: "20 Apr 2024",
    jenis: "Keluar",
    status: "Terkirim",
  },
];

const statusStyle: Record<string, string> = {
  Terbaca: "bg-green-100 text-green-700",
  Terkirim: "bg-blue-100 text-blue-800",
  "Belum Dibaca": "bg-amber-100 text-amber-800",
};

const jenisStyle: Record<string, string> = {
  Masuk: "bg-slate-100 text-slate-700",
  Keluar: "bg-purple-100 text-purple-800",
};

export default function ArsipSuratPage() {
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");

  const filtered = arsipData.filter((item) => {
    const matchSearch =
      item.nomor.toLowerCase().includes(search.toLowerCase()) ||
      item.perihal.toLowerCase().includes(search.toLowerCase()) ||
      item.pengirim.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === "Semua" || item.jenis === filterJenis;
    return matchSearch && matchJenis;
  });

  return (
    <AdminLayout>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Arsip Surat
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola dan arsipkan surat masuk dan surat keluar Dinas Kelautan & Perikanan Kabupaten Malang.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            data-testid="button-tambah-surat"
            className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
          >
            + Tambah Surat
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Total Surat", value: arsipData.length.toString(), color: "text-[#001e40]" },
          { label: "Surat Masuk", value: arsipData.filter((a) => a.jenis === "Masuk").length.toString(), color: "text-slate-700" },
          { label: "Surat Keluar", value: arsipData.filter((a) => a.jenis === "Keluar").length.toString(), color: "text-purple-700" },
          { label: "Belum Dibaca", value: arsipData.filter((a) => a.status === "Belum Dibaca").length.toString(), color: "text-amber-600" },
        ].map((s, i) => (
          <Card
            key={i}
            data-testid={`card-stat-arsip-${i}`}
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
          <div className="mb-5 flex items-center gap-3">
            <Input
              data-testid="input-search-arsip"
              placeholder="Cari nomor surat, perihal, atau pengirim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm rounded-md border-slate-200 text-sm [font-family:'Inter',Helvetica]"
            />
            <div className="flex gap-2">
              {["Semua", "Masuk", "Keluar"].map((f) => (
                <button
                  key={f}
                  data-testid={`filter-jenis-${f.toLowerCase()}`}
                  onClick={() => setFilterJenis(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    filterJenis === f
                      ? "bg-[#001e40] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["No. Surat", "Perihal", "Pengirim/Tujuan", "Tanggal", "Jenis", "Status", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    data-testid={`row-arsip-${item.id}`}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-3 pr-4 text-xs font-mono text-[#3a5f94] whitespace-nowrap">
                      {item.nomor}
                    </td>
                    <td className="max-w-[200px] py-3 pr-4">
                      <p className="line-clamp-2 text-sm text-[#191c1e] [font-family:'Inter',Helvetica]">
                        {item.perihal}
                      </p>
                    </td>
                    <td className="max-w-[180px] py-3 pr-4">
                      <p className="line-clamp-2 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                        {item.pengirim}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-[#5f5e5e] whitespace-nowrap [font-family:'Inter',Helvetica]">
                      {item.tanggal}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-xs font-normal hover:opacity-80 ${jenisStyle[item.jenis]}`}
                      >
                        {item.jenis}
                      </Badge>
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
                          data-testid={`button-lihat-${item.id}`}
                          className="text-xs font-medium text-[#3a5f94] hover:underline [font-family:'Inter',Helvetica]"
                        >
                          Lihat
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          data-testid={`button-hapus-arsip-${item.id}`}
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
