const WEATHER_API_KEY = "c8aa3c4a4e7bfc5f7c7c3ac4c8a3c4a4"; // API key pentru OpenWeatherMap
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

interface WeatherData {
  temperature: number;
  city: string;
}

// Funcție pentru a obține vreme după coordonate
export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      city: data.name,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Return fallback data
    return {
      temperature: 12,
      city: "București",
    };
  }
}

// Funcție pentru a obține vreme după numele orașului
export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_API_URL}?q=${encodeURIComponent(
        cityName
      )},RO&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      city: data.name,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Return fallback data
    return {
      temperature: 12,
      city: cityName,
    };
  }
}

// Pentru Brașov, România (default)
export const DEFAULT_LOCATION = {
  latitude: 45.6427,
  longitude: 25.5887,
};

// Oraș default - modifică aici pentru alt oraș
export const DEFAULT_CITY = "Brașov";
