export interface WeatherData {
  temperature: number
  condition: string
  forecast: ForecastDay[]
}

export interface ForecastDay {
  date: string
  day: string
  high: number
  low: number
  condition: string
}

export interface ContentSuggestion {
  type: 'gbp' | 'social' | 'email'
  title: string
  content: string
  bestTime: string
  tags: string[]
}

export interface ToastMessage {
  message: string
  type: 'success' | 'error' | 'info'
}

export type ToastState = ToastMessage | null
