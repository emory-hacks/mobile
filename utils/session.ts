import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";

import { getEmail, getJwt, getRole, saveEmail, saveRole } from "./auth-token";
import { saveInfo } from "./user-info";

type UserSessionData = {
  checkedIn?: boolean;
  email?: string;
  id?: number | string;
  name?: string;
  points?: number;
  role?: string;
  teamName?: string;
  totalPoints?: number;
};

export async function saveUserSession(
  userData: UserSessionData,
  fallbackEmail: string,
): Promise<void> {
  await saveEmail(userData.email || fallbackEmail);
  const actualRole = String(userData.role ?? "participant");
  if ((await getRole()) !== actualRole) {
    await saveRole(actualRole);
  }
  await saveInfo("name", userData.name ?? "");
  await saveInfo("id", String(userData.id ?? ""));
  await saveInfo("teamName", userData.teamName ?? "");
  await saveInfo(
    "points",
    String(userData.points ?? userData.totalPoints ?? 0),
  );
  await saveInfo("checkedIn", String(!!userData.checkedIn));
}

export async function restoreSession(): Promise<boolean> {
  const jwt = await getJwt();
  const email = (await getEmail()) || emailFromJwt(jwt);

  if (!jwt || !email) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/api/users/${email}`, {
    method: "GET",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${jwt}`,
    },
  });

  if (!response.ok) {
    return false;
  }

  const userData = (await response.json()) as UserSessionData;
  await saveUserSession(userData, email);
  return true;
}

function emailFromJwt(token: string | null): string | null {
  if (!token) return null;

  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    const pad =
      padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const payload = JSON.parse(atob(padded + pad)) as {
      email?: unknown;
      sub?: unknown;
    };

    if (typeof payload.email === "string" && payload.email) {
      return payload.email;
    }
    if (typeof payload.sub === "string" && payload.sub.includes("@")) {
      return payload.sub;
    }
    return null;
  } catch {
    return null;
  }
}
