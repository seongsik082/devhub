import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  getRequestMeta,
  isLoginLocked,
  loginWindowMinutes,
  maxFailedLoginAttempts,
  recordLoginAttempt,
} from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { ipAddress } = getRequestMeta(request);
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (await isLoginLocked(parsed.data.email, ipAddress)) {
    return NextResponse.json(
      {
        error: `${loginWindowMinutes}분 안에 로그인 실패가 ${maxFailedLoginAttempts}회 이상 발생했습니다. 잠시 후 다시 시도해주세요.`,
      },
      { status: 429 },
    );
  }

  const user = await getDb().user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    await recordLoginAttempt({
      email: parsed.data.email,
      ipAddress,
      success: false,
      reason: "USER_NOT_FOUND",
    });
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const isPasswordValid = await compare(parsed.data.password, user.passwordHash);

  if (!isPasswordValid) {
    await recordLoginAttempt({
      email: parsed.data.email,
      ipAddress,
      success: false,
      reason: "INVALID_PASSWORD",
    });
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await recordLoginAttempt({
    email: parsed.data.email,
    ipAddress,
    success: true,
  });

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
