import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

export class HttpService {
  private readonly axiosInstance: AxiosInstance
  private readonly retry: number = 2
  private static instance: HttpService

  constructor (baseURL: string, timeout: number = 10000) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout
    })
    this.axiosInstance.defaults.headers.common['User-Agent'] = 'lambda-files-handler v1.0.0'
    this.axiosInstance.defaults.headers.common['cache-control'] = 'no-cache'
    this.axiosInstance.defaults.headers.common['content-type'] = 'application/json'
    // this.axiosInstance.defaults.timeout = 1000 * 120;
    this.axiosInstance.interceptors.request.use((config: any) => {
      if (process.env.HTTP_LOGGER !== undefined && process.env.HTTP_LOGGER === '1') {
        console.log(JSON.stringify(config))
      }
      return config
    }, async (error: any) => {
      return await Promise.reject(error)
    })
    this.axiosInstance.interceptors.response.use(undefined, async (error) => {
      const { config, response: { status } } = error
      const originalRequest = config

      if (status >= 500 && status <= 599) {
        // You can check the number of retry attempts by checking "axios-retry-count" in the config
        const retryCount = originalRequest['axios-retry-count'] ?? 0

        if (retryCount < this.retry) {
          // Increasing retry count
          originalRequest['axios-retry-count'] = retryCount + 1

          // Create new promise to handle exponential backoff
          const backoff = new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve()
            }, 200) // Adjust the retry delay based on requirements
          })

          await backoff

          return await this.axiosInstance(originalRequest)
        }
      }

      return await Promise.reject(error)
    })
  }

  public static getInstance (baseURL: string = '', timeout: number = 10000): HttpService {
    if (HttpService.instance === undefined) {
      HttpService.instance = new HttpService(baseURL, timeout)
    }
    return HttpService.instance
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.get<T>(url, config)
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.post<T>(url, data, config)
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.put<T>(url, data, config)
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this.axiosInstance.delete<T>(url, config)
  }

  // More methods can be added as needed
}

export const getHttpServiceInstance = (baseURL: string, timeout: number = 10000): HttpService => {
  return HttpService.getInstance(baseURL, timeout)
}
