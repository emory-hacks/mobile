const JWT_KEY = "jwt";
const EMAIL_KEY = "email";
const ROLE_KEY = "role";

export async function saveJwt(token: string): Promise<void> {
  sessionStorage.setItem(JWT_KEY, token);
}

export async function getJwt(): Promise<string | null> {
  return sessionStorage.getItem(JWT_KEY);
}

export async function clearJwt(): Promise<void> {
  sessionStorage.removeItem(JWT_KEY);
}

export async function saveEmail(email: string): Promise<void> {
  sessionStorage.setItem(EMAIL_KEY, email);
}

export async function getEmail(): Promise<string | null> {
  return sessionStorage.getItem(EMAIL_KEY);
}

export async function clearEmail(): Promise<void> {
  sessionStorage.removeItem(EMAIL_KEY);
}

export async function saveRole(role: string): Promise<void> {
  sessionStorage.setItem(ROLE_KEY, role);
}

export async function getRole(): Promise<string | null> {
  return sessionStorage.getItem(ROLE_KEY);
}

export async function clearRole(): Promise<void> {
  sessionStorage.removeItem(ROLE_KEY);
}
