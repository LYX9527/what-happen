/**
 * 缓存管理工具
 */

interface CacheItem<T> {
  data: T
  timestamp: number
}

const cacheStore = new Map<string, CacheItem<any>>()

/**
 * 获取缓存数据
 * @param key 缓存键
 * @param ttl 缓存时间（毫秒）默认2分钟
 */
export const getCache = <T>(key: string, ttl: number = 120000): T | null => {
  const item = cacheStore.get(key)
  if (!item) return null

  const now = Date.now()
  if (now - item.timestamp > ttl) {
    cacheStore.delete(key)
    return null
  }

  return item.data
}

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 缓存数据
 */
export const setCache = <T>(key: string, data: T): void => {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * 清除缓存
 * @param key 缓存键，不传则清除所有缓存
 */
export const clearCache = (key?: string): void => {
  if (key) {
    cacheStore.delete(key)
  } else {
    cacheStore.clear()
  }
}

