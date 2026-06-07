"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteTaskButtonProps = {
  projectId: string;
  taskId: string;
};

export function DeleteTaskButton({ projectId, taskId }: DeleteTaskButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function deleteTask() {
    if (!window.confirm("이 할 일을 삭제할까요?")) {
      return;
    }

    setIsLoading(true);
    await fetch(`/api/todos/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <button className="button" disabled={isLoading} onClick={deleteTask} type="button">
      {isLoading ? "삭제 중..." : "삭제"}
    </button>
  );
}
