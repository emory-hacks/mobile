import { fetch } from "expo/fetch";

import { API_BASE_URL } from "@/constants/computer-ip";
import type { ScheduleEvent } from "@/types/schedule-event";

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
