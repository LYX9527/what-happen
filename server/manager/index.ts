import type { ApiFunction } from '../types'

/**
 * API 管理器
 * 负责注册和管理所有平台的 API 函数
 */
export class ApiManager {
  private readonly apiMap: Record<string, ApiFunction>

  constructor() {
    this.apiMap = {}
  }

  /**
   * 获取 API 函数
   */
  getApi(apiName: string): ApiFunction {
    if (this.apiMap[apiName]) {
      return this.apiMap[apiName]
    } else {
      throw new Error(`API ${apiName} not found`)
    }
  }

  /**
   * 注册 API 函数
   */
  registerApi(apiName: string, apiFunction: ApiFunction): void {
    this.apiMap[apiName] = apiFunction
  }

  /**
   * 获取所有已注册的 API 名称
   */
  getRegisteredApis(): string[] {
    return Object.keys(this.apiMap)
  }

  /**
   * 检查 API 是否已注册
   */
  hasApi(apiName: string): boolean {
    return apiName in this.apiMap
  }
}

// 导出单例
export const apiManager = new ApiManager()

