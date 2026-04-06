import { useState, useCallback } from 'react'
import storage from '../utils/storage.js'
import { getDailyKey } from '../utils/dates.js'

export function useDaily() {
  const [dailyData, setDailyData] = useState({})

  const saveDaily = useCallback(async (d) => {
    setDailyData(d)
    await storage.set(getDailyKey(), d)
  }, [])

  const updateDaily = useCallback(async (patch) => {
    setDailyData(prev => {
      const next = { ...prev, ...patch }
      storage.set(getDailyKey(), next)
      return next
    })
  }, [])

  const updateDailyNested = useCallback(async (key, patch) => {
    setDailyData(prev => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), ...patch } }
      storage.set(getDailyKey(), next)
      return next
    })
  }, [])

  return { dailyData, setDailyData, saveDaily, updateDaily, updateDailyNested }
}
