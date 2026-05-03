import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { login } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        setLocation("/admin");
      } else {
        setError("Username atau password salah. Silakan coba lagi.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#001428] via-[#001e40] to-[#003366]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm"
      >
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <svg viewBox="0 0 32 32" className="h-9 w-9 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4a10 10 0 0 1 9.8 8H6.2A10 10 0 0 1 16 6zm0 20a10 10 0 0 1-9.8-8h19.6A10 10 0 0 1 16 26z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white [font-family:'Public_Sans',Helvetica]">
            PUTIK CEMERLANG
          </h1>
          <p className="mt-1 text-sm text-blue-200 [font-family:'Inter',Helvetica]">
            Portal Admin — Cabang Dinas Kelautan dan Perikanan Kab, Malang
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-1 text-lg font-semibold text-[#001e40] [font-family:'Public_Sans',Helvetica]">
            Masuk ke Dasbor
          </h2>
          <p className="mb-6 text-sm text-[#5f5e5e] [font-family:'Inter',Helvetica]">
            Masukkan kredensial administrator Anda untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                Username
              </label>
              <Input
                data-testid="input-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="border-slate-200 text-sm text-[#191c1e] focus-visible:ring-[#001e40]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#5f5e5e] [font-family:'Inter',Helvetica]">
                Password
              </label>
              <div className="relative">
                <Input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="border-slate-200 pr-10 text-sm text-[#191c1e] focus-visible:ring-[#001e40]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 [font-family:'Inter',Helvetica]"
                data-testid="error-login"
              >
                {error}
              </motion.p>
            )}

            <Button
              data-testid="button-login"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[#001e40] py-2.5 text-sm font-semibold text-white hover:bg-[#001e40]/90 disabled:opacity-70 [font-family:'Public_Sans',Helvetica]"
            >
              {loading ? "Memverifikasi…" : "Masuk"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-blue-300 [font-family:'Inter',Helvetica]">
          © 2026 Cabang Dinas Kelautan &amp; Perikanan Kabupaten Malang
        </p>
      </motion.div>
    </div>
  );
}
