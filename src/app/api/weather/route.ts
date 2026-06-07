import { NextResponse } from "next/server";
import { getSeoulWeather } from "@/lib/weather";

export async function GET() {
  const weather = await getSeoulWeather();

  if (!weather) {
    return NextResponse.json({ error: "날씨 정보를 불러오지 못했습니다." }, { status: 502 });
  }

  return NextResponse.json({ weather });
}
