// Tarayıcı içi kalıcı depolama.
// Artifact'taki window.storage arayüzünün localStorage ile birebir karşılığı,
// böylece App.jsx içindeki kod değişmeden çalışır.
const storage = {
  async get(key) {
    const value = localStorage.getItem(key)
    if (value === null) throw new Error('Kayıt bulunamadı: ' + key)
    return { key, value }
  },
  async set(key, value) {
    localStorage.setItem(key, value)
    return { key, value }
  },
  async delete(key) {
    localStorage.removeItem(key)
    return { key, deleted: true }
  },
}

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = storage
}

export default storage
