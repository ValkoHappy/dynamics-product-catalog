import assert from 'node:assert/strict'
import { test, vi, onTestFinished } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { productsApi } from '../src/entities/product/api'

test('product endpoints send the required paths, parameters, methods and bodies through RTK Query', async () => {
  const requests: Request[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      requests.push(request.clone())
      const path = new URL(request.url).pathname
      if (path === '/products/999999') {
        return Response.json({ message: 'Product not found' }, { status: 404 })
      }
      if (path === '/products/categories') {
        return Response.json([
          {
            slug: 'smartphones',
            name: 'Smartphones',
            url: 'https://dummyjson.com/products/category/smartphones',
          },
        ])
      }
      if (path === '/products/category-list') return Response.json(['smartphones'])
      return Response.json({
        id: 7,
        title: 'Test product',
        products: [],
        total: 0,
        skip: 0,
        limit: 24,
      })
    },
  )
  const store = configureStore({
    reducer: { [productsApi.reducerPath]: productsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
  })
  onTestFinished(() => store.dispatch(productsApi.util.resetApiState()))
  const endpoints = productsApi.endpoints

  await store
    .dispatch(
      endpoints.getProducts.initiate({
        limit: 24,
        skip: 24,
        select: 'title,price',
        sortBy: 'price',
        order: 'desc',
        modifiedAfter: '2026-01-01',
        modifiedBefore: '2026-12-31',
      }),
    )
    .unwrap()
  const listUrl = new URL(requests[0]!.url)
  assert.equal(listUrl.origin, 'https://dummyjson.com')
  assert.equal(listUrl.pathname, '/products')
  assert.deepEqual(Object.fromEntries(listUrl.searchParams), {
    limit: '24',
    skip: '24',
    select: 'title,price',
    sortBy: 'price',
    order: 'desc',
    modifiedAfter: '2026-01-01',
    modifiedBefore: '2026-12-31',
  })

  await store.dispatch(endpoints.getProduct.initiate(7)).unwrap()
  await store.dispatch(endpoints.searchProducts.initiate({ q: 'phone', limit: 24 })).unwrap()
  await store.dispatch(endpoints.getCategories.initiate()).unwrap()
  await store.dispatch(endpoints.getCategoryList.initiate()).unwrap()
  await store
    .dispatch(
      endpoints.getCategoryProducts.initiate({
        category: 'smartphones',
        sortBy: 'rating',
        order: 'asc',
      }),
    )
    .unwrap()
  assert.deepEqual(
    requests.slice(1).map((request) => new URL(request.url).pathname),
    [
      '/products/7',
      '/products/search',
      '/products/categories',
      '/products/category-list',
      '/products/category/smartphones',
    ],
  )
  assert.equal(new URL(requests[2]!.url).searchParams.get('q'), 'phone')
  assert.equal(new URL(requests[5]!.url).searchParams.get('sortBy'), 'rating')
  assert.ok(requests.every((request) => request.method === 'GET'))

  await store.dispatch(endpoints.addProduct.initiate({ title: 'New product', price: 10 })).unwrap()
  await store.dispatch(endpoints.updateProduct.initiate({ id: 7, changes: { price: 20 } })).unwrap()
  await store
    .dispatch(
      endpoints.updateProduct.initiate({ id: 7, method: 'PUT', changes: { title: 'Updated' } }),
    )
    .unwrap()
  await store.dispatch(endpoints.deleteProduct.initiate(7)).unwrap()
  assert.deepEqual(
    requests.slice(6).map((request) => [request.method, new URL(request.url).pathname]),
    [
      ['POST', '/products/add'],
      ['PATCH', '/products/7'],
      ['PUT', '/products/7'],
      ['DELETE', '/products/7'],
    ],
  )
  assert.deepEqual(await requests[6]!.json(), { title: 'New product', price: 10 })
  assert.deepEqual(await requests[7]!.json(), { price: 20 })
  assert.deepEqual(await requests[8]!.json(), { title: 'Updated' })

  const countBeforeCachedRead = requests.length
  await store.dispatch(endpoints.getProduct.initiate(7)).unwrap()
  assert.equal(requests.length, countBeforeCachedRead)

  await assert.rejects(store.dispatch(endpoints.getProduct.initiate(999999)).unwrap(), {
    status: 404,
    data: { message: 'Product not found' },
  })
  assert.equal(endpoints.getProduct.select(999999)(store.getState()).isError, true)
})
