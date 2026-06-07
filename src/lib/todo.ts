import type { TaskStatus } from "@prisma/client";

export const taskStatusLabels: Record<TaskStatus, string> = {
  TODO: "할 일",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
};

export function parseOptionalDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000+09:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
