import OpenAI from "openai";

type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatbotRoute = "general_info" | "case_triage" | "live_chat_handoff";

export type ChatbotResponse = {
  answer: string;
  route: ChatbotRoute;
  agent: string;
  model: string;
  usedFallback: boolean;
  shouldEscalate: boolean;
  handoffReason: string | null;
};

type ProviderConfig = {
  name: string;
  baseURL: string;
  apiKeyEnv: string;
  models: string[];
};

const PROVIDERS: ProviderConfig[] = [
  {
    name: "nvidia",
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKeyEnv: "NVIDIA_API_KEY",
    models: [
      "meta/llama-3.1-8b-instruct",
      "mistralai/mistral-7b-instruct-v0.3",
    ],
  },
  {
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    models: [
      "meta-llama/llama-3.1-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free",
    ],
  },
];

const KNOWLEDGE_SECTIONS = [
  ["Tentang Putik Cemerlang", "Putik Cemerlang adalah portal layanan resmi Cabang Dinas Kelautan dan Perikanan Kabupaten Malang. Portal ini menjadi pusat informasi kelautan dan perikanan untuk pelayanan publik, data perikanan, dan edukasi konservasi."],
  ["Layanan Publik Utama", "Layanan publik yang tersedia di portal meliputi Buku Tamu, Pengaduan Masyarakat, Whistle Blowing System, Pelaporan Gratifikasi, Kontak Kami, profil instansi, serta informasi statistik dan konten layanan."],
  ["Profil dan Visi Layanan", "Portal menonjolkan pelayanan prima, transparan, dan inovatif di bidang kelautan dan perikanan berbasis teknologi informasi untuk mendukung masyarakat Kabupaten Malang."],
  ["Kontak dan Bantuan", "Halaman Kontak Kami menyediakan informasi kontak, lokasi, dan jam pelayanan. Jika pengunjung membutuhkan tindak lanjut spesifik, arahan terbaik adalah melanjutkan ke live chat agent atau kanal kontak resmi yang tersedia di portal."],
  ["Pedoman Jawaban Umum", "Untuk pertanyaan umum, jawab hanya berdasarkan konteks Putik Cemerlang dan layanan yang tampak di portal. Jangan mengarang kebijakan, nomor kontak, SLA, atau persyaratan yang tidak tersedia. Jika pertanyaan terlalu spesifik, terkait kasus individual, status laporan, kebutuhan verifikasi berkas, atau butuh keputusan petugas, arahkan ke live chat agent."],
];

function buildKnowledge() {
  return KNOWLEDGE_SECTIONS.map(([t, c]) => `${t}: ${c}`).join("\n\n");
}

const GENERAL_SYSTEM_PROMPT = `Kamu adalah chatbot resmi Putik Cemerlang.
Tugasmu menjawab pertanyaan umum seputar layanan Putik Cemerlang secara singkat, ramah, dan akurat.
Gunakan hanya pengetahuan yang diberikan tentang Putik Cemerlang.
Jika pengguna bertanya terlalu spesifik tentang kasus pribadi, status laporan, verifikasi berkas, penanganan teknis petugas, atau memerlukan tindak lanjut manusia, jelaskan secara singkat lalu arahkan ke live chat agent.
Jangan mengarang fakta yang tidak tersedia.
Gunakan bahasa Indonesia.`;

const CASE_TRIAGE_SYSTEM_PROMPT = `Kamu adalah agent triase Putik Cemerlang.
Tugasmu mengidentifikasi apakah pertanyaan masih bisa dijawab secara umum atau sudah masuk kasus spesifik.
Jika kasus spesifik, jelaskan kebutuhan tindak lanjut dan arahkan ke live chat agent.
Jika masih umum, berikan jawaban yang membantu tanpa mengarang detail administratif.
Gunakan bahasa Indonesia.`;

const LIVE_HANDOFF_SYSTEM_PROMPT = `Kamu adalah agent pengarah live chat Putik Cemerlang.
Tugasmu memberi respons singkat yang menjelaskan bahwa pertanyaan perlu ditangani petugas live chat agent.
Sebutkan alasan eskalasi dengan jelas dan sopan.
Jangan memberi jawaban substantif yang berisiko jika detail kasus belum diverifikasi.
Gunakan bahasa Indonesia.`;

