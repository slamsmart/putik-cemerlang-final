const SESSION_KEY = "putik_admin_auth";

export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "putik@malang2026",
};

export function login(username: string, password: string): boolean {
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
