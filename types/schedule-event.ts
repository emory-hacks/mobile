export type ScheduleEvent = {
  body?: string;
  endTime: string;
  id: number | string;
  location: string;
  // The backend currently calls this field `name`.
  name: string;
  startTime: string;
};
