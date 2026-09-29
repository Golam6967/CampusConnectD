import { useState, useEffect } from "react";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const response = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&timezone=auto`,
                );
                const data = await response.json();
                if (data && data.current) {
                  setWeather({
                    ...data.current,
                    timezone: data.timezone,
                  });
                  setError(null);
                } else {
                  throw new Error("Invalid weather data");
                }
              } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to fetch weather");
                fetchDefaultWeather(23.8103, 90.2289);
              } finally {
                setLoading(false);
              }
            },
            (err) => {
              console.error("Geolocation error:", err);
              fetchDefaultWeather(23.8103, 90.2289);
            },
          );
        } else {
          fetchDefaultWeather(23.8103, 90.2289);
        }
      } catch (err) {
        console.error("Setup error:", err);
        setError("Weather service unavailable");
        setLoading(false);
      }
    };

    const fetchDefaultWeather = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=celsius&timezone=auto`,
        );
        const data = await response.json();
        if (data && data.current) {
          setWeather({
            ...data.current,
            timezone: data.timezone,
          });
          setError(null);
        } else {
          throw new Error("Invalid weather data");
        }
      } catch (err) {
        console.error("Default weather error:", err);
        setError("Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code) => {
    if (!code) return "🌤️";
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 85 && code <= 86) return "🌨️";
    if (code >= 80 && code <= 99) return "⛈️";
    return "🌤️";
  };

  const getWeatherDescription = (code) => {
    if (!code) return "Unknown";
    if (code === 0) return "Clear";
    if (code === 1 || code === 2) return "Mostly Clear";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code === 80 || code === 81 || code === 82) return "Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 80 && code <= 99) return "Thunderstorm";
    return "Variable";
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white/90 backdrop-blur-md p-4 shadow-2xl animate-pulse border-l-4 border-[#e50914] h-48">
        <div className="h-6 bg-gradient-to-r from-[#e50914]/30 to-[#b00020]/30 rounded w-3/4 mb-2"></div>
        <div className="space-y-2">
          <div className="h-5 bg-gradient-to-r from-[#e50914]/20 to-[#b00020]/20 rounded"></div>
          <div className="h-5 bg-gradient-to-r from-[#e50914]/20 to-[#b00020]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-xl bg-white/90 backdrop-blur-md p-4 shadow-2xl border-l-4 border-[#e50914] border-2">
        <p className="text-xs text-gray-700 font-medium">
          {error || "Unable to load weather"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-white/80 via-gray-50/80 to-white/70 backdrop-blur-sm shadow-lg border border-white/40 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-[#e50914]/30 group/weather">
      {/* Header - Elegant and Compact */}
      <div
        className="relative bg-gradient-to-r from-[#e50914]/95 via-[#b00020]/95 to-[#e50914]/95 p-4 cursor-pointer transition-all duration-500 hover:from-[#d00813] hover:via-[#a0001c] hover:to-[#d00813] active:scale-[0.98] overflow-hidden"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
        </div>
        
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl group-hover/weather:bg-white/30 transition-all duration-500" />
              <div className="relative text-5xl group-hover/weather:scale-110 transition-transform duration-500 drop-shadow-lg">
                {getWeatherIcon(weather.weather_code)}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/80 font-semibold tracking-wide uppercase mb-0.5">Live Weather</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-white leading-none tracking-tight">
                  {Math.round(weather.temperature_2m)}°
                </p>
                <span className="text-sm text-white/70 font-medium">celsius</span>
              </div>
              <p className="text-xs text-white/70 font-medium mt-0.5">
                {getWeatherDescription(weather.weather_code)}
              </p>
            </div>
          </div>
          <button className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 group/btn">
            <svg
              className={`w-5 h-5 text-white transition-all duration-500 ${expanded ? "rotate-180" : ""} group-hover/btn:scale-110`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Details</span>
          </button>
        </div>
      </div>

      {/* Content - Collapsible with modern styling */}
      <div
        className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-96" : "max-h-0"}`}
      >
        <div className="p-4 space-y-2.5 bg-gradient-to-b from-gray-50/60 to-white/40">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Feels Like */}
            <div className="group/stat relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm p-3 border border-gray-200/50 hover:border-[#e50914]/40 transition-all duration-300 hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#e50914]/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-[#e50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Feels Like</span>
                </div>
                <p className="text-xl font-black text-gray-900 group-hover/stat:text-[#e50914] transition-colors">
                  {Math.round(weather.apparent_temperature)}°
                </p>
              </div>
            </div>

            {/* Humidity */}
            <div className="group/stat relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm p-3 border border-gray-200/50 hover:border-[#e50914]/40 transition-all duration-300 hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Humidity</span>
                </div>
                <p className="text-xl font-black text-gray-900 group-hover/stat:text-blue-600 transition-colors">
                  {weather.relative_humidity_2m}%
                </p>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="group/stat relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm p-3 border border-gray-200/50 hover:border-[#e50914]/40 transition-all duration-300 hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-teal-600 group-hover/stat:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wind</span>
                </div>
                <p className="text-xl font-black text-gray-900 group-hover/stat:text-teal-600 transition-colors">
                  {Math.round(weather.wind_speed_10m)}
                  <span className="text-xs font-semibold ml-0.5">km/h</span>
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="group/stat relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-sm p-3 border border-gray-200/50 hover:border-[#e50914]/40 transition-all duration-300 hover:shadow-lg cursor-pointer">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xl group-hover/stat:scale-110 transition-transform duration-300">{getWeatherIcon(weather.weather_code)}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Condition</span>
                </div>
                <p className="text-sm font-bold text-gray-900 group-hover/stat:text-purple-600 transition-colors leading-tight">
                  {getWeatherDescription(weather.weather_code)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer bar with update time */}
          <div className="flex items-center justify-center gap-2 pt-2 mt-1 border-t border-gray-200/60">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold text-gray-500">
              Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
