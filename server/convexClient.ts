const FALLBACK_CONVEX_URL = "https://fabulous-lemur-912.convex.cloud";

// CONVEX_URL dibaca saat request, bukan saat import: dotenv.config() di server/index.ts
// berjalan setelah ESM import dievaluasi, jadi module-scope read selalu kosong.
export async function convexQuery(path: string, args: Record<string, unknown> = {}) {
  const convexUrl = (process.env.CONVEX_URL || "").trim() || FALLBACK_CONVEX_URL;
  const res = await fetch(`${convexUrl}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  if (!res.ok) throw new Error(`Convex query failed: ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.errorMessage || "Convex error");
  return data.value;
}

export async function convexMutation(path: string, args: Record<string, unknown> = {}) {
  const convexUrl = (process.env.CONVEX_URL || "").trim() || FALLBACK_CONVEX_URL;
  const res = await fetch(`${convexUrl}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  if (!res.ok) throw new Error(`Convex mutation failed: ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.errorMessage || "Convex error");
  return data.value;
}
