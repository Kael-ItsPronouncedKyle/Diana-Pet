export const today = () => new Date().toISOString().slice(0, 10)

export const weekKey = () => {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(wk).padStart(2, '0')}`
}

export const getDailyKey = (date) => `diana-daily:${date || today()}`

export const getHour = () => new Date().getHours()

export const getTimeOfDay = () => {
  const h = getHour()
  if (h < 12) return 'morning'
  if (h < 17) return 'midday'
  return 'evening'
}

export const formatDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export const dayLabel = (dateStr) => {
  const t = today()
  if (dateStr === t) return 'Today'
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// Returns the last N days as YYYY-MM-DD strings (most recent last)
export const lastNDays = (n = 7) => {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}
