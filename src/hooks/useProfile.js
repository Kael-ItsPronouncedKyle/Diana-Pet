import { useState, useCallback } from 'react'
import storage from '../utils/storage.js'
import { today } from '../utils/dates.js'

export function useProfile() {
  const [profile, setProfile] = useState(null)

  const saveProfile = useCallback(async (p) => {
    setProfile(p)
    await storage.set('diana-profile', p)
  }, [])

  const updateStreak = useCallback(async (p) => {
    const t = today()
    if (p.lastCheckIn === t) return p
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    const streak = p.lastCheckIn === yStr ? (p.streak || 0) + 1 : 1
    const next = { ...p, streak, lastCheckIn: t }
    await saveProfile(next)
    return next
  }, [saveProfile])

  return { profile, setProfile, saveProfile, updateStreak }
}
