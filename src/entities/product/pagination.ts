import type { Product, ProductsResponse } from './types'

export const PAGE_SIZE = 24

export function nextPageOffset(page: ProductsResponse): number | undefined {
  const next = page.skip + page.limit
  if (!page.products.length || page.limit <= 0 || next >= page.total) return undefined
  return next
}

export function collectProducts(pages: ProductsResponse[], count: number): Product[] {
  const products = new Map<number, Product>()
  for (const page of pages.slice(0, count)) {
    for (const product of page.products) products.set(product.id, product)
  }
  return [...products.values()]
}
