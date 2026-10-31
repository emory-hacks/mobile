export async function saveInfo(key: string, value: string): Promise<void> {
  sessionStorage.setItem(key, value);
}

export async function getInfo(key: string): Promise<string | null> {
  return sessionStorage.getItem(key);
}

export async function clearInfo(key: string): Promise<void> {
  sessionStorage.removeItem(key);
}
