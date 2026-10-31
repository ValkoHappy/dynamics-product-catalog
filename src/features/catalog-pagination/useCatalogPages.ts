import { useCallback, useEffect, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { useGetCatalogPagesInfiniteQuery } from '../../entities/product/api'
import { collectProducts, nextPageOffset } from '../../entities/product/pagination'
import type { CatalogFilters } from '../catalog-filters/model'
import { hasInvalidDateRange } from '../catalog-filters/model'
import { useDateSettling } from '../catalog-filters/useDateSettling'
import { getCatalogFilterKey, getCatalogQueryArgs } from '../catalog-filters/catalogQueryArgs'
import { usePageCount } from './usePageCount'
import { useCatalogScroll } from './useCatalogScroll'

export function useCatalogPages(filters: CatalogFilters) {
  const { pageCount, setPageCount } = usePageCount()
  const [loadRequest, setLoadRequest] = useState<{ filterKey: string; page: number } | null>(null)
  const invalidRange = hasInvalidDateRange(filters)
  const settling = useDateSettling(filters)
  const filterKey = getCatalogFilterKey(filters)
  const query = useGetCatalogPagesInfiniteQuery(
    invalidRange || settling ? skipToken : getCatalogQueryArgs(filters),
  )
  const { hasNextPage, isFetching, isFetchNextPageError, fetchNextPage } = query
  const data = settling ? undefined : query.currentData
  const loadedCount = data?.pages.length ?? 0
  const catchingUp = loadedCount > 0 && loadedCount < pageCount && Boolean(hasNextPage)
  const loadingRequestedPage =
    loadRequest?.filterKey === filterKey && loadRequest.page === pageCount
  const restoring = catchingUp && !loadingRequestedPage

  useEffect(() => {
    if (catchingUp && !isFetching && !isFetchNextPageError) {
      void fetchNextPage()
    }
  }, [catchingUp, isFetching, isFetchNextPageError, fetchNextPage, loadedCount])

  useEffect(() => {
    if (data && !hasNextPage && !isFetching && pageCount > loadedCount) {
      setPageCount(Math.max(1, loadedCount))
    }
  }, [data, hasNextPage, isFetching, pageCount, loadedCount, setPageCount])

  useCatalogScroll(Boolean(data) && !catchingUp && !isFetching)

  const loadMore = useCallback(() => {
    setLoadRequest({ filterKey, page: pageCount + 1 })
    setPageCount(pageCount + 1)
  }, [filterKey, pageCount, setPageCount])
  const lastVisiblePage = data?.pages[Math.min(pageCount, loadedCount) - 1]

  return {
    products: collectProducts(data?.pages ?? [], pageCount),
    total: data?.pages[0]?.total ?? 0,
    invalidRange,
    hasData: Boolean(data),
    loading: settling || isFetching || (catchingUp && !isFetchNextPageError),
    initialError: !settling && query.isError && !data,
    nextPageError: !settling && isFetchNextPageError,
    hasMore: Boolean(lastVisiblePage && nextPageOffset(lastVisiblePage) !== undefined),
    restoring,
    loadMore,
    retryInitial: () => void query.refetch(),
    retryNextPage: () => void fetchNextPage(),
  }
}
