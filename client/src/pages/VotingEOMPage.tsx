import { useState, useEffect } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import PublicNavbar from "@/components/PublicNavbar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Vote, CalendarDays, Users, ShieldCheck, Trophy, Medal, Star, Globe, Mail, Phone, CheckCircle2, Lock, LogOut
} from "lucide-react";

type GoogleUser = { sub: string; email: string; name: string; picture?: string };

export default function VotingEOMPage() {
  const { toast } = useToast();
  const currentPeriodeSetting = useConvexQuery(api.votingEom.getPeriode);
  const periode = currentPeriodeSetting || "Mei 2026";
  const heading = useConvexQuery(api.votingEom.getEomHeading);
  const [clientIp, setClientIp] = useState<string>("");
  const [ipLoading, setIpLoading] = useState(true);
  const [votingDone, setVotingDone] = useState(false);
  const [votingFor, setVotingFor] = useState<Id<"eomCandidates"> | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<{ id: Id<"eomCandidates">; nama: string } | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setGoogleLoading(true);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const info = await res.json();
        setGoogleUser({ sub: info.sub, email: info.email, name: info.name, picture: info.picture });
      } catch {
        toast({ title: "Gagal mengambil info akun Google", variant: "destructive" });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast({ title: "Login Google dibatalkan atau gagal", variant: "destructive" });
      setGoogleLoading(false);
    },
  });

  const handleGoogleLogout = () => {
    googleLogout();
    setGoogleUser(null);
    setVotingDone(false);
  };

  // Fetch IP publik
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => { setClientIp(d.ip || "unknown"); setIpLoading(false); })
      .catch(() => { setClientIp("unknown-" + Date.now()); setIpLoading(false); });
  }, []);

  const candidates = useConvexQuery(api.votingEom.listActiveCandidates) ?? [];
  const stats = useConvexQuery(api.votingEom.getVoteStats, { periode });

  // Cek sudah vote berdasarkan email Google (primer)
  const hasVotedByEmail = useConvexQuery(
    api.votingEom.checkVotedByEmail,
    googleUser ? { voterEmail: googleUser.email, periode } : "skip"
  );
  const hasVoted = hasVotedByEmail === true;

  const votingStatusData = useConvexQuery(api.votingEom.getVotingStatus);
  const votingStatus = votingStatusData?.status;
  const isFull = votingStatusData?.isFull ?? false;
  const maxVotes = votingStatusData?.maxVotes ?? 23;
  const deadline = votingStatusData?.deadline;
  
  const castVote = useConvexMutation(api.votingEom.castVote);
  const voterNames = useConvexQuery(api.votingEom.getVoterNames, { periode }) ?? [];

  useEffect(() => {
    if (hasVoted === true) setVotingDone(true);
  }, [hasVoted]);

  const handleVoteClick = (id: Id<"eomCandidates">, nama: string) => {
    if (!googleUser) {
      toast({ title: "Login Diperlukan", description: "Silakan login dengan akun Google Anda terlebih dahulu.", variant: "destructive" });
      return;
    }
    if (votingStatus === "closed") {
      toast({ title: "Voting Ditutup", description: "Periode pemilihan telah berakhir.", variant: "destructive" });
      return;
    }
    if (isFull) {
      toast({ title: "Kuota Penuh", description: `Semua ${maxVotes} slot pemilih sudah terisi.`, variant: "destructive" });
      return;
    }
    if (votingDone || hasVoted) {
      toast({ title: "Sudah Memilih", description: "Anda sudah memberikan suara pada periode ini.", variant: "destructive" });
      return;
    }
    setSelectedCandidate({ id, nama });
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    if (!selectedCandidate) return;
    if (!googleUser) {
      toast({ title: "Harus login Google dulu", variant: "destructive" });
      return;
    }
    if (ipLoading || !clientIp) {
      toast({
        title: "Mohon Tunggu",
        description: "Sistem sedang mendeteksi koneksi Anda. Coba lagi dalam beberapa detik.",
        variant: "destructive",
      });
      return;
    }
    setVotingFor(selectedCandidate.id);
    try {
      await castVote({
        candidateId: selectedCandidate.id,
        ipAddress: clientIp,
        voterId: googleUser.sub,
        voterEmail: googleUser.email,
        voterName: googleUser.name,
        periode,
      });
      setVotingDone(true);
      toast({ title: "Terima Kasih! 🎉", description: `Suara Anda untuk ${selectedCandidate.nama} berhasil direkam.` });
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    } finally {
      setVotingFor(null);
      setShowConfirm(false);
      setSelectedCandidate(null);
    }
  };

  const totalVotes = stats?.totalVotes ?? 0;
  const ranking = stats?.ranking ?? [];
  const top3 = ranking.slice(0, 3);

  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const calculate = () => {
      const now = new Date().getTime();
      // Normalisasi format: "2026-05-08T23:59" → "2026-05-08T23:59:00"
      // Format datetime-local tanpa detik bisa menyebabkan NaN di beberapa browser
      const normalizedDeadline = deadline.length === 16 ? deadline + ":00" : deadline;
      const target = new Date(normalizedDeadline).getTime();

      if (isNaN(target)) return; // guard: jika format tidak valid, jangan crash

      const distance = target - now;
      if (distance < 0) {
        setTimeLeft(null);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculate(); // Jalankan langsung — jangan tunggu 1 detik
    const timer = setInterval(calculate, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-['Inter',Helvetica] min-h-screen">
      <PublicNavbar />

      <main>
        {/* ── Hero Section ── */}
        <section className="pt-20 relative overflow-hidden">
          <div
            className="pt-20 pb-44 text-white relative"
            style={{ background: "linear-gradient(180deg, #001e40 0%, #004d99 100%)" }}
          >
            {/* Glow decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00a3ff]/20 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight font-['Public_Sans',Helvetica]">
                  {heading?.title || "Pegawai Teladan Triwulan I"}
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  {heading?.subtitle || "Apresiasi dedikasi dan kinerja terbaik rekan kerja Anda. Berikan suara untuk kandidat yang paling mencerminkan nilai integritas Cabang Dinas Kelautan dan Perikanan Kabupaten Malang."}
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto -mb-24">
                {/* Kuota Pemilih */}
                <div className="bg-white/10 backdrop-blur-[10px] border border-white/20 p-10 rounded-2xl flex flex-col items-center text-center">
                  <Users className="w-9 h-9 text-[#fb8c00] mb-4" />
                  <div className="text-4xl font-bold mb-1">
                    {totalVotes.toLocaleString()}
                    <span className="text-xl font-normal text-white/50">/{maxVotes}</span>
                  </div>
                  <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">Pemilih</div>
                  {/* Progress bar kuota */}
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? "bg-red-400" : "bg-[#fb8c00]"
                      }`}
                      style={{ width: `${Math.min((totalVotes / maxVotes) * 100, 100)}%` }}
                    />
                  </div>
                  {isFull && (
                    <span className="mt-2 text-[10px] font-bold text-red-300 uppercase tracking-widest">Kuota Penuh</span>
                  )}
                </div>
                <div className="bg-white/10 backdrop-blur-[10px] border border-white/20 p-10 rounded-2xl flex flex-col items-center text-center">
                  <Award className="w-9 h-9 text-[#fb8c00] mb-4" />
                  <div className="text-4xl font-bold mb-1">{candidates.length}</div>
                  <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Kandidat Terpilih</div>
                </div>
                <div className="bg-white/10 backdrop-blur-[10px] border border-white/20 p-10 rounded-2xl flex flex-col items-center text-center">
                  <CalendarDays className="w-9 h-9 text-[#fb8c00] mb-4" />
                  <div className="text-4xl font-bold mb-1">
                    {timeLeft ? (
                      timeLeft.days > 0 
                        ? `${timeLeft.days} Hari` 
                        : `${timeLeft.hours.toString().padStart(2, '0')}:${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`
                    ) : (deadline && new Date().getTime() > new Date(deadline).getTime()) ? "Berakhir" : "-"}
                  </div>
                  <div className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {timeLeft 
                      ? (timeLeft.days > 0 ? `${timeLeft.hours} Jam ${timeLeft.minutes} Menit` : "Sisa Waktu (Jam:Menit:Detik)") 
                      : "Sisa Waktu"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Security Notice + Google Sign-In ── */}
        <section className="pt-32 pb-8">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex flex-col gap-4 max-w-3xl mx-auto">
            {/* Security notice */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#001e40] mb-0.5">Pemberitahuan Sistem Keamanan</p>
                <p className="text-sm text-slate-600">
                  Setiap akun Google hanya diperbolehkan memberikan <strong>satu suara</strong> per periode.
                  Voting hanya untuk <strong>karyawan Cabdin KP Kab. Malang</strong> yang terdaftar.
                </p>
              </div>
              <div className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-xl ${
                isFull ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-100"
              }`}>
                <span className={`text-2xl font-bold ${ isFull ? "text-red-600" : "text-[#001e40]"}`}>
                  {maxVotes - totalVotes}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sisa Slot</span>
              </div>
            </div>

            {/* Google Sign-In gate */}
            {!googleUser ? (
              <div className="bg-white border-2 border-dashed border-blue-200 p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                  <Mail className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#001e40] mb-1">Login Google Diperlukan</p>
                  <p className="text-sm text-slate-500">Gunakan akun Gmail karyawan Cabdin KP Kab. Malang untuk dapat memberikan suara.</p>
                </div>
                <button
                  onClick={() => { setGoogleLoading(true); googleLogin(); }}
                  disabled={googleLoading}
                  className="flex items-center gap-3 bg-white border border-slate-300 hover:border-slate-400 px-6 py-3 rounded-xl shadow-sm font-semibold text-slate-700 transition-all active:scale-95 disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? "Menghubungkan..." : "Login dengan Google"}
                </button>
              </div>
            ) : (
              <div className="bg-white border border-green-200 p-5 rounded-2xl flex items-center gap-4">
                {googleUser.picture && (
                  <img src={googleUser.picture} alt={googleUser.name} className="w-11 h-11 rounded-full border-2 border-green-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#001e40] truncate">{googleUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{googleUser.email}</p>
                  {(votingDone || hasVoted) && (
                    <p className="text-xs text-green-600 font-semibold mt-0.5">✓ Suara sudah diberikan periode ini</p>
                  )}
                </div>
                <button
                  onClick={handleGoogleLogout}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Daftar Pemilih (nama saja) ── */}
        {voterNames.length > 0 && (
          <section className="pb-4">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 max-w-3xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Sudah Memilih ({voterNames.length}/{maxVotes})
                </p>
                <div className="flex flex-wrap gap-2">
                  {voterNames.map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-[#001e40] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {v.name.charAt(0).toUpperCase()}
                      </span>
                      {v.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Candidate Grid ── */}
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#001e40] mb-2 font-['Public_Sans',Helvetica]">Daftar Kandidat</h2>
                <p className="text-slate-600">Pilih satu kandidat terbaik berdasarkan performa bulan ini.</p>
              </div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg text-blue-700 text-xs font-bold uppercase tracking-wider">
                <CalendarDays className="w-4 h-4 mr-2" /> Periode: {periode}
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Belum ada kandidat untuk periode ini.</p>
                <p className="text-sm">Admin perlu menambahkan kandidat melalui dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {candidates.map((c) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-200 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                      <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-6 relative bg-slate-100 flex-shrink-0">
                        {c.imageUrl ? (
                          <img
                            alt={c.nama}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${votingStatus === "closed" ? "grayscale" : ""}`}
                            src={c.imageUrl}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <Award className="w-16 h-16 mb-2" />
                            <span className="text-sm">Foto belum tersedia</span>
                          </div>
                        )}
                      </div>
                      <div className="px-4 pb-4 flex flex-col flex-1">
                        <h3 className="text-2xl font-bold text-[#001e40] mb-1">{c.nama}</h3>
                        <span className="text-sm font-semibold text-[#191c1e] uppercase tracking-widest block mb-6 flex-1">
                          {c.seksi}
                        </span>
                        {votingStatus === "closed" || (deadline && new Date().getTime() > new Date(deadline).getTime()) ? (
                          <div className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm">
                            <Lock className="w-5 h-5" /> VOTING BERAKHIR
                          </div>
                        ) : isFull && !(votingDone || hasVoted) ? (
                          <div className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm border border-red-100">
                            <Lock className="w-5 h-5" /> KUOTA PENUH
                          </div>
                        ) : votingDone || hasVoted ? (
                          <div className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-sm">
                            <CheckCircle2 className="w-5 h-5" /> SUDAH MEMILIH
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVoteClick(c._id, c.nama)}
                            disabled={votingFor === c._id}
                            className="w-full bg-[#00a3ff] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Vote className="w-5 h-5" />
                            {votingFor === c._id ? "MEMPROSES..." : "VOTE SEKARANG"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>

        {/* ── Ranking Section ── */}
        {top3.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
              <div className="bg-[#f7f9fb] rounded-[3rem] p-8 md:p-16 border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#00a3ff]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-[#001e40] mb-4 font-['Public_Sans',Helvetica]">Hasil Sementara</h2>
                    <p className="text-slate-600">Update real-time perolehan suara terbanyak saat ini.</p>
                  </div>

                  <div className="space-y-10">
                    {top3.map((r, idx) => {
                      const rankColors = [
                        { bg: "bg-[#fb8c00]", shadow: "shadow-orange-200" },
                        { bg: "bg-[#001e40]", shadow: "shadow-slate-200" },
                        { bg: "bg-[#001e40]/40", shadow: "" },
                      ];
                      const icons = [
                        <Trophy key={0} className="w-5 h-5" />,
                        <Medal key={1} className="w-5 h-5" />,
                        <Star key={2} className="w-5 h-5" />,
                      ];

                      return (
                        <div key={r._id} className="relative">
                          <div className="flex items-center gap-6 mb-3">
                            <div
                              className={`w-12 h-12 ${rankColors[idx]?.bg ?? "bg-slate-400"} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${rankColors[idx]?.shadow ?? ""}`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-grow flex justify-between items-end">
                              <span className="text-xl font-bold text-[#001e40]">{r.nama}</span>
                              <span className="text-sm font-bold text-[#001e40]">
                                {r.voteCount} Suara ({r.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-4 bg-white rounded-full overflow-hidden border border-slate-200">
                            <motion.div
                              className={`h-full ${idx === 0 ? "bg-[#fb8c00]" : idx === 1 ? "bg-[#001e40]" : "bg-[#001e40]/40"} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${r.percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── Confirm Modal ── */}
      <AnimatePresence>
        {showConfirm && selectedCandidate && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-[#00a3ff]" />
                </div>
                <h3 className="text-xl font-bold text-[#001e40] mb-2">Konfirmasi Pilihan</h3>
                <p className="text-slate-600">
                  Anda akan memberikan suara untuk <strong>{selectedCandidate.nama}</strong>.
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmVote}
                  className="flex-1 py-3 rounded-xl bg-[#00a3ff] text-white font-semibold hover:bg-blue-600 transition-all active:scale-95"
                >
                  Ya, Vote!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,1000 C300,800 400,1000 1000,800 L1000,1000 L0,1000 Z" fill="white" />
          </svg>
        </div>
        <div className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-start max-w-[1280px] mx-auto gap-8 relative z-10">
          <div className="max-w-md">
            <div className="text-white font-bold text-lg mb-4">Putik Cemerlang</div>
            <p className="font-['Public_Sans',Helvetica] text-sm leading-relaxed text-slate-300 mb-6 text-justify">
              Pusat Informasi Kelautan Cabang Dinas Kelautan dan Perikanan Malang yang menyediakan data dan informasi kelautan untuk mendukung pelayanan publik, memudahkan akses informasi bagi masyarakat dan pemangku kepentingan secara cepat, akurat, dan informatif.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <Mail className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer transition-all">
                <Phone className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 py-6 border-t border-white/10 relative z-10">
          <p className="font-['Public_Sans',Helvetica] text-sm text-slate-400 text-center md:text-left">
            © 2025 Putik Cemerlang - Cabdin KP Kab. Malang. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
