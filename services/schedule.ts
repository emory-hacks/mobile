import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { ScheduleEvent } from "@/types/schedule-event";
import { authRequest } from "@/utils/auth-request";
import { getJwt } from "@/utils/auth-token";

export type ScheduleEventInput = {
  body: string;
  endTime: string;
  isDeadline: boolean;
  location: string;
  points: number;
  startTime: string;
  title: string;
};

export type ScheduleEventUpdate = {
  correctedBody?: string;
  correctedEndTime?: string;
  correctedIsDeadline?: boolean;
  correctedLocation?: string;
  correctedPoints?: number;
  correctedStartTime?: string;
  correctedTitle?: string;
  title: string;
};

export async function getSchedule(): Promise<ScheduleEvent[]> {
  const response = await fetch(`${API_BASE_URL}/schedule`, {
    method: "GET",
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

async function readError(response: Response, fallback: string) {
  const text = (await response.text()).trim();
  if (!text) return `${fallback} (${response.status}).`;

  try {
    const data = JSON.parse(text) as { message?: unknown };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // The API sometimes returns plain text.
  }

  return text;
}

async function authorizedFetch(path: string, init: RequestInit) {
  const jwt = await getJwt();
  const auth = authRequest(jwt ?? "");

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    ...auth,
    headers: {
      ...auth.headers,
      ...init.headers,
    },
  });
}

export async function createScheduleEvent(
  event: ScheduleEventInput,
): Promise<void> {
  const response = await authorizedFetch("/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to add event"));
  }
}

export async function updateScheduleEvent(
  updates: ScheduleEventUpdate,
): Promise<void> {
  const response = await authorizedFetch("/schedule", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to edit event"));
  }
}

export async function deleteScheduleEvent(title: string): Promise<void> {
  const response = await authorizedFetch(
    `/schedule/${encodeURIComponent(title)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to delete event"));
  }
}
