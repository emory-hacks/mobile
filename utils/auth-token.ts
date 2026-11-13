import * as SecureStore from "expo-secure-store";

const JWT_KEY = "jwt";

export async function saveJwt(token: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getJwt(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function clearJwt(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY);
}
