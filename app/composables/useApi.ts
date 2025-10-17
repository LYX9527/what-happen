import type { Platform, NewsItem, AISummaryData, ApiResponse } from '@/types/api'

/**
 * 获取平台列表
 */
export async function useFetchPlatforms() {
  return await $fetch<ApiResponse<Platform[]>>('/api/platforms')
}

/**
 * 获取指定平台的新闻数据
 */
export async function useFetchNews(
  platform: string,
  timestamp?: number,
  order?: 'asc' | 'desc'
) {
  const params: Record<string, string> = {
    platform,
  }
  
  if (order) {
    params.order = order
  }
  
  if (timestamp) {
    params._t = timestamp.toString()
  }

  return await $fetch<ApiResponse<NewsItem[]>>('/api/news', {
    params,
  })
}

/**
 * 获取AI总结内容
 */
export async function useFetchAISummary(category: string) {
  return await $fetch<ApiResponse<AISummaryData>>('/api/news/ai', {
    params: {
      category,
    },
  })
}

