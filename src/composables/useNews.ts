import { ref, reactive } from 'vue'

export interface Platform {
  platform: string
  label: string
  list: {
    platform: string
    label: string
  }[]
}

export interface NewsItem {
  id: string
  title: string
  url: string
}

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export function useNews() {
  const platforms = ref<Platform[]>([])
  const news = ref<NewsItem[]>([])
  const loading = reactive({
    platforms: false,
    news: false
  })
  const error = reactive({
    platforms: null as string | null,
    news: null as string | null
  })

  const fetchPlatforms = async () => {
    loading.platforms = true
    error.platforms = null
    
    try {
      const response = await fetch('http://localhost:10010/platforms')
      const result: ApiResponse<Platform[]> = await response.json()
      
      if (result.code === 200) {
        platforms.value = result.data
      } else {
        error.platforms = result.msg || '获取平台列表失败'
      }
    } catch (err) {
      error.platforms = '网络请求失败，请检查服务器是否启动'
      console.error('获取平台列表失败:', err)
    } finally {
      loading.platforms = false
    }
  }

  const fetchNews = async (platform: string) => {
    loading.news = true
    error.news = null
    
    try {
      const response = await fetch(`http://localhost:10010/news?platform=${platform}`)
      const result: ApiResponse<NewsItem[]> = await response.json()
      
      if (result.code === 200) {
        news.value = result.data
      } else {
        error.news = result.msg || '获取新闻失败'
      }
    } catch (err) {
      error.news = '网络请求失败，请检查服务器是否启动'
      console.error('获取新闻失败:', err)
    } finally {
      loading.news = false
    }
  }

  return {
    platforms,
    news,
    loading,
    error,
    fetchPlatforms,
    fetchNews
  }
} 