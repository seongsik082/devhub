import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { postSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("multipart/form-data")
    ? await request.formData().catch(() => null)
    : null;
  const body = formData
    ? {
        title: formData.get("title"),
        content: formData.get("content"),
      }
    : await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const attachments = formData
    ? formData
        .getAll("attachments")
        .filter((file): file is File => file instanceof File && file.size > 0)
    : [];

  if (attachments.length > 3) {
    return NextResponse.json({ error: "첨부파일은 최대 3개까지 가능합니다." }, { status: 400 });
  }

  const allowedTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
    "text/plain",
  ]);
  const attachmentData = [];

  for (const file of attachments) {
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: "첨부파일은 파일당 1MB 이하여야 합니다." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: "이미지, PDF, 텍스트 파일만 첨부할 수 있습니다." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    attachmentData.push({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`,
    });
  }

  const post = await getDb().post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: session.id,
      attachments:
        attachmentData.length > 0
          ? {
              create: attachmentData,
            }
          : undefined,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