const SPECIFIC_SIGNALS = ["kasus saya","laporan saya","status laporan","nomor laporan","berkas saya","dokumen saya","aduan saya","wbs saya","gratifikasi saya","kenapa belum","sudah submit","sudah kirim","tindak lanjut","verifikasi","tolong cek","cek status","pengaduan saya","pelaporan saya","masalah saya","butuh bantuan petugas","hubungkan saya","operator","admin","petugas"];
const HANDOFF_SIGNALS = ["live chat","chat admin","chat petugas","agen manusia","orang asli","staff","cs","customer service"];

function chooseRoute(message: string): { route: ChatbotRoute; handoffReason: string | null } {
  const lower = message.toLowerCase();
  const wantsHuman = HANDOFF_SIGNALS.some((s) => lower.includes(s));
  const isSpecific = SPECIFIC_SIGNALS.some((s) => lower.includes(s));

  if (wantsHuman) return { route: "live_chat_handoff", handoffReason: "Pengguna secara eksplisit meminta bantuan petugas atau live chat." };
  if (isSpecific) return { route: "case_triage", handoffReason: "Pertanyaan terindikasi terkait kasus atau tindak lanjut spesifik." };
  return { route: "general_info", handoffReason: null };
}

function getSystemPrompt(route: ChatbotRoute) {
  if (route === "live_chat_handoff") return LIVE_HANDOFF_SYSTEM_PROMPT;
  if (route === "case_triage") return CASE_TRIAGE_SYSTEM_PROMPT;
  return GENERAL_SYSTEM_PROMPT;
}

function getAgentName(route: ChatbotRoute) {
  if (route === "live_chat_handoff") return "live_chat_agent";
  if (route === "case_triage") return "case_triage_agent";
  return "general_info_agent";
}

async function callModel(provider: ProviderConfig, modelId: string, messages: ChatMessage[]) {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) throw new Error(`${provider.apiKeyEnv} is not configured`);
  const client = new OpenAI({ apiKey, baseURL: provider.baseURL });
  const completion = await client.chat.completions.create({
    model: modelId,
    temperature: 0.3,
    top_p: 0.8,
    max_tokens: 500,
    messages,
  });
  const content = completion.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error(`${provider.name}/${modelId} returned empty content`);
  return content.trim();
}

export async function generatePutikChatReply(userMessage: string): Promise<ChatbotResponse> {
  const { route, handoffReason } = chooseRoute(userMessage);
  const shouldEscalate = route !== "general_info";

  const messages: ChatMessage[] = [
    { role: "system", content: getSystemPrompt(route) },
    { role: "system", content: `Konteks Putik Cemerlang:\n${buildKnowledge()}` },
    {
      role: "user",
      content:
        route === "live_chat_handoff"
          ? `${userMessage}\n\nBerikan pengantar singkat untuk pengalihan ke live chat agent.`
          : shouldEscalate
            ? `${userMessage}\n\nTentukan apakah ini perlu live chat agent. Jika ya, arahkan dengan jelas.`
            : userMessage,
    },
  ];

  let lastError: Error | null = null;
  let attempt = 0;

  for (const provider of PROVIDERS) {
    if (!process.env[provider.apiKeyEnv]) continue;
    for (const modelId of provider.models) {
      try {
        const answer = await callModel(provider, modelId, messages);
        return {
          answer,
          route,
          agent: getAgentName(route),
          model: `${provider.name}/${modelId}`,
          usedFallback: attempt > 0,
          shouldEscalate,
          handoffReason,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown chatbot error");
        console.error(`[chatbot] ${provider.name}/${modelId} failed:`, lastError.message);
        attempt += 1;
      }
    }
  }

  throw lastError ?? new Error("Tidak ada provider chatbot yang tersedia (set NVIDIA_API_KEY atau OPENROUTER_API_KEY)");
}
