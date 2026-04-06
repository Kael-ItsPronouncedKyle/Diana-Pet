// localStorage wrapper — same async interface as window.storage spec
const storage = {
  async get(key) {
    try {
      const val = localStorage.getItem(key)
      return val !== null ? JSON.parse(val) : null
    } catch {
      return null
    }
  },
  async set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val))
      return true
    } catch {
      return false
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  async list(prefix) {
    try {
      return Object.keys(localStorage).filter(k => k.startsWith(prefix))
    } catch {
      return []
    }
  },
}

export default storage
