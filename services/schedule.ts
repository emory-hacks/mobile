import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { ScheduleEvent } from "@/types/schedule-event";
import { getJwt } from "@/utils/auth-token";

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
