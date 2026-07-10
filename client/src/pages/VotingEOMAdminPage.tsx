import { useRef, useState, useEffect } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Award, Upload, Trash2, Plus, RotateCcw, Trophy, Users, Vote, CalendarDays, ImagePlus, Lock, Unlock, GripVertical, Move, History, Info, Clock, CheckCircle2, ShieldCheck, X
} from "lucide-react";


type EomCandidate = {
  _id: Id<"eomCandidates">;
  _creationTime: number;
  nama: string;
  seksi: string;
  imageUrl?: string;
  periode: string;
  isActive: boolean;
  voteCount: number;
  displayOrder: number;
  createdAt: number;
};

interface CandidateCardProps {
  candidate: EomCandidate;
  onDelete: (id: Id<"eomCandidates">) => void;
  onUpdate: (id: Id<"eomCandidates">, data: Record<string, unknown>) => void;
  dragControls?: any;
}

function CandidateCard({ candidate, onDelete, onUpdate, dragControls }: CandidateCardProps) {
  const [nama, setNama] = useState(candidate.nama);
  const [seksi, setSeksi] = useState(candidate.seksi);
  const [imageUrl, setImageUrl] = useState(candidate.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdate(candidate._id, { nama, seksi, imageUrl: imageUrl || undefined });
    toast({ title: "Kandidat berhasil disimpan" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setImageUrl(data.url);
      onUpdate(candidate._id, { imageUrl: data.url });
      if (data.note) toast({ title: "Info", description: data.note });
      else toast({ title: "Foto berhasil diunggah & disimpan" });
    } catch (err: any) {
      toast({ title: "Upload gagal", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const toggleActive = () => {
    onUpdate(candidate._id, { isActive: !candidate.isActive });
    toast({ title: candidate.isActive ? "Kandidat dinonaktifkan" : "Kandidat diaktifkan" });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow relative group/card pl-10 sm:pl-12">
      {/* Drag handle */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center border-r border-slate-100 bg-slate-50/50 rounded-l-xl cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors">
        <div className="flex flex-col items-center gap-0.5 text-slate-400">
          <Move className="w-3.5 h-3.5" />
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      {/* Photo preview */}
      <div className="relative h-40 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={nama} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
            <ImagePlus className="w-10 h-10 mb-1" />
            <span className="text-xs">Belum ada foto</span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          aria-label="Upload foto kandidat"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-1.5 right-1.5 rounded-lg bg-[#001e40]/80 px-2.5 py-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#001e40] disabled:opacity-60 flex items-center gap-1"
        >
          <Upload className="w-3 h-3" />
          {uploading ? "Mengunggah…" : "Ganti Foto"}
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-1 flex-col gap-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">Nama Kandidat</label>
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="border-slate-200 text-sm"
              placeholder="Nama lengkap"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">Seksi / Unit Kerja</label>
            <Input
              value={seksi}
              onChange={(e) => setSeksi(e.target.value)}
              className="border-slate-200 text-sm"
              placeholder="Seksi Pelayanan Publik"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} size="sm" className="rounded-lg bg-[#001e40] px-4 text-xs text-white hover:bg-[#001e40]/90">
              Simpan
            </Button>
            <button onClick={toggleActive} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${candidate.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              {candidate.isActive ? "✅ Aktif" : "⏸ Nonaktif"}
            </button>
            <Badge variant="outline" className="text-xs gap-1">
              <Vote className="w-3 h-3" /> {candidate.voteCount} suara
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(candidate._id)}
            className="gap-1 p-0 text-red-600 hover:bg-transparent hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VotingEOMAdminPage() {
  const { toast } = useToast();

  const currentPeriodeSetting = useConvexQuery(api.votingEom.getPeriode) || "";
  const [periodeInput, setPeriodeInput] = useState("");
  const [isEditingPeriode, setIsEditingPeriode] = useState(false);
  const updatePeriode = useConvexMutation(api.votingEom.updatePeriode);

  const headingData = useConvexQuery(api.votingEom.getEomHeading);
  const updateEomHeading = useConvexMutation(api.votingEom.updateEomHeading);
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [headingTitle, setHeadingTitle] = useState("");
  const [headingSubtitle, setHeadingSubtitle] = useState("");

  useEffect(() => {
    if (headingData && !isEditingHeading) {
      setHeadingTitle(headingData.title);
      setHeadingSubtitle(headingData.subtitle);
    }
  }, [headingData]);

  // Sync input with setting when it loads
  useEffect(() => {
    if (currentPeriodeSetting && !periodeInput) {
      setPeriodeInput(currentPeriodeSetting);
    }
  }, [currentPeriodeSetting]);

  const periode = currentPeriodeSetting || "Mei 2026";

  const allCandidates = useConvexQuery(api.votingEom.listCandidates, { periode }) ?? [];
  const stats = useConvexQuery(api.votingEom.getVoteStats, { periode });

  const createCandidate = useConvexMutation(api.votingEom.createCandidate);
  const updateCandidate = useConvexMutation(api.votingEom.updateCandidate);
  const removeCandidate = useConvexMutation(api.votingEom.removeCandidate);
  const resetVotes = useConvexMutation(api.votingEom.resetVotes);
  
  const votingStatusData = useConvexQuery(api.votingEom.getVotingStatus);
  const votingStatus = votingStatusData?.status;
  const currentDeadline = votingStatusData?.deadline;
  
  const toggleVotingStatus = useConvexMutation(api.votingEom.toggleVotingStatus);
  const reorderCandidates = useConvexMutation(api.votingEom.reorderCandidates);
  const updateDeadline = useConvexMutation(api.votingEom.updateDeadline);

  const history = useConvexQuery(api.votingEom.getPeriodeHistory) ?? [];
  const votes = useConvexQuery(api.votingEom.getVotesWithDetails, { periode }) ?? [];

  const whitelist = useConvexQuery(api.votingEom.getEomWhitelist) ?? [];
  const setEomWhitelist = useConvexMutation(api.votingEom.setEomWhitelist);
  const deleteVote = useConvexMutation(api.votingEom.deleteVote);

  const [candidates, setCandidates] = useState<EomCandidate[]>([]);
  const [showVotes, setShowVotes] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState("");

  useEffect(() => {
    if (allCandidates.length > 0) {
      setCandidates(allCandidates);
    }
  }, [allCandidates]);

  useEffect(() => {
    if (currentDeadline) {
      setDeadlineInput(currentDeadline);
    }
  }, [currentDeadline]);

  const handleUpdateDeadline = async () => {
    try {
      await updateDeadline({ deadline: deadlineInput });
      setIsEditingDeadline(false);
      toast({ title: "Deadline voting diperbarui" });
    } catch {
      toast({ title: "Gagal memperbarui deadline", variant: "destructive" });
    }
  };

  const handleReorder = (newOrder: EomCandidate[]) => {
    setCandidates(newOrder);
    reorderCandidates({ ids: newOrder.map(c => c._id) });
  };

  const handleCreate = async () => {
    try {
      await createCandidate({
        nama: "Kandidat Baru",
        seksi: "Seksi ...",
        periode,
        displayOrder: allCandidates.length,
      });
      toast({ title: "Kandidat baru ditambahkan" });
    } catch {
      toast({ title: "Gagal menambah kandidat", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: Id<"eomCandidates">, data: Record<string, unknown>) => {
    try {
      await updateCandidate({ id, ...data } as any);
    } catch {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    }
  };

  const handleDelete = async (id: Id<"eomCandidates">) => {
    try {
      await removeCandidate({ id });
      toast({ title: "Kandidat dihapus" });
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset semua suara periode ini?\n\nSemua data voting (hitungan + catatan audit Gmail/IP) akan DIHAPUS permanen. Lanjutkan?")) return;
    try {
      await resetVotes({ periode });
      toast({ title: "Semua suara dihapus", description: "Voting bisa dimulai ulang." });
    } catch {
      toast({ title: "Gagal mereset suara", variant: "destructive" });
    }
  };

  const handleUpdateHeading = async () => {
    try {
      await updateEomHeading({ title: headingTitle, subtitle: headingSubtitle });
      setIsEditingHeading(false);
      toast({ title: "Heading voting diperbarui" });
    } catch {
      toast({ title: "Gagal memperbarui heading", variant: "destructive" });
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = votingStatus === "open" ? "closed" : "open";
    const confirmMsg = newStatus === "closed" 
      ? "Kunci voting sekarang? Orang tidak akan bisa memberikan suara lagi."
      : "Buka kembali voting? Orang akan bisa memberikan suara.";
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await toggleVotingStatus({ status: newStatus });
      toast({ title: newStatus === "closed" ? "Voting Ditutup" : "Voting Dibuka" });
    } catch {
      toast({ title: "Gagal mengubah status voting", variant: "destructive" });
    }
  };

  const totalVotes = stats?.totalVotes ?? 0;
  const activeCount = allCandidates.filter((c: EomCandidate) => c.isActive).length;

  return (
    <AdminLayout>
      <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-base font-normal text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Voting EOM (Employee of the Month)
          </h1>
          <p className="mt-1 text-base text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Kelola kandidat, foto, dan pantau hasil voting Pegawai Teladan bulan ini.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium w-fit">
          ✅ Real-time via Convex — data tidak hilang saat refresh
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#001e40]">{totalVotes}</div>
              <div className="text-xs text-slate-500 font-medium">Total Suara</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#001e40]">{activeCount}</div>
              <div className="text-xs text-slate-500 font-medium">Kandidat Aktif</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              {isEditingPeriode ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={periodeInput}
                    onChange={(e) => setPeriodeInput(e.target.value)}
                    className="h-8 text-sm border-green-200 focus-visible:ring-green-500"
                    placeholder="Contoh: Mei 2026"
                  />
                  <Button
                    size="sm"
                    className="h-8 bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                      try {
                        await updatePeriode({ periode: periodeInput });
                        setIsEditingPeriode(false);
                        toast({ title: "Periode berhasil diperbarui" });
                      } catch {
                        toast({ title: "Gagal memperbarui periode", variant: "destructive" });
                      }
                    }}
                  >
                    Simpan
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-[#001e40]">{periode}</div>
                    <div className="text-xs text-slate-500 font-medium">Periode Aktif</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-green-600 hover:bg-green-50"
                    onClick={() => {
                      setPeriodeInput(periode);
                      setIsEditingPeriode(true);
                    }}
                  >
                    Ubah
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candidate Management */}
        <Card className="lg:col-span-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#001e40] [font-family:'Public_Sans',Helvetica]">
                Manajemen Kandidat EOM
              </h2>
              <Badge className="rounded-full bg-[#c6e7ff] px-3 py-1 text-xs font-normal tracking-[0.6px] text-[#001e2d] hover:bg-[#c6e7ff]">
                {allCandidates.length} KANDIDAT
              </Badge>
            </div>

            <div className="flex flex-col gap-5">
              <Reorder.Group axis="y" values={candidates} onReorder={handleReorder} className="space-y-5">
                {candidates.map((c) => (
                  <Reorder.Item
                    key={c._id}
                    value={c}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CandidateCard candidate={c} onDelete={handleDelete} onUpdate={handleUpdate} />
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              <Button
                variant="ghost"
                onClick={handleCreate}
                className="h-auto w-full justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-5 text-slate-500 hover:bg-slate-50"
              >
                <Plus className="w-5 h-5" /> Tambah Kandidat Baru
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <Card className="rounded-2xl border-none bg-white shadow-sm overflow-hidden group">
            <CardContent className="p-4 sm:p-6 flex flex-row items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status Voting</span>
                <div className="flex items-center gap-2">
                  <Badge className={`rounded-full px-3 ${votingStatus === "open" ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${votingStatus === "open" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    {votingStatus === "open" ? "Aktif / Terbuka" : "Tertutup / Terkunci"}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <Lock className={`w-5 h-5 ${votingStatus === "open" ? "text-slate-400" : "text-red-500"}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-white shadow-sm overflow-hidden group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline Voting</span>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              {isEditingDeadline ? (
                <div className="flex flex-col gap-2 mt-1">
                  <Input
                    type="datetime-local"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className="text-sm border-amber-200 focus-visible:ring-amber-400"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-9 bg-[#001e40] hover:bg-[#001e40]/90 text-white gap-1.5 text-sm"
                      onClick={handleUpdateDeadline}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Simpan
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-slate-500 border-slate-200 text-sm"
                      onClick={() => { setIsEditingDeadline(false); setDeadlineInput(currentDeadline || ""); }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#001e40] font-sans">
                    {currentDeadline
                      ? new Date(currentDeadline.length === 16 ? currentDeadline + ":00" : currentDeadline)
                          .toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                      : "Belum diatur"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-600 hover:bg-amber-50 h-7 px-2"
                    onClick={() => setIsEditingDeadline(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-white shadow-sm overflow-hidden group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Judul & Deskripsi</span>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <Award className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              {isEditingHeading ? (
                <div className="flex flex-col gap-2 mt-1">
                  <Input
                    value={headingTitle}
                    onChange={(e) => setHeadingTitle(e.target.value)}
                    placeholder="Pegawai Teladan Triwulan I"
                    className="text-sm border-blue-200 focus-visible:ring-blue-400"
                  />
                  <textarea
                    value={headingSubtitle}
                    onChange={(e) => setHeadingSubtitle(e.target.value)}
                    placeholder="Deskripsi singkat..."
                    rows={3}
                    className="text-sm border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-9 bg-[#001e40] hover:bg-[#001e40]/90 text-white gap-1.5 text-sm"
                      onClick={handleUpdateHeading}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Simpan
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-slate-500 border-slate-200 text-sm"
                      onClick={() => {
                        setIsEditingHeading(false);
                        if (headingData) {
                          setHeadingTitle(headingData.title);
                          setHeadingSubtitle(headingData.subtitle);
                        }
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-base font-bold text-[#001e40] font-sans line-clamp-2">
                    {headingTitle || "Pegawai Teladan Triwulan I"}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {headingSubtitle || "Apresiasi dedikasi dan kinerja terbaik..."}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:bg-blue-50 h-7 px-2 self-start mt-1"
                    onClick={() => setIsEditingHeading(true)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
              <h2 className="text-base font-semibold text-[#001e40] [font-family:'Public_Sans',Helvetica] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-500" /> Ranking Saat Ini
              </h2>
              {stats?.ranking && stats.ranking.length > 0 ? (
                <div className="space-y-3">
                  {stats.ranking.slice(0, 5).map((r: any, idx: number) => (
                    <div key={r._id} className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${idx === 0 ? "bg-[#fb8c00]" : idx === 1 ? "bg-[#001e40]" : "bg-slate-400"}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#001e40] truncate">{r.nama}</div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${idx === 0 ? "bg-[#fb8c00]" : idx === 1 ? "bg-[#001e40]" : "bg-slate-400"}`}
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{r.voteCount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Belum ada suara</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
              <h2 className="text-base font-semibold text-[#001e40]">Aksi</h2>
              
              <Button
                variant={votingStatus === "open" ? "default" : "secondary"}
                onClick={handleToggleStatus}
                className={`w-full gap-2 ${votingStatus === "open" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
              >
                {votingStatus === "open" ? (
                  <><Lock className="w-4 h-4" /> Kunci (Tutup Voting)</>
                ) : (
                  <><Unlock className="w-4 h-4" /> Buka Voting</>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowVotes(true)}
                className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Users className="w-4 h-4" /> Lihat Daftar Pemilih
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowWhitelist(true)}
                className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <ShieldCheck className="w-4 h-4" /> Whitelist Email Karyawan
                {whitelist.length > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{whitelist.length}</span>
                )}
              </Button>
              
              <div className="h-px bg-slate-100 my-1"></div>

              <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 mb-2"
                >
                  <RotateCcw className="w-4 h-4" /> Reset Hitungan Suara
                </Button>
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Hanya mereset angka tampilan — histori audit IP tetap tersimpan permanen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 bg-[#003366]">
            <CardContent className="p-4 sm:p-6">
              <div>
                <h3 className="mb-1.5 text-sm font-bold text-white">Tips Foto Kandidat</h3>
                <p className="text-xs leading-relaxed text-[#799dd6]">
                  Gunakan foto formal portrait rasio 4:5 dengan resolusi minimal 800×1000px.
                  Pastikan wajah terlihat jelas dan background profesional.
                  Cloudinary akan mengompresi ke WebP otomatis saat diunggah.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-[#001e40] flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" /> Riwayat Periode
              </h2>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((h) => (
                    <div key={h.periode} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{h.periode}</span>
                        <Badge variant="outline" className="text-[10px] bg-white">{h.totalVotes} Suara</Badge>
                      </div>
                      {h.winner ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-slate-200">
                            {h.winner.imageUrl ? (
                              <img src={h.winner.imageUrl} alt={h.winner.nama} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                <Users className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#001e40] truncate">{h.winner.nama}</div>
                            <div className="text-[10px] text-slate-500 truncate">{h.winner.seksi}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Tidak ada pemenang</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-400">Belum ada riwayat</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={showVotes} onOpenChange={setShowVotes}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl font-bold text-[#001e40] flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Audit Log Pemilih — {periode}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Info className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 leading-relaxed">
                <strong>Catatan audit permanen</strong> — data ini tidak dapat diubah atau dihapus oleh admin.
                Setiap baris adalah bukti sah voting dari IP yang unik.
              </p>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 pt-3">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b">#</th>
                    <th className="px-4 py-3 border-b">Gmail</th>
                    <th className="px-4 py-3 border-b">IP Address</th>
                    <th className="px-4 py-3 border-b">Pilihan</th>
                    <th className="px-4 py-3 border-b">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {votes.length > 0 ? (
                    votes.map((v: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50 group">
                        <td className="px-4 py-3 text-slate-400 text-xs">{votes.length - idx}</td>
                        <td className="px-4 py-3 text-xs text-blue-700 font-medium">{v.voterEmail || <span className="text-slate-300 italic">—</span>}</td>
                        <td className="px-4 py-3 font-mono text-xs bg-slate-50/50">{v.ipAddress}</td>
                        <td className="px-4 py-3 font-medium text-[#001e40]">{v.candidateName}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(v.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              if (!confirm(`Hapus vote dari ${v.voterEmail || v.ipAddress}?`)) return;
                              try {
                                await deleteVote({ voteId: v._id });
                                toast({ title: "Vote dihapus" });
                              } catch {
                                toast({ title: "Gagal menghapus", variant: "destructive" });
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Belum ada suara masuk</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {votes.length > 0 && (
              <p className="text-xs text-slate-400 text-center mt-3">
                Total {votes.length} suara tercatat — diurutkan dari yang terbaru
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* ── Whitelist Dialog ── */}
      <Dialog open={showWhitelist} onOpenChange={setShowWhitelist}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="text-xl font-bold text-[#001e40] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Whitelist Email Karyawan
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Hanya email yang terdaftar di sini yang dapat memberikan suara. Kosongkan daftar untuk membuka voting ke semua akun Google.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 pt-2 flex flex-col gap-4">
            {/* Add email input */}
            <div className="flex gap-2">
              <input
                type="email"
                value={whitelistInput}
                onChange={(e) => setWhitelistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const email = whitelistInput.toLowerCase().trim();
                    if (email && !whitelist.includes(email)) {
                      setEomWhitelist({ emails: [...whitelist, email] });
                      toast({ title: `${email} ditambahkan` });
                    }
                    setWhitelistInput("");
                  }
                }}
                placeholder="nama@gmail.com"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Button
                className="bg-[#001e40] hover:bg-[#001e40]/90 text-white text-sm px-4"
                onClick={() => {
                  const email = whitelistInput.toLowerCase().trim();
                  if (!email) return;
                  if (whitelist.includes(email)) {
                    toast({ title: "Email sudah ada", variant: "destructive" });
                    return;
                  }
                  setEomWhitelist({ emails: [...whitelist, email] });
                  toast({ title: `${email} ditambahkan` });
                  setWhitelistInput("");
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Email list */}
            {whitelist.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Whitelist kosong</p>
                <p className="text-xs mt-1">Semua akun Google bisa vote. Tambahkan email untuk membatasi.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {whitelist.map((email) => (
                  <div key={email} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100 group">
                    <span className="text-sm font-mono text-slate-700">{email}</span>
                    <button
                      onClick={() => {
                        setEomWhitelist({ emails: whitelist.filter((e) => e !== email) });
                        toast({ title: `${email} dihapus dari whitelist` });
                      }}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {whitelist.length > 0 && (
              <p className="text-xs text-slate-400 text-center">
                {whitelist.length} email terdaftar — hanya mereka yang bisa vote
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
