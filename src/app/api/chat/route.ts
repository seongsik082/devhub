import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/auth";

const chatSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

function createReply(message: string, isLoggedIn: boolean) {
  const text = message.toLowerCase();

  if (text.includes("할일") || text.includes("할 일") || text.includes("todo")) {
    return isLoggedIn
      ? "할 일은 홈 왼쪽 요약에서 확인하고, /todos에서 프로젝트와 태스크를 만들 수 있어요. 태스크 상태는 할 일, 진행 중, 완료로 바꿀 수 있습니다."
      : "할 일 목록은 로그인 후 볼 수 있어요. 로그인하면 홈 왼쪽에 내 남은 할 일이 표시됩니다.";
  }

  if (text.includes("게시판") || text.includes("글") || text.includes("댓글")) {
    return "게시판 글 목록은 홈과 /posts에서 볼 수 있어요. 글 상세, 댓글, 좋아요는 로그인 후 사용할 수 있습니다.";
  }

  if (text.includes("비밀번호") || text.includes("계정") || text.includes("아이디")) {
    return "아이디 찾기는 /find-id에서, 비밀번호 변경은 로그인 후 /account/password에서 할 수 있어요.";
  }

  if (text.includes("배포") || text.includes("vercel") || text.includes("db")) {
    return "이 사이트는 Vercel에 배포되어 있고, 데이터는 Neon PostgreSQL에 저장됩니다. Prisma로 DB 구조를 관리하고 있어요.";
  }

  return "지금은 DevHub 사용법을 안내하는 기본 챗봇입니다. 게시판, 할 일, 계정, 배포에 대해 물어보면 관련 화면과 흐름을 알려드릴게요.";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  const session = await readSession();

  return NextResponse.json({
    reply: createReply(parsed.data.message, Boolean(session)),
  });
}
