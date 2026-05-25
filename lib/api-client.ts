import { storage } from './utils'
import type { User } from '@/models'

// Use relative URL in browser to avoid CORS/port issues, absolute in SSR
const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
interface ApiResponse<T> {
  success?: boolean
  data?: T
  message?: string
  error?: string
  token?: string
  user?: User
  blog?: T
  blogs?: T[]
  id?: string
  comments?: unknown[]
  comment?: unknown
  isBookmarked?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return storage.get('token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Auth methods
  async signup(name: string, email: string, password: string) {
    const response = await this.post('/auth/signup', { name, email, password })
    return response
  }

  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password })
    if (response.token) {
      storage.set('token', response.token)
      storage.set('user', response.user)
    }
    return response
  }

  logout() {
    storage.remove('token')
    storage.remove('user')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getUser(): User | null {
    return storage.get('user') as User | null
  }

  // Blog methods
  async getBlogs(search?: string, category?: string, mine?: boolean, all?: boolean) {
    let endpoint = '/blogs'
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (category && category !== 'all') params.append('category', category)
    if (mine) params.append('mine', 'true')
    if (all) params.append('all', 'true')
    if (params.toString()) endpoint += `?${params.toString()}`
    return this.get(endpoint)
  }

  async getBlog(id: string) {
    return this.get(`/blogs/${id}`)
  }

  async createBlog(blog: Record<string, unknown>) {
    return this.post('/blogs', blog)
  }

  async updateBlog(id: string, blog: Record<string, unknown>) {
    return this.put(`/blogs/${id}`, blog)
  }

  async deleteBlog(id: string) {
    return this.delete(`/blogs/${id}`)
  }

  // Comment methods
  async getComments(blogId: string) {
    return this.get(`/blogs/${blogId}/comments`)
  }

  async addComment(blogId: string, content: string, guestName?: string) {
    return this.post(`/blogs/${blogId}/comments`, { content, guestName })
  }

  // Reaction methods
  async reactToBlog(blogId: string, type: 'likes' | 'loves' | 'claps' | 'fires') {
    return this.post(`/blogs/${blogId}/react`, { type })
  }

  // Bookmark methods
  async getBookmarkStatus(blogId: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    return this.get(`/blogs/${blogId}/bookmark`)
  }

  async toggleBookmark(
    blogId: string,
    isCurrentlyBookmarked: boolean
  ): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    if (isCurrentlyBookmarked) {
      return this.delete(`/blogs/${blogId}/bookmark`)
    } else {
      return this.post(`/blogs/${blogId}/bookmark`, {})
    }
  }

  async getBookmarkedBlogs() {
    return this.get('/bookmarks')
  }
}

export const apiClient = new ApiClient()
