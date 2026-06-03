import { useState } from "react";
import * as LucideIcons from "lucide-react";

type ChatbotApiResponse = {
  answer: string;
  route: "general_info" | "case_triage" | "live_chat_handoff";
  agent: string;
  model: string;
  usedFallback: boolean;
  shouldEscalate: boolean;
  handoffReason: string | null;
};

type UiMessage = {
  role: "assistant" | "user";
  content: string;
};

const welcomeMessage =
  "Halo, saya asisten Putik Cemerlang. Saya siap membantu pertanyaan umum seputar layanan. Untuk kasus yang lebih spesifik, saya akan arahkan ke live chat agent.";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastMeta, setLastMeta] = useState<ChatbotApiResponse | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: "assistant", content: welcomeMessage },
  ]);

  const canStart = fullName.trim().length > 1 && email.trim().includes("@");

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading || !isStarted) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Nama: ${fullName}\nEmail: ${email}\nPertanyaan: ${text}`,
        }),
      });

      if (!response.ok) {
        let errMsg = "Chatbot request failed";
        try {
          const errJson = await response.json();
          errMsg = errJson?.message || errMsg;
        } catch {
          const errorText = await response.text();
          if (errorText) errMsg = errorText;
        }
        throw new Error(errMsg);
      }

      const data = (await response.json()) as ChatbotApiResponse;
      setLastMeta(data);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: detail
            ? `Maaf, layanan chat belum merespons. (${detail})`
            : "Maaf, layanan chat sedang belum bisa merespons. Silakan coba lagi sebentar atau lanjutkan ke live chat agent untuk bantuan langsung.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-[#dbe7f5] bg-white shadow-[0_18px_60px_rgba(0,30,64,0.18)]">
          <div className="bg-[linear-gradient(135deg,#005b96_0%,#0096db_100%)] px-4 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  <LucideIcons.Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-['Public_Sans',Helvetica] text-[15px] font-semibold leading-tight">Putik Assistant</h3>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-blue-50/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7ee0ff]" />
                    <span>Powered by NVIDIA NIM</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Tutup live chat"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white transition hover:bg-white/10"
              >
                <LucideIcons.X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isStarted ? (
            <div className="bg-white px-5 py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#d8f4ff_0%,#dff7ea_55%,#e9fff5_100%)]">
                <LucideIcons.Leaf className="h-6 w-6 text-[#0c8ed0]" />
              </div>

              <div className="mt-3 text-center">
                <h4 className="font-['Public_Sans',Helvetica] text-[15px] font-semibold text-[#22324a]">Sebelum memulai chat</h4>
                <p className="mt-1 text-[12px] leading-5 text-[#718096]">
                  Masukkan nama dan email agar kami bisa melayani lebih baik.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[12px] font-medium text-[#4a5568]">Nama Lengkap</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="h-10 w-full rounded-lg border border-[#d8e2ef] bg-white px-3 text-[13px] text-[#1f2d3d] outline-none transition placeholder:text-[#9aa7b8] focus:border-[#23a9ee] focus:ring-2 focus:ring-[#8fdcff]/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[12px] font-medium text-[#4a5568]">Alamat Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                    className="h-10 w-full rounded-lg border border-[#d8e2ef] bg-white px-3 text-[13px] text-[#1f2d3d] outline-none transition placeholder:text-[#9aa7b8] focus:border-[#23a9ee] focus:ring-2 focus:ring-[#8fdcff]/40"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setIsStarted(true)}
                disabled={!canStart}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-[linear-gradient(135deg,#007fc7_0%,#11a9f3_100%)] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(0,137,208,0.22)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Mulai Chat
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-[#dcebfa] bg-[#eef8ff] px-4 py-2 text-[11px] text-[#4c6380]">
                <span className="truncate">{fullName} • {email}</span>
                <span className="ml-2 shrink-0">{lastMeta ? lastMeta.agent : "general_info_agent"}</span>
              </div>

              <div className="max-h-[360px] space-y-3 overflow-y-auto bg-[#f7fbff] px-4 py-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={
                        message.role === "user"
                          ? "max-w-[82%] rounded-2xl rounded-br-md bg-[linear-gradient(135deg,#007fc7_0%,#12aaf5_100%)] px-3.5 py-2 text-[13px] leading-5 text-white shadow-sm"
                          : "max-w-[82%] rounded-2xl rounded-bl-md border border-[#d5e8f8] bg-white px-3.5 py-2 text-[13px] leading-5 text-[#31455f] shadow-sm"
                      }
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-[#d5e8f8] bg-white px-3.5 py-2 text-[12px] text-[#5f7897] shadow-sm">
                      Asisten sedang menyusun jawaban...
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#dcebfa] bg-white px-4 py-3">
                {lastMeta?.shouldEscalate ? (
                  <div className="mb-2 rounded-lg border border-[#b6e4ff] bg-[#edf8ff] px-2.5 py-2 text-[11px] leading-4 text-[#0f5f93]">
                    {lastMeta.handoffReason || "Pertanyaan ini lebih cocok ditangani live chat agent."}
                  </div>
                ) : null}

                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    rows={1}
                    placeholder="Tanyakan layanan Putik Cemerlang..."
                    className="min-h-[40px] max-h-24 flex-1 resize-none rounded-lg border border-[#d8e2ef] px-3 py-2 text-[13px] text-[#24384d] outline-none transition placeholder:text-[#95a3b5] focus:border-[#23a9ee] focus:ring-2 focus:ring-[#8fdcff]/40"
                  />

                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#007fc7_0%,#11a9f3_100%)] text-white transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <LucideIcons.Send className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-[#72839a]">
                  <span>{lastMeta?.usedFallback ? "Fallback model" : "Primary model"}</span>
                  <span className="truncate">{lastMeta?.model || "meta/llama-3.1-8b-instruct"}</span>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#007fc7_0%,#11a9f3_100%)] text-white shadow-[0_18px_40px_rgba(0,137,208,0.3)] transition-all hover:scale-110 active:scale-95"
        aria-label="Buka live chat Putik Cemerlang"
      >
        <LucideIcons.MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
