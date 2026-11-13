const JWT_KEY = "jwt";

export async function saveJwt(token: string): Promise<void> {
  sessionStorage.setItem(JWT_KEY, token);
}

export async function getJwt(): Promise<string | null> {
  return sessionStorage.getItem(JWT_KEY);
}

export async function clearJwt(): Promise<void> {
  sessionStorage.removeItem(JWT_KEY);
}
