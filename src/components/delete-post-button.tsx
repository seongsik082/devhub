"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePostButtonProps = {
  postId: string;
};

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function deletePost() {
    const confirmed = window.confirm("게시글을 삭제할까요? 댓글도 함께 삭제됩니다.");

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

    if (response.ok) {
      router.push("/posts");
      router.refresh();
      return;
    }

    setIsLoading(false);
    window.alert("게시글을 삭제하지 못했습니다.");
  }

  return (
    <button className="button" disabled={isLoading} onClick={deletePost} type="button">
      {isLoading ? "삭제 중..." : "삭제"}
    </button>
  );
}
