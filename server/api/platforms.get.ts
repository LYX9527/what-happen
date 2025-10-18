import { ApiResponse } from '../utils/response'
import platforms from '../config/platforms.json'

export default defineEventHandler(async () => {
  try {
    return ApiResponse.success(platforms)
  } catch (error) {
    console.error('获取平台列表失败:', error)
    return ApiResponse.error('获取平台列表失败', 500)
  }
})

