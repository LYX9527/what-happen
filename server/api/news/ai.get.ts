export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:10010'
  
  const query = getQuery(event)
  const category = query.category as string

  if (!category) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少 category 参数',
    })
  }

  try {
    const response = await $fetch(`${baseURL}/news/ai?category=${encodeURIComponent(category)}`, {
      timeout: 15000, // AI总结可能需要更长时间
    })
    return response
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取AI总结失败',
    })
  }
})

