import { ApiResponse } from '../../utils/response'
import { getCache, setCache } from '../../utils/cache'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let category = query.category as string

  if (!category) {
    category = 'hot'
  }

  try {
    // 检查缓存 - AI 摘要缓存时间更长（1小时）
    const cacheKey = `ai:summary:${category}`
    const cached = getCache(cacheKey, 3600000) // 1小时缓存
    
    if (cached) {
      console.log(`从缓存返回 ${category} AI 摘要`)
      return ApiResponse.success(cached)
    }

    // AI 摘要功能暂时返回模拟数据
    const mockData = {
      category,
      generatedAt: new Date().toISOString(),
      summary: `${category} 分类的新闻摘要暂未生成`,
      hotTopics: [],
      trends: [],
      sections: [],
    }

    // 设置缓存
    setCache(cacheKey, mockData)

    return ApiResponse.success(mockData)
  } catch (error: any) {
    console.error(`获取 AI 摘要失败:`, error)
    return ApiResponse.error(error.message || '获取 AI 摘要失败', 500)
  }
})

