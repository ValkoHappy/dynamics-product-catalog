export interface Product {
  id: number
  title?: string
  description?: string
  price?: number
  category?: string
  rating?: number
  discountPercentage?: number
  brand?: string
  stock?: number
  availabilityStatus?: string
  thumbnail?: string
  images?: string[]
  meta?: { createdAt?: string; updatedAt?: string }
}
export interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}
export interface Category {
  slug: string
  name: string
  url: string
}
export interface ListParams {
  limit?: number
  skip?: number
  select?: string
  sortBy?: 'price' | 'title' | 'rating' | 'discountPercentage'
  order?: 'asc' | 'desc'
  modifiedAfter?: string
  modifiedBefore?: string
}
export type CreateProductInput = Partial<Omit<Product, 'id'>> & { title: string }
export type UpdateProductInput = {
  id: number
  changes: Partial<Omit<Product, 'id'>>
  method?: 'PUT' | 'PATCH'
}
export type DeletedProduct = Product & { isDeleted: boolean; deletedOn: string }
