const SESSION_KEY = "putik_admin_auth";

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
