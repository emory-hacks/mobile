import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { Announcement } from "@/types/announcement";
import { authRequest } from "@/utils/auth-request";
import { getJwt } from "@/utils/auth-token";

type AnnouncementUpdate = {
  correctedContent: string;
  correctedTitle: string;
  title: string;
};

export async function getAnnouncements(): Promise<Announcement[]> {
  const jwt = await getJwt();

  if (!jwt) {
    throw new Error("Please sign in to view announcements.");
  }

  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: "GET",
    ...authRequest(jwt),
  });

  if (!response.ok) {
    throw new Error(`Failed to load announcements (${response.status}).`);
  }

  const data: unknown = await response.json();

  // Fail clearly if the backend contract is different from the documented array.
  if (!Array.isArray(data)) {
    throw new Error("The announcements response has an unexpected format.");
  }

  return data as Announcement[];
}

export async function updateAnnouncement(
  updates: AnnouncementUpdate,
): Promise<void> {
  const jwt = await getJwt();
  const auth = authRequest(jwt ?? "");

  // The original title identifies the announcement being corrected.
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: "PATCH",
    ...auth,
    headers: {
      ...auth.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to edit announcement (${response.status}).`);
  }
}
