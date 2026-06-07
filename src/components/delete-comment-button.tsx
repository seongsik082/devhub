"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteCommentButtonProps = {
  commentId: string;
  postId: string;
};

export function DeleteCommentButton({ commentId, postId }: DeleteCommentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function deleteComment() {
    const confirmed = window.confirm("댓글을 삭제할까요?");

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });

    setIsLoading(false);

    if (!response.ok) {
      window.alert("댓글을 삭제하지 못했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <button className="button" disabled={isLoading} onClick={deleteComment} type="button">
      {isLoading ? "삭제 중..." : "삭제"}
    </button>
  );
}
