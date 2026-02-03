import { useState, useEffect } from 'react'
import CreateDraftModal from './components/CreateDraftModal'
import Toast from './components/Toast'
import { isConfigured, getGBPPosterUrl } from './lib/gbpApi'
import type { WeatherData, ForecastDay, ContentSuggestion, ToastState } from './types'
import './App.css'

// Cincinnati coordinates
const CINCINNATI_LAT = 39.1031
const CINCINNATI_LON = -84.5120

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const gbpConfigured = isConfigured()

  useEffect(() => {
    fetchWeather()
  }, [])

  useEffect(() => {
    if (weather) {
      generateSuggestions(weather)
    }
  }, [weather])

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get grid point from NWS
      const pointRes = await fetch(`https://api.weather.gov/points/${CINCINNATI_LAT},${CINCINNATI_LON}`)
      const pointData = await pointRes.json()
      
      // Get forecast
      const forecastRes = await fetch(pointData.properties.forecast)
      const forecastData = await forecastRes.json()
      
      const periods = forecastData.properties.periods
      const today = periods[0]
      
      // Parse forecast
      const forecast: ForecastDay[] = []
      for (let i = 0; i < Math.min(7, periods.length); i += 2) {
        const dayPeriod = periods[i]
        const nightPeriod = periods[i + 1]
        forecast.push({
          date: dayPeriod.startTime.split('T')[0],
          day: new Date(dayPeriod.startTime).toLocaleDateString('en-US', { weekday: 'short' }),
          high: dayPeriod.temperature,
          low: nightPeriod?.temperature || dayPeriod.temperature - 15,
          condition: dayPeriod.shortForecast
        })
      }

      setWeather({
        temperature: today.temperature,
        condition: today.shortForecast,
        forecast
      })
    } catch (err) {
      setError('Could not fetch weather data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = (weather: WeatherData) => {
    const suggestions: ContentSuggestion[] = []
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()
    const month = new Date().getMonth()
    
    // Check for nice weekend weather
    const weekendDays = weather.forecast.filter(d => d.day === 'Sat' || d.day === 'Sun')
    const niceWeekend = weekendDays.some(d => d.high >= 65 && d.high <= 85 && !d.condition.toLowerCase().includes('rain'))

    // Spring/Summer nice weather
    if (temp >= 65 && temp <= 85 && !condition.includes('rain')) {
      suggestions.push({
        type: 'gbp',
        title: '☀️ Perfect Deck Weather Post',
        content: `Perfect deck weather in Cincinnati today! ${temp}°F and ${condition.toLowerCase()}. 

Is your backyard ready for the season? Our composite decks from Trex and TimberTech are built to last and require minimal maintenance - no staining, no splinters, just relaxation.

📞 Call (513) 555-1234 for a free estimate!

#CincinnatiDecks #DeckBuilder #OutdoorLiving #TrexDecking`,
        bestTime: 'Post between 11am-2pm for maximum visibility',
        tags: ['sunny', 'outdoor', 'seasonal']
      })
    }

    // Nice weekend ahead
    if (niceWeekend) {
      const niceDay = weekendDays.find(d => d.high >= 65 && d.high <= 85)
      suggestions.push({
        type: 'social',
        title: '🗓️ Weekend Weather Preview',
        content: `Beautiful weekend ahead in Cincinnati! ${niceDay?.day} looking like ${niceDay?.high}°F.

Perfect weather to enjoy your outdoor space... or to start dreaming about a new deck! 

What's your ideal backyard setup? Drop a comment below! 👇

#WeekendVibes #CincinnatiWeather #BackyardDreams`,
        bestTime: 'Post Thursday or Friday afternoon',
        tags: ['weekend', 'engagement', 'seasonal']
      })
    }

    // Rainy weather
    if (condition.includes('rain') || condition.includes('shower')) {
      suggestions.push({
        type: 'gbp',
        title: '🌧️ Rainy Day Planning Post',
        content: `Rainy day in Cincinnati? Perfect time to plan your dream deck!

While the weather keeps you inside, why not:
✅ Browse our gallery of completed projects
✅ Use our online quote calculator
✅ Schedule a free consultation

When the sun comes back, you'll be ready to start building!

📞 (513) 555-1234 | hickorydickorydecks.com

#DeckPlanning #CincinnatiDeckBuilder`,
        bestTime: 'Post in morning when people check weather',
        tags: ['rain', 'planning', 'indoor']
      })
    }

    // Cold weather (winter planning)
    if (temp < 45) {
      suggestions.push({
        type: 'email',
        title: '❄️ Winter Planning Campaign',
        content: `Subject: Plan Your Spring Deck Project Now - Beat the Rush!

Hi [Name],

While it's cold outside (${temp}°F today!), smart homeowners are already planning their spring deck projects.

Why plan now?
🔹 Lock in 2024 pricing before spring increases
🔹 First in line for spring installation
🔹 More time to choose perfect colors and materials
🔹 Avoid the busy season wait times

We're booking spring installations NOW. The first warm weeks fill up fast!

Schedule your free consultation: (513) 555-1234

Best,
Hickory Dickory Decks Cincinnati`,
        bestTime: 'Send January-February',
        tags: ['winter', 'planning', 'email']
      })
    }

    // Hot weather
    if (temp > 85) {
      suggestions.push({
        type: 'gbp',
        title: '🔥 Hot Weather Composite Post',
        content: `It's ${temp}°F in Cincinnati! ☀️

Did you know composite decking stays cooler than traditional wood? Our Trex and TimberTech boards won't burn your feet like dark wood decking.

Plus: No splinters, no staining, no worries.

Stay cool out there! And when you're ready for a deck that can handle the heat, give us a call.

📞 (513) 555-1234

#CompositeDecking #CincinnatiSummer #CoolDecks`,
        bestTime: 'Post mid-morning before peak heat',
        tags: ['hot', 'benefits', 'summer']
      })
    }

    // Spring (March-May)
    if (month >= 2 && month <= 4) {
      suggestions.push({
        type: 'gbp',
        title: '🌷 Spring Season Opener',
        content: `Spring is HERE Cincinnati! 🌷

Time to shake off winter and get your outdoor living space ready. Whether you're dreaming of:

🏡 A new deck for family cookouts
🌿 A pergola for shade
🏊 A pool surround to complete your backyard oasis

NOW is the perfect time to start. Spring installations book fast!

Free estimates: (513) 555-1234

#SpringProjects #CincinnatiDeckBuilder #OutdoorLiving`,
        bestTime: 'Post on first nice spring day',
        tags: ['spring', 'seasonal', 'booking']
      })
    }

    // Fall (September-November)
    if (month >= 8 && month <= 10) {
      suggestions.push({
        type: 'gbp',
        title: '🍂 Fall Building Season',
        content: `Fall in Cincinnati is PERFECT for deck building! 🍂

Cooler temps, less humidity, and your deck will be ready for spring entertaining.

Plus: Fall builds often mean faster scheduling and our crews aren't dealing with summer heat.

Don't wait for spring - beat the rush and build now!

📞 (513) 555-1234

#FallConstruction #CincinnatiDecks #DeckSeason`,
        bestTime: 'Post when leaves start changing',
        tags: ['fall', 'building', 'seasonal']
      })
    }

    setSuggestions(suggestions.length > 0 ? suggestions : [{
      type: 'gbp',
      title: '📣 General Engagement Post',
      content: `What's your favorite thing about having a deck?

Drop a comment below! 👇

Whether it's morning coffee, evening cookouts, or just watching the kids play - we love hearing how our decks become part of your daily life.

#DeckLife #CincinnatiDecks #OutdoorLiving`,
      bestTime: 'Post mid-week for engagement',
      tags: ['engagement', 'evergreen']
    }])
  }

  const copyContent = (content: string, index: number) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCreateDraft = (suggestion: ContentSuggestion) => {
    if (!gbpConfigured) {
      setToast({
        type: 'error',
        message: 'GBP integration not configured. Check .env file.',
      })
      return
    }
    setSelectedSuggestion(suggestion)
  }

  const handleDraftSuccess = (_postId: string, editUrl: string) => {
    setToast({
      type: 'success',
      message: 'Draft created successfully!',
    })
    // Open the edit page in a new tab
    window.open(getGBPPosterUrl(editUrl), '_blank')
  }

  const handleDraftError = (message: string) => {
    setToast({
      type: 'error',
      message,
    })
  }

  const getWeatherEmoji = (condition: string) => {
    const c = condition.toLowerCase()
    if (c.includes('sun') || c.includes('clear')) return '☀️'
    if (c.includes('cloud') && c.includes('part')) return '⛅'
    if (c.includes('cloud')) return '☁️'
    if (c.includes('rain') || c.includes('shower')) return '🌧️'
    if (c.includes('thunder')) return '⛈️'
    if (c.includes('snow')) return '❄️'
    return '🌤️'
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🌤️ Weather Content Suggester</h1>
        <p>Hickory Dickory Decks Cincinnati</p>
      </header>

      {loading && <div className="loading">Loading weather...</div>}
      {error && <div className="error">{error}</div>}

      {weather && (
        <>
          <div className="weather-card">
            <div className="current-weather">
              <span className="weather-emoji">{getWeatherEmoji(weather.condition)}</span>
              <div className="weather-info">
                <span className="temp">{weather.temperature}°F</span>
                <span className="condition">{weather.condition}</span>
              </div>
            </div>
            <div className="forecast">
              {weather.forecast.slice(0, 5).map((day, i) => (
                <div key={i} className="forecast-day">
                  <span className="day-name">{day.day}</span>
                  <span className="day-emoji">{getWeatherEmoji(day.condition)}</span>
                  <span className="day-temps">{day.high}° / {day.low}°</span>
                </div>
              ))}
            </div>
          </div>

          <h2 className="section-title">📝 Content Suggestions Based on Weather</h2>

          <div className="suggestions">
            {suggestions.map((suggestion, i) => (
              <div key={i} className={`suggestion-card type-${suggestion.type}`}>
                <div className="suggestion-header">
                  <span className="suggestion-type">{suggestion.type.toUpperCase()}</span>
                  <span className="suggestion-title">{suggestion.title}</span>
                </div>
                <pre className="suggestion-content">{suggestion.content}</pre>
                <div className="suggestion-meta">
                  <span className="best-time">⏰ {suggestion.bestTime}</span>
                  <div className="tags">
                    {suggestion.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                  </div>
                </div>
                <div className="suggestion-actions">
                  {suggestion.type === 'gbp' && (
                    <button
                      className="create-draft-btn"
                      onClick={() => handleCreateDraft(suggestion)}
                      disabled={!gbpConfigured}
                      title={!gbpConfigured ? 'Configure GBP integration in .env' : ''}
                    >
                      ✨ Create GBP Draft
                    </button>
                  )}
                  <button
                    className={`copy-btn ${copiedIndex === i ? 'copied' : ''}`}
                    onClick={() => copyContent(suggestion.content, i)}
                  >
                    {copiedIndex === i ? '✓ Copied!' : '📋 Copy Content'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className="footer">
        <button onClick={fetchWeather} className="refresh-btn">🔄 Refresh Weather</button>
        <p>Weather data from NWS (National Weather Service)</p>
        {!gbpConfigured && (
          <p className="config-warning">
            ⚠️ GBP integration not configured. Set up .env to enable draft creation.
          </p>
        )}
      </footer>

      {selectedSuggestion && (
        <CreateDraftModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onSuccess={handleDraftSuccess}
          onError={handleDraftError}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
