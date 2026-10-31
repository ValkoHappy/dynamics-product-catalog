import type { ListParams, ProductsResponse } from './types'

export interface CatalogQuery extends ListParams {
  q: string
  category: string
}

export function buildCatalogRequest({ q, category, ...params }: CatalogQuery) {
  if (category) {
    return {
      url: `/category/${encodeURIComponent(category)}`,
      params: {
        ...params,
        ...(q ? { limit: 0, skip: 0 } : {}),
      },
    }
  }
  if (q) {
    return {
      url: '/search',
      params: {
        ...params,
        q,
        limit: 0,
        skip: 0,
      },
    }
  }

  return { url: '', params }
}

export function selectCatalogResponse(
  response: ProductsResponse,
  args: CatalogQuery,
): ProductsResponse {
  if (!args.q) {
    return response
  }
  const search = args.q.toLocaleLowerCase()
  const products = response.products.filter((product) =>
    product.title?.toLocaleLowerCase().includes(search),
  )
  const skip = args.skip ?? 0
  const limit = args.limit ?? 24

  return {
    products: limit === 0 ? products.slice(skip) : products.slice(skip, skip + limit),
    total: products.length,
    skip,
    limit,
  }
}
