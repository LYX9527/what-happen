export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl || 'http://localhost:10010'

  try {
    const response = await $fetch(`${baseURL}/platforms`, {
      timeout: 10000,
    })
    return response
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '获取平台列表失败',
    })
  }
})

