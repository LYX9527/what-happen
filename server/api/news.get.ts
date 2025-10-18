import { apiManager } from '../manager'
import { ApiResponse } from '../utils/response'
import { getCache, setCache } from '../utils/cache'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const platform = query.platform as string

  if (!platform) {
    return ApiResponse.error('缺少 platform 参数', 400)
  }

  try {
    // 检查缓存
    const cacheKey = `news:${platform}`
    const cached = getCache(cacheKey, 120000) // 2分钟缓存
    
    if (cached) {
      console.log(`从缓存返回 ${platform} 数据`)
      return ApiResponse.success(cached)
    }

    // 获取 API 函数
    const apiFunction = apiManager.getApi(platform)
    
    // 调用 API
    const data = await apiFunction({ ...query })
    
    // 设置缓存
    setCache(cacheKey, data)
    
    return ApiResponse.success(data)
  } catch (error: any) {
    console.error(`获取 ${platform} 数据失败:`, error)
    return ApiResponse.error(error.message || '获取数据失败', 500)
  }
})

