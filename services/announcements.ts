import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { Announcement } from "@/types/announcement";
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

  // expo/fetch keeps our manual Cookie header. React Native's regular fetch may treat Cookie as managed and remove it before sending the request.
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: "GET",
    credentials: "omit",
    headers: {
      Cookie: `token=${jwt}`,
    },
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

  if (!jwt) {
    throw new Error("Please sign in to edit announcements.");
  }

  // The original title identifies the announcement being corrected.
  const response = await fetch(`${API_BASE_URL}/api/announcements`, {
    method: "PATCH",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${jwt}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Failed to edit announcement (${response.status}).`);
  }
}
