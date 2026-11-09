import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CEE_GROUPS, CEE_ITEMS, CEE_POSISI } from "@shared/cee";
import { getDeviceId } from "@/lib/ceeDevice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Send } from "lucide-react";

type Answers = Record<number, number>;

const TOTAL_BUTIR = CEE_ITEMS.length;

export default function CeeForm() {
  const { toast } = useToast();
  const deviceId = useMemo(getDeviceId, []);
  const nextKode = useQuery(api.cee.nextKode);
  const submit = useMutation(api.cee.submit);
  const unlockAccess = useMutation(api.cee.unlockAccess);
  // State akses hidup di Convex & realtime: ganti di tab lain / oleh admin
  // langsung tersinkron ke sini (tidak ada lagi sessionStorage).
  const access = useQuery(api.cee.accessStatus, { deviceId });
  const unlocked = access?.unlocked === true;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);

  const [posisi, setPosisi] = useState("");
  const [narasi, setNarasi] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [savedKode, setSavedKode] = useState<string | null>(null);

  const handleBukaAkses = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChecking(true);
    try {
      const cocok = await unlockAccess({ deviceId, password });
      if (!cocok) {
        toast({
          variant: "destructive",
          title: "Akses ditolak",
          description: "Kata sandi akses salah. Kuesioner tetap terkunci.",
        });
        setPassword("");
        return;
      }
      setPassword("");
      toast({ title: "Akses dibuka", description: "Form kuesioner kini dapat diisi." });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal memverifikasi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
      });
    } finally {
      setChecking(false);
    }
  };

  const terjawab = useMemo(() => Object.keys(answers).length, [answers]);
  const lengkap = terjawab === TOTAL_BUTIR;

  // ── Gerbang akses: form tetap terkunci sampai status Convex unlocked ───────
  if (access === undefined) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa status akses…
      </div>
    );
  }
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#c3c6d1] bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#001e40]">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-[#001e40]">Kuesioner Terkunci</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kuesioner ini bersifat internal. Masukkan kata sandi akses untuk membuka form pengisian.
          </p>
        </div>

        <form onSubmit={handleBukaAkses} className="mt-6">
          <Label htmlFor="cee-password" className="text-sm font-semibold text-slate-700">
            Kata sandi akses
          </Label>
          <div className="relative mt-2">
            <Input
              id="cee-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              className="h-11 rounded-xl border-slate-200 pr-11"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-[#001e40]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button
            type="submit"
            disabled={checking || password.length === 0}
            className="mt-4 h-11 w-full rounded-xl bg-[#001e40] text-sm text-white hover:bg-[#001e40]/90 disabled:opacity-50"
          >
            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Buka kuesioner
          </Button>
        </form>

        <p className="mt-2 text-center text-xs text-slate-400">
          Akses tersimpan selama sesi browser ini terbuka.
        </p>
      </div>
    );
  }

  const pilihJawaban = (nomor: number, value: number) => {
    setAnswers((previous) => ({ ...previous, [nomor]: value }));
  };

  const resetForm = () => {
    setPosisi("");
    setNarasi("");
    setAnswers({});
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!posisi) {
      toast({
        variant: "destructive",
        title: "Posisi belum dipilih",
        description: "Silakan pilih posisi Anda saat ini pada bagian Identitas Responden.",
      });
      return;
    }

    if (!lengkap) {
      toast({
        variant: "destructive",
        title: `Jawaban belum lengkap (${terjawab}/${TOTAL_BUTIR})`,
        description: "Semua pernyataan wajib dijawab sebelum kuesioner dikirim.",
      });
      return;
    }

    setSaving(true);
    try {
      const kode = await submit({
        posisi,
        ...(narasi.trim() ? { narasi: narasi.trim() } : {}),
        answers: CEE_ITEMS.map((item) => ({ itemId: item.no, value: answers[item.no] })),
      });
      setSavedKode(kode);
      resetForm();
      toast({ title: `Kuesioner tersimpan sebagai ${kode}`, description: "Terima kasih atas partisipasi Anda." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal menyimpan kuesioner",
        description: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (savedKode) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-emerald-900">Kuesioner berhasil dikirim</h3>
        <p className="mt-2 text-sm text-emerald-800">
          Jawaban Anda tersimpan dengan kode responden
        </p>
        <p className="mt-1 text-3xl font-black tracking-tight text-emerald-900">{savedKode}</p>
        <p className="mt-3 text-sm text-emerald-800">
          Kode ini dipakai pada kolom rekapitulasi. Identitas Anda tidak ditampilkan pada laporan.
        </p>
        <Button
          onClick={() => setSavedKode(null)}
          className="mt-6 h-auto rounded-lg bg-[#001e40] px-6 py-2.5 text-sm text-white hover:bg-[#001e40]/90"
        >
          Isi kuesioner lagi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <section className="rounded-2xl border border-[#c3c6d1] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#001e40]">Identitas Responden</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Kuesioner ini bersifat internal. Rekapitulasi hanya menampilkan kode responden (R1, R2, …),
              bukan identitas Anda.
            </p>
          </div>
          <div className="mt-3 shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-center sm:mt-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Kode responden Anda</p>
            <p className="text-2xl font-black text-[#001e40]">{nextKode ?? "…"}</p>
            <p className="text-[11px] text-blue-700">otomatis sesuai urutan pengisian</p>
          </div>
        </div>

        <div className="mt-5">
          <div>
            <Label className="text-sm font-semibold text-slate-700">
              Posisi saat ini <span className="text-red-600">*</span>
            </Label>
            <div role="radiogroup" aria-label="Posisi responden" className="mt-2 flex flex-col gap-2">
              {CEE_POSISI.map((option) => {
                const checked = posisi === option;
                return (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                      checked
                        ? "border-[#001e40] bg-blue-50 font-semibold text-[#001e40]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="posisi"
                      value={option}
                      checked={checked}
                      onChange={() => setPosisi(option)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        checked ? "border-[#001e40]" : "border-slate-300",
                      )}
                    >
                      {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#001e40]" />}
                    </span>
                    {option}
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      <div className="sticky top-16 z-10 flex items-center justify-between gap-3 rounded-xl border border-[#c3c6d1] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#001e40]">
            Progres pengisian: {terjawab}/{TOTAL_BUTIR} butir
          </p>
          <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 sm:w-64">
            <div
              className={cn("h-full rounded-full transition-all", lengkap ? "bg-emerald-500" : "bg-blue-600")}
              style={{ width: `${(terjawab / TOTAL_BUTIR) * 100}%` }}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving || !posisi || !lengkap}
          className="h-auto shrink-0 rounded-lg bg-[#001e40] px-5 py-2.5 text-sm text-white hover:bg-[#001e40]/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Kirim kuesioner
        </Button>
      </div>

      {CEE_GROUPS.map((group) => {
        const items = CEE_ITEMS.filter((item) => item.grup === group.kode);
        return (
          <section key={group.kode} className="rounded-2xl border border-[#c3c6d1] bg-white shadow-sm">
            <header className="flex items-start gap-3 border-b border-slate-200 bg-[#f7f9fb] px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#001e40] text-sm font-bold text-white">
                {group.kode}
              </span>
              <h3 className="pt-1 text-sm font-bold uppercase tracking-wide text-[#001e40]">
                {group.kode}. {group.judul}
              </h3>
            </header>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const terpilih = answers[item.no];
                return (
                  <div key={item.no} className="px-5 py-4">
                    <p className="flex gap-3 text-sm text-slate-800">
                      <span className="shrink-0 font-bold text-[#001e40]">{item.no}.</span>
                      <span>{item.text}</span>
                    </p>
                    <div
                      role="radiogroup"
                      aria-label={`Butir ${item.no}`}
                      className="mt-3 grid gap-2 pl-0 sm:grid-cols-2 sm:pl-7 xl:grid-cols-4"
                    >
                      {item.options.map((option) => {
                        const checked = terpilih === option.value;
                        return (
                          <label
                            key={option.value}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors",
                              checked
                                ? "border-[#001e40] bg-blue-50 font-semibold text-[#001e40]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300",
                            )}
                          >
                            <input
                              type="radio"
                              name={`butir-${item.no}`}
                              value={option.value}
                              checked={checked}
                              onChange={() => pilihJawaban(item.no, option.value)}
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                                checked ? "border-[#001e40]" : "border-slate-300",
                              )}
                            >
                              {checked && <span className="h-2 w-2 rounded-full bg-[#001e40]" />}
                            </span>
                            <span>
                              {option.value}. {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="rounded-2xl border border-[#c3c6d1] bg-white p-5 shadow-sm">
        <Label htmlFor="cee-narasi" className="text-sm font-semibold text-slate-700">
          Hal-hal lain terkait kondisi lingkungan pengendalian yang belum tercakup
          <span className="font-normal text-slate-400"> (opsional)</span>
        </Label>
        <Textarea
          id="cee-narasi"
          value={narasi}
          onChange={(event) => setNarasi(event.target.value)}
          rows={4}
          placeholder="Tuliskan narasi tambahan bila ada…"
          className="mt-2 rounded-xl border-slate-200"
        />
      </section>

      <div className="flex flex-col items-center gap-2 pb-4">
        <Button
          type="submit"
          disabled={saving || !posisi || !lengkap}
          className="h-auto rounded-lg bg-[#001e40] px-8 py-3 text-sm text-white hover:bg-[#001e40]/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Kirim kuesioner
        </Button>
        <p className="text-xs text-slate-500">
          {lengkap ? "Semua butir sudah dijawab." : `${TOTAL_BUTIR - terjawab} butir belum dijawab.`}
        </p>
      </div>
    </form>
  );
}
