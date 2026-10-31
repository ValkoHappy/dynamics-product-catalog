import type { ListParams } from '../../entities/product/types'

export const SORT_OPTIONS = [
  { value: 'title', label: 'По названию' },
  { value: 'price', label: 'По цене' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'discountPercentage', label: 'По скидке' },
] as const
export type SearchMode = 'debounce' | 'characters'

export interface CatalogFilters {
  q: string
  category: string
  sortBy: NonNullable<ListParams['sortBy']>
  order: NonNullable<ListParams['order']>
  modifiedAfter: string
  modifiedBefore: string
  searchMode: SearchMode
}

export function readSortField(value: string | null): CatalogFilters['sortBy'] {
  return SORT_OPTIONS.find((option) => option.value === value)?.value ?? 'title'
}

export function readSortOrder(value: string | null): CatalogFilters['order'] {
  return value === 'desc' ? 'desc' : 'asc'
}

export function readSearchMode(value: string | null): SearchMode {
  return value === 'characters' ? 'characters' : 'debounce'
}

export function normalizeDate(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : ''
}

export function readCatalogFilters(params: URLSearchParams): CatalogFilters {
  const category = params.get('category') ?? ''

  return {
    q: (params.get('q') ?? '').trim(),
    category: /^[a-z0-9-]+$/.test(category) ? category : '',
    sortBy: readSortField(params.get('sortBy')),
    order: readSortOrder(params.get('order')),
    modifiedAfter: normalizeDate(params.get('modifiedAfter')),
    modifiedBefore: normalizeDate(params.get('modifiedBefore')),
    searchMode: readSearchMode(params.get('searchMode')),
  }
}

export function updateCatalogParams(
  previous: URLSearchParams,
  patch: Partial<CatalogFilters>,
): URLSearchParams {
  const next = new URLSearchParams(previous)
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value)
    else next.delete(key)
  }
  if (Object.keys(patch).some((key) => key !== 'searchMode')) next.delete('page')
  return next
}

export function hasInvalidDateRange(filters: CatalogFilters): boolean {
  return Boolean(
    filters.modifiedAfter &&
    filters.modifiedBefore &&
    filters.modifiedAfter > filters.modifiedBefore,
  )
}
