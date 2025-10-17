export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:10010'
  
  const query = getQuery(event)
  const platform = query.platform as string
  const order = query.order as string | undefined
  const timestamp = query._t as string | undefined

  if (!platform) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少 platform 参数',
    })
  }

  try {
    const params: string[] = [`platform=${encodeURIComponent(platform)}`]
    if (order) params.push(`order=${order}`)
    if (timestamp) params.push(`_t=${timestamp}`)
    
    const response = await $fetch(`${baseURL}/news?${params.join('&')}`, {
      timeout: 10000,
    })
    return response
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取新闻数据失败',
    })
  }
})

