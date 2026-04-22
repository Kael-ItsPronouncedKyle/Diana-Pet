import { useState, useCallback } from 'react'
import storage from '../utils/storage.js'
import { getDailyKey } from '../utils/dates.js'

export function useDaily() {
  const [dailyData, setDailyData] = useState({})

  const saveDaily = useCallback(async (d) => {
    setDailyData(d)
    await storage.set(getDailyKey(), d)
  }, [])

  const updateDaily = useCallback((patch) => {
    let nextValue = null
    setDailyData(prev => {
      nextValue = { ...prev, ...patch }
      return nextValue
    })
    return storage.set(getDailyKey(), nextValue)
  }, [])

  const updateDailyNested = useCallback((key, patch) => {
    let nextValue = null
    setDailyData(prev => {
      nextValue = { ...prev, [key]: { ...(prev[key] || {}), ...patch } }
      return nextValue
    })
    return storage.set(getDailyKey(), nextValue)
  }, [])

  return { dailyData, setDailyData, saveDaily, updateDaily, updateDailyNested }
}
