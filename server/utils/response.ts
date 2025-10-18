/**
 * 标准 API 响应格式
 */
export class ApiResponse<T = any> {
  code: number
  msg: string
  data: T

  constructor(code: number, msg: string, data: T) {
    this.code = code
    this.msg = msg
    this.data = data
  }

  static success<T>(data: T, msg: string = 'success'): ApiResponse<T> {
    return new ApiResponse(200, msg, data)
  }

  static error(msg: string = 'error', code: number = 500): ApiResponse<null> {
    return new ApiResponse(code, msg, null)
  }
}

