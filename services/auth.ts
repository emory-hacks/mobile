import { fetch } from "expo/fetch";
import { Platform } from "react-native";

import { API_BASE_URL } from "@/constants/computer-ip";
import { isAdminToken } from "@/utils/admin-token";
import { clearJwt, getJwt, saveJwt } from "@/utils/auth-token";

export async function hasAdminSession(): Promise<boolean> {
  const jwt = await getJwt();
  if (!jwt) return false;
  if (!isAdminToken(jwt)) {
    await clearJwt();
    return false;
  }
  return true;
}

export async function signIn(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: Platform.OS === "web" ? "include" : "omit",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Email or password is incorrect.");
  }

  const data: unknown = await response.json();
  const token =
    data && typeof data === "object" && typeof (data as { token?: unknown }).token === "string"
      ? (data as { token: string }).token
      : null;

  if (!token) {
    throw new Error("Sign in failed.");
  }

  if (!isAdminToken(token)) {
    throw new Error("Only admins can edit the schedule.");
  }

  await saveJwt(token);
}

export async function signOut(): Promise<void> {
  await clearJwt();
}
