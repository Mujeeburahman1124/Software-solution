// Database Models and Schemas

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Blog {
  id: string
  title: string
  content: string
  coverImage: string
  category: string
  authorId: string
  author?: User
  views: number
  published: boolean
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  createdAt: Date
}
