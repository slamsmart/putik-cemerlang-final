/**
 * Identitas perangkat untuk akses kuesioner CEE.
 *
 * Hanya token id acak (bukan state akses). State akses (buka/kunci) hidup di
 * Convex (tabel `ceeAccess`) dan tersinkron realtime; id ini dipakai sebagai
 * kunci agar Convex tahu perangkat mana yang sudah membuka akses. Tanpa
 * login per-akun, perangkat butuh identitas kecil seperti ini (pola standar).
 */
const KEY = "cee-device-id";

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
  } catch {
    /* storage tidak tersedia — buat id baru tiap muat */
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* abaikan bila storage tidak tersedia */
  }
  return id;
}