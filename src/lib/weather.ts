export type WeatherSummary = {
  city: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  time: string;
};

const weatherDescriptions: Record<number, string> = {
  0: "맑음",
  1: "대체로 맑음",
  2: "부분적으로 흐림",
  3: "흐림",
  45: "안개",
  48: "서리 안개",
  51: "약한 이슬비",
  53: "이슬비",
  55: "강한 이슬비",
  61: "약한 비",
  63: "비",
  65: "강한 비",
  71: "약한 눈",
  73: "눈",
  75: "강한 눈",
  80: "약한 소나기",
  81: "소나기",
  82: "강한 소나기",
  95: "뇌우",
};

type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

export async function getSeoulWeather(): Promise<WeatherSummary | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", "37.5665");
  url.searchParams.set("longitude", "126.9780");
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m",
  );
  url.searchParams.set("timezone", "Asia/Seoul");

  try {
    const response = await fetch(url, {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;

    if (
      typeof current?.temperature_2m !== "number" ||
      typeof current.apparent_temperature !== "number" ||
      typeof current.relative_humidity_2m !== "number" ||
      typeof current.wind_speed_10m !== "number" ||
      typeof current.weather_code !== "number" ||
      !current.time
    ) {
      return null;
    }

    return {
      city: "서울",
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      description: weatherDescriptions[current.weather_code] ?? "날씨 정보",
      time: current.time,
    };
  } catch {
    return null;
  }
}
