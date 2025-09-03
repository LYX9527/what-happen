import {API_CONFIG, type ApiResponse} from './config'

export interface AISection {
    title: string
    content: string
    platforms?: string[]
}

export interface AISummaryData {
    category: string
    generatedAt: string
    summary: string
    hotTopics: Array<{
        topic: string
        description: string
        relatedPlatforms: string[]
    }>
    trends: Array<{
        title: string
        description: string
    }>
    sections?: AISection[]
}

/**
 * 获取AI总结内容
 */
export async function fetchAISummary(category: string): Promise<AISummaryData> {
    const url = `${API_CONFIG.baseURL}/news/ai?category=${encodeURIComponent(category)}`

    // 创建AbortController来实现超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // AI总结可能需要更长时间

    try {
        const response = await fetch(url, {
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: ApiResponse<AISummaryData> = await response.json()

        if (result.code === 200) {
            return result.data
        } else {
            throw new Error(result.msg || '获取AI总结失败')
        }
    } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('请求超时')
        }
        throw error
    }
}
