"use client";

import { FormEvent, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "안녕하세요. DevHub 도우미입니다. 게시판, 할 일, 계정 기능 사용법을 물어보세요.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    const message = input?.value.trim();

    if (!input || !message) {
      return;
    }

    input.value = "";
    setMessages((current) => [...current, { role: "user", content: message }]);
    setIsLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = (await response.json()) as { reply?: string; error?: string };

    setIsLoading(false);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: response.ok
          ? data.reply ?? "답변을 만들지 못했습니다."
          : data.error ?? "잠시 후 다시 시도해주세요.",
      },
    ]);
  }

  return (
    <div className="chat-widget">
      {isOpen ? (
        <section className="chat-panel" aria-label="DevHub 챗봇">
          <div className="chat-header">
            <div>
              <strong>DevHub 챗봇</strong>
              <p className="meta">사이트 사용을 도와드려요.</p>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)} type="button">
              닫기
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {isLoading ? <div className="chat-message assistant">답변을 준비 중입니다...</div> : null}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input ref={inputRef} placeholder="예: 할 일은 어디서 만들어요?" />
            <button className="button primary" disabled={isLoading} type="submit">
              전송
            </button>
          </form>
        </section>
      ) : null}

      <button className="chat-fab" onClick={() => setIsOpen((value) => !value)} type="button">
        Chat
      </button>
    </div>
  );
}
