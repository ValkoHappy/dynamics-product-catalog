import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useCatalogPages } from '../src/features/catalog-pagination/useCatalogPages'
import { readCatalogFilters } from '../src/features/catalog-filters/model'

const apiMock = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../src/entities/product/api', () => ({
  useGetCatalogPagesInfiniteQuery: apiMock.query,
}))
vi.mock('../src/features/catalog-pagination/useCatalogScroll', () => ({
  useCatalogScroll: vi.fn(),
}))

const fetchNextPage = vi.fn()
const firstPage = { products: [{ id: 1 }], total: 72, limit: 24, skip: 0 }

beforeEach(() => {
  fetchNextPage.mockReset()
  apiMock.query.mockReturnValue({
    currentData: { pages: [firstPage], pageParams: [0] },
    hasNextPage: true,
    isFetching: false,
    isFetchNextPageError: false,
    isError: false,
    fetchNextPage,
    refetch: vi.fn(),
  })
})
afterEach(cleanup)

function catalog(entry = '/') {
  return renderHook(() => useCatalogPages(readCatalogFilters(new URLSearchParams())), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
    ),
  })
}

test('loading another page does not show the restoration state', () => {
  const { result } = catalog()
  act(() => result.current.loadMore())
  expect(result.current.loading).toBe(true)
  expect(result.current.restoring).toBe(false)
  expect(fetchNextPage).toHaveBeenCalledTimes(1)
})

test('a direct page link restores missing pages sequentially', () => {
  const { result } = catalog('/?page=3')
  expect(result.current.restoring).toBe(true)
  expect(fetchNextPage).toHaveBeenCalledTimes(1)
})

test('a failed next page keeps existing products and stops automatic retry', () => {
  apiMock.query.mockReturnValue({
    ...apiMock.query(),
    isFetchNextPageError: true,
    isError: true,
  })
  const { result } = catalog('/?page=2')
  expect(result.current.products).toEqual([{ id: 1 }])
  expect(result.current.nextPageError).toBe(true)
  expect(result.current.initialError).toBe(false)
  expect(result.current.loading).toBe(false)
  expect(fetchNextPage).not.toHaveBeenCalled()
  act(() => result.current.retryNextPage())
  expect(fetchNextPage).toHaveBeenCalledTimes(1)
})
