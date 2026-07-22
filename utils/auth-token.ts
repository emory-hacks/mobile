import * as SecureStore from "expo-secure-store";

const JWT_KEY = "jwt";
const EMAIL_KEY = "email";

export async function saveJwt(token: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getJwt(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function clearJwt(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY);
}

export async function saveEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
}

export async function getEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(EMAIL_KEY);
}

export async function clearEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(EMAIL_KEY);
}
