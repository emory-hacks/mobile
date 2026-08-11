import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { ScheduleEvent } from "@/types/schedule-event";
import { getJwt } from "@/utils/auth-token";

export type ScheduleEventUpdate = {
  correctedBody?: string;
  correctedEndTime?: string;
  correctedLocation?: string;
  correctedStartTime?: string;
  correctedTitle?: string;
  title: string;
};

export async function getSchedule(): Promise<ScheduleEvent[]> {
  const jwt = await getJwt();

  if (!jwt) {
    throw new Error("Please sign in to view the schedule.");
  }

  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: "GET",
    credentials: "omit",
    headers: {
      Cookie: `token=${jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load the schedule (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("The schedule response has an unexpected format.");
  }

  return data as ScheduleEvent[];
}

export async function updateScheduleEvent(
  updates: ScheduleEventUpdate,
): Promise<void> {
  const jwt = await getJwt();

  if (!jwt) {
    throw new Error("Please sign in to edit events.");
  }

  const response = await fetch(`${API_BASE_URL}/schedule`, {
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
    throw new Error(message || `Failed to edit event (${response.status}).`);
  }
}
