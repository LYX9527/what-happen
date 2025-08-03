import {API_CONFIG, API_ENDPOINTS, type ApiResponse} from './config'

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
    extra?: {
        info?: string
        hover?: string
        time?: string
        rank?: number
        icon?: {
            url: string
            scale: number
            info: string
        }
        num: number
        view?: number
        like?: number
        comment?: number | {
            content: string
            avatar: string
        }
        collect?: number
        thumbnail?: {
            url: string
            hover?: string
        }
        video?: {
            info: string
            duration: string
        }
        score?: number
        desc?: string
        rating?: {
            count: number
            value: number
        }
        comments: {
            content: string
            avatar: string
        }
    }
}

export interface MatchItem {
    matchName: string
    matchStatus: string
    matchStartTimeStamp: number
    memberInfos: {
        memberName: string
        memberId: string
        memberBaseScore: string
        memberLogo: string
    }[]
}

/**
 * 基础请求函数
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_CONFIG.baseURL}${endpoint}`

    // 创建AbortController来实现超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            ...options,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: ApiResponse<T> = await response.json()

        if (result.code === 200) {
            return result.data
        } else {
            throw new Error(result.msg || '请求失败')
        }
    } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('请求超时')
        }
        throw error
    }
}

/**
 * 获取平台列表
 */
export async function fetchPlatforms(): Promise<Platform[]> {
    return request<Platform[]>(API_ENDPOINTS.platforms)
}

/**
 * 获取指定平台的新闻数据
 */
export async function fetchNews(platform: string): Promise<NewsItem[]> {
    return request<NewsItem[]>(`${API_ENDPOINTS.news}?platform=${platform}`)
}
