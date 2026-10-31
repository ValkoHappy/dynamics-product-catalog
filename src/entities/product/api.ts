import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { buildCatalogRequest, selectCatalogResponse } from './catalogQuery'
import type { CatalogQuery } from './catalogQuery'
import { nextPageOffset, PAGE_SIZE } from './pagination'
import type {
  Category,
  CreateProductInput,
  DeletedProduct,
  ListParams,
  Product,
  ProductsResponse,
  UpdateProductInput,
} from './types'

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/products', timeout: 15000 }),
  endpoints: (builder) => ({
    getCatalogPages: builder.infiniteQuery<
      ProductsResponse,
      Omit<CatalogQuery, 'limit' | 'skip'>,
      number
    >({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage) => nextPageOffset(lastPage),
      },
      query: ({ queryArg, pageParam }) =>
        buildCatalogRequest({ ...queryArg, limit: PAGE_SIZE, skip: pageParam }),
      transformResponse: (response: ProductsResponse, _meta, { queryArg, pageParam }) =>
        selectCatalogResponse(response, { ...queryArg, limit: PAGE_SIZE, skip: pageParam }),
    }),
    getProducts: builder.query<ProductsResponse, ListParams>({
      query: (params) => ({ url: '', params }),
    }),
    getProduct: builder.query<Product, number>({ query: (id) => `/${id}` }),
    searchProducts: builder.query<ProductsResponse, ListParams & { q: string }>({
      query: (params) => ({ url: '/search', params }),
    }),
    getCategories: builder.query<Category[], void>({ query: () => '/categories' }),
    getCategoryList: builder.query<string[], void>({ query: () => '/category-list' }),
    getCategoryProducts: builder.query<ProductsResponse, ListParams & { category: string }>({
      query: ({ category, ...params }) => ({
        url: `/category/${encodeURIComponent(category)}`,
        params,
      }),
    }),
    addProduct: builder.mutation<Product, CreateProductInput>({
      query: (body) => ({ url: '/add', method: 'POST', body }),
    }),
    updateProduct: builder.mutation<Product, UpdateProductInput>({
      query: ({ id, changes, method = 'PATCH' }) => ({ url: `/${id}`, method, body: changes }),
    }),
    deleteProduct: builder.mutation<DeletedProduct, number>({
      query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
    }),
  }),
})
export const {
  useGetCatalogPagesInfiniteQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useSearchProductsQuery,
  useGetCategoriesQuery,
  useGetCategoryListQuery,
  useGetCategoryProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
