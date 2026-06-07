import type { WeatherSummary } from "@/lib/weather";

type WeatherCardProps = {
  weather: WeatherSummary | null;
};

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <section className="portal-card stack">
      <div className="portal-card-header">
        <strong>날씨</strong>
        <span className="meta">Open-Meteo</span>
      </div>
      {weather ? (
        <div className="weather-box">
          <div>
            <span className="meta">{weather.city}</span>
            <span className="weather-date">{weather.dateLabel}</span>
            <strong>{weather.description}</strong>
            <span className="meta">업데이트 {weather.updatedTimeLabel}</span>
          </div>
          <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
          <div className="weather-grid">
            <span>체감 {Math.round(weather.apparentTemperature)}°C</span>
            <span>습도 {weather.humidity}%</span>
            <span>바람 {Math.round(weather.windSpeed)}km/h</span>
          </div>
        </div>
      ) : (
        <p className="muted">날씨 정보를 불러오지 못했습니다.</p>
      )}
    </section>
  );
}
