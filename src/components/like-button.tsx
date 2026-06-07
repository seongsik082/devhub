"use client";

import { useState } from "react";

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleLike() {
    setIsLoading(true);
    const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    const data = (await response.json()) as { liked?: boolean; count?: number; error?: string };
    setIsLoading(false);

    if (!response.ok || typeof data.liked !== "boolean" || typeof data.count !== "number") {
      window.alert(data.error ?? "좋아요를 처리하지 못했습니다.");
      return;
    }

    setLiked(data.liked);
    setCount(data.count);
  }

  return (
    <button
      className={liked ? "button primary" : "button"}
      disabled={isLoading}
      onClick={toggleLike}
      type="button"
    >
      {isLoading ? "처리 중..." : liked ? `좋아요 취소 ${count}` : `좋아요 ${count}`}
    </button>
  );
}
