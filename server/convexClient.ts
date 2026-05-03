const CONVEX_URL = "https://mellow-gerbil-927.convex.cloud";

export async function convexQuery(path: string, args: Record<string, unknown> = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
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
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  if (!res.ok) throw new Error(`Convex mutation failed: ${res.statusText}`);
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.errorMessage || "Convex error");
  return data.value;
}
