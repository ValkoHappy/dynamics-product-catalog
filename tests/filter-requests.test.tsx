import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { productsApi } from '../src/entities/product/api'
import { readCatalogFilters } from '../src/features/catalog-filters/model'
import { useCatalogPages } from '../src/features/catalog-pagination/useCatalogPages'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  sessionStorage.clear()
})

test('rapid date edits request only the final range', async () => {
  const requests: Request[] = []
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init)
      requests.push(request.clone())
      return Response.json({
        products: [{ id: 1, title: 'Product' }],
        total: 1,
        skip: 0,
        limit: 24,
      })
    },
  )
  const store = configureStore({
    reducer: { [productsApi.reducerPath]: productsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
  })
  const initialFilters = readCatalogFilters(new URLSearchParams())
  const { result, rerender, unmount } = renderHook(({ filters }) => useCatalogPages(filters), {
    initialProps: { filters: initialFilters },
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    ),
  })
  try {
    await waitFor(() => expect(result.current.hasData).toBe(true))
    expect(requests).toHaveLength(1)
    rerender({ filters: { ...initialFilters, modifiedAfter: '2026-01-01' } })
    rerender({
      filters: { ...initialFilters, modifiedAfter: '2026-01-01', modifiedBefore: '2026-06-01' },
    })
    expect(requests).toHaveLength(1)
    expect(result.current.products).toEqual([])
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.hasData).toBe(true))
    expect(requests).toHaveLength(2)
    const finalUrl = new URL(requests[1]!.url)
    expect(finalUrl.searchParams.get('modifiedAfter')).toBe('2026-01-01')
    expect(finalUrl.searchParams.get('modifiedBefore')).toBe('2026-06-01')
  } finally {
    unmount()
    store.dispatch(productsApi.util.resetApiState())
  }
})

test('select changes start immediately and cached filters keep their data', async () => {
  const requests: Request[] = []
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init)
    requests.push(request.clone())
    return Response.json({ products: [{ id: 1, title: 'Product' }], total: 1, skip: 0, limit: 24 })
  })
  const store = configureStore({
    reducer: { [productsApi.reducerPath]: productsApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
  })
  const filters = readCatalogFilters(new URLSearchParams())
  const { result, rerender, unmount } = renderHook(({ filters }) => useCatalogPages(filters), {
    initialProps: { filters },
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    ),
  })
  try {
    await waitFor(() => expect(result.current.hasData).toBe(true))
    rerender({ filters: { ...filters, category: 'beauty', sortBy: 'price' } })
    const pending = store.getState()[productsApi.reducerPath].queries
    expect(Object.values(pending).some((query) => query?.status === 'pending')).toBe(true)
    await waitFor(() => expect(result.current.hasData).toBe(true))
    expect(requests).toHaveLength(2)
    expect(new URL(requests[1]!.url).pathname).toBe('/products/category/beauty')
    expect(new URL(requests[1]!.url).searchParams.get('sortBy')).toBe('price')
    rerender({ filters })
    expect(result.current.hasData).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(requests).toHaveLength(2)
  } finally {
    unmount()
    store.dispatch(productsApi.util.resetApiState())
  }
})
