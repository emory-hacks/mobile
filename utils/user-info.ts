import * as SecureStore from "expo-secure-store";

export async function saveInfo(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getInfo(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function clearInfo(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
