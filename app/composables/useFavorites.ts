import { ref, computed, onMounted } from 'vue'
import type { NewsItem } from '@/api'

// 收藏项类型，包含额外的元数据
export interface FavoriteItem extends NewsItem {
  platform: string
  platformTitle: string
  addedAt: number
  type: 'single' // 单条新闻
}

// 平台收藏类型
export interface FavoritePlatform {
  platform: string
  platformTitle: string
  addedAt: number
  type: 'platform' // 整个平台
}

// 收藏条目联合类型
export type FavoriteEntry = FavoriteItem | FavoritePlatform

// 本地存储的键名
const FAVORITES_STORAGE_KEY = 'news-favorites'

// 收藏列表
const favorites = ref<FavoriteEntry[]>([])

// 从本地存储加载收藏 - SSR兼容版本
const loadFavorites = () => {
  // 只在客户端执行
  if (process.client) {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
      favorites.value = []
    }
  }
}

// 保存收藏到本地存储 - SSR兼容版本
const saveFavorites = () => {
  // 只在客户端执行
  if (process.client) {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  }
}

export function useFavorites() {
  // 在客户端初始化时加载收藏数据
  onMounted(() => {
    loadFavorites()
  })

  // 收藏数量
  const favoritesCount = computed(() => favorites.value.length)

  // 检查单条新闻是否已收藏
  const isFavorited = (item: NewsItem) => {
    return favorites.value.some(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === item.id && 
      (fav as FavoriteItem).url === item.url
    )
  }

  // 检查平台是否已收藏
  const isPlatformFavorited = (platform: string) => {
    return favorites.value.some(fav => 
      fav.type === 'platform' && fav.platform === platform
    )
  }

  // 添加到收藏
  const addToFavorites = (item: NewsItem, platform: string, platformTitle: string) => {
    if (isFavorited(item)) {
      return false // 已经收藏过了
    }

    const favoriteItem: FavoriteItem = {
      ...item,
      platform,
      platformTitle,
      addedAt: Date.now(),
      type: 'single'
    }

    favorites.value.unshift(favoriteItem) // 添加到开头
    saveFavorites()
    return true
  }

  // 从收藏中移除单条新闻
  const removeFromFavorites = (item: NewsItem) => {
    const index = favorites.value.findIndex(fav => 
      fav.type === 'single' && 
      (fav as FavoriteItem).id === item.id && 
      (fav as FavoriteItem).url === item.url
    )
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
      return true
    }
    return false
  }

  // 添加平台到收藏
  const addPlatformToFavorites = (platform: string, platformTitle: string) => {
    if (isPlatformFavorited(platform)) {
      return false // 已经收藏过了
    }

    const favoritePlatform: FavoritePlatform = {
      platform,
      platformTitle,
      addedAt: Date.now(),
      type: 'platform'
    }

    favorites.value.unshift(favoritePlatform) // 添加到开头
    saveFavorites()
    return true
  }

  // 从收藏中移除平台
  const removePlatformFromFavorites = (platform: string) => {
    const index = favorites.value.findIndex(fav => 
      fav.type === 'platform' && fav.platform === platform
    )
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
      return true
    }
    return false
  }

  // 切换平台收藏状态
  const togglePlatformFavorite = (platform: string, platformTitle: string) => {
    if (isPlatformFavorited(platform)) {
      return removePlatformFromFavorites(platform)
    } else {
      return addPlatformToFavorites(platform, platformTitle)
    }
  }

  // 切换收藏状态
  const toggleFavorite = (item: NewsItem, platform: string, platformTitle: string) => {
    if (isFavorited(item)) {
      return removeFromFavorites(item)
    } else {
      return addToFavorites(item, platform, platformTitle)
    }
  }

  // 清空收藏
  const clearFavorites = () => {
    favorites.value = []
    saveFavorites()
  }

  // 获取收藏列表（按添加时间排序）
  const getFavorites = computed(() => {
    return [...favorites.value].sort((a, b) => b.addedAt - a.addedAt)
  })

  // 初始化加载
  if (favorites.value.length === 0) {
    loadFavorites()
  }

  // 获取单条新闻收藏
  const getNewsItems = computed(() => {
    return favorites.value.filter(fav => fav.type === 'single') as FavoriteItem[]
  })

  // 获取平台收藏
  const getPlatforms = computed(() => {
    return favorites.value.filter(fav => fav.type === 'platform') as FavoritePlatform[]
  })

  // 单条新闻收藏数量
  const newsItemsCount = computed(() => getNewsItems.value.length)

  // 平台收藏数量
  const platformsCount = computed(() => getPlatforms.value.length)

  return {
    // 全部收藏
    favorites: getFavorites,
    favoritesCount,
    
    // 单条新闻收藏
    newsItems: getNewsItems,
    newsItemsCount,
    isFavorited,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    
    // 平台收藏
    platforms: getPlatforms,
    platformsCount,
    isPlatformFavorited,
    togglePlatformFavorite,
    
    // 工具方法
    clearFavorites
  }
} 