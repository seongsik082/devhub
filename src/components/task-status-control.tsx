"use client";

import type { TaskStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { taskStatusLabels } from "@/lib/todo";

type TaskStatusControlProps = {
  projectId: string;
  taskId: string;
  status: TaskStatus;
};

const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskStatusControl({ projectId, taskId, status }: TaskStatusControlProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(nextStatus: TaskStatus) {
    setIsLoading(true);
    await fetch(`/api/todos/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="segmented">
      {statuses.map((item) => (
        <button
          className={item === status ? "segment active" : "segment"}
          disabled={isLoading || item === status}
          key={item}
          onClick={() => updateStatus(item)}
          type="button"
        >
          {taskStatusLabels[item]}
        </button>
      ))}
    </div>
  );
}
