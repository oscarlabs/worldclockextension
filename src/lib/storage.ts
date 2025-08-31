/** Helpers around chrome.storage.sync with graceful fallback to localStorage for dev */
export async function getSync<T = any>(key: string): Promise<T | undefined> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      return new Promise(resolve => {
        chrome.storage.sync.get([key], (result) => resolve(result[key] as T))
      })
    }
  } catch {}
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) as T : undefined
}

export async function setSync(key: string, value: any): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      return new Promise(resolve => {
        chrome.storage.sync.set({ [key]: value }, () => resolve())
      })
    }
  } catch {}
  localStorage.setItem(key, JSON.stringify(value))
}
