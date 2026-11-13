import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { ScheduleEvent } from "@/types/schedule-event";
import { authRequest } from "@/utils/auth-request";
import { getJwt } from "@/utils/auth-token";

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

export async function updateScheduleEvent(
  updates: ScheduleEventUpdate,
): Promise<void> {
  const jwt = await getJwt();
  const auth = authRequest(jwt ?? "");

  const response = await fetch(`${API_BASE_URL}/schedule`, {
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
    throw new Error(message || `Failed to edit event (${response.status}).`);
  }
}
