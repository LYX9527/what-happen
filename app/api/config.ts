// API 配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10010',
  timeout: 10000,
}

// API 路径
export const API_ENDPOINTS = {
  platforms: '/platforms',
  news: '/news',
} as const

export type ApiResponse<T> = {
  code: number
  msg: string
  data: T
}
