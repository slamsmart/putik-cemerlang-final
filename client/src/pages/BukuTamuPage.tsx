import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const bukuTamuData = [
  {
    id: 1,
    nama: "Supriyadi",
    email: "supriyadi@gmail.com",
    pekerjaan: "Nelayan",
    pesan: "Mohon informasi mengenai zona tangkap ikan yang aman di wilayah Sendangbiru.",
    tanggal: "03 Mei 2024",
    status: "Belum Dibalas",
  },
  {
    id: 2,
    nama: "Rahayu Setyaningsih",
    email: "rahayu.sn@yahoo.com",
    pekerjaan: "Pelaku UMKM",
    pesan: "Ingin mengetahui program bantuan untuk pengolahan hasil laut di Kabupaten Malang.",
    tanggal: "02 Mei 2024",
    status: "Sudah Dibalas",
  },
  {
    id: 3,
    nama: "Budi Santoso",
    email: "budisantoso@gmail.com",
    pekerjaan: "Petambak",
    pesan: "Apakah ada pelatihan budidaya udang vaname yang akan diadakan?",
    tanggal: "01 Mei 2024",
    status: "Sudah Dibalas",
  },
  {
    id: 4,
    nama: "Siti Aminah",
    email: "sitiaminah@gmail.com",
    pekerjaan: "Ibu Rumah Tangga",
    pesan: "Bagaimana cara mendapatkan surat keterangan nelayan untuk suami saya?",
    tanggal: "30 Apr 2024",
    status: "Belum Dibalas",
  },
  {
    id: 5,
    nama: "Agus Triyono",
    email: "agustri@gmail.com",
    pekerjaan: "Pengusaha Perikanan",
    pesan: "Ingin konsultasi mengenai perizinan ekspor produk perikanan.",
    tanggal: "29 Apr 2024",
    status: "Diarsipkan",
  },
  {
    id: 6,
    nama: "Dewi Rahmawati",
    email: "dewi.rahma@gmail.com",
    pekerjaan: "Mahasiswa",
    pesan: "Mencari data statistik hasil tangkapan ikan untuk keperluan skripsi.",
    tanggal: "28 Apr 2024",
    status: "Sudah Dibalas",
  },
];

const statusStyle: Record<string, string> = {
  "Belum Dibalas": "bg-amber-100 text-amber-800",
  "Sudah Dibalas": "bg-green-100 text-green-700",
  "Diarsipkan": "bg-slate-100 text-slate-600",
};

export default function BukuTamuPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const filtered = bukuTamuData.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.pesan.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

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
        <Button
          data-testid="button-ekspor-buku-tamu"
          className="rounded-lg bg-[#001e40] px-8 py-2.5 text-sm text-white shadow-[0px_1px_2px_#0000000d] hover:bg-[#001e40]/90 [font-family:'Public_Sans',Helvetica]"
        >
          Ekspor Data
        </Button>
      </header>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total Pesan", value: bukuTamuData.length.toString(), color: "text-[#001e40]" },
          { label: "Belum Dibalas", value: bukuTamuData.filter(b => b.status === "Belum Dibalas").length.toString(), color: "text-amber-600" },
          { label: "Sudah Dibalas", value: bukuTamuData.filter(b => b.status === "Sudah Dibalas").length.toString(), color: "text-green-600" },
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
          <div className="mb-5 flex items-center gap-3">
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
                    key={item.id}
                    data-testid={`row-bukutamu-${item.id}`}
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
                          data-testid={`button-balas-${item.id}`}
                          className="text-xs font-medium text-[#3a5f94] hover:underline [font-family:'Inter',Helvetica]"
                        >
                          Balas
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          data-testid={`button-hapus-${item.id}`}
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
