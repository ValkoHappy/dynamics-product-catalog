import type { CatalogQuery } from '../../entities/product/catalogQuery'
import type { CatalogFilters } from './model'

export function getCatalogQueryArgs(filters: CatalogFilters): Omit<CatalogQuery, 'limit' | 'skip'> {
  return {
    q: filters.q,
    category: filters.category,
    sortBy: filters.sortBy,
    order: filters.order,
    modifiedAfter: filters.modifiedAfter || undefined,
    modifiedBefore: filters.modifiedBefore || undefined,
  }
}

export function getCatalogFilterKey(filters: CatalogFilters): string {
  return JSON.stringify(getCatalogQueryArgs(filters))
}

export function getCatalogDateKey(filters: CatalogFilters): string {
  const { modifiedAfter, modifiedBefore } = getCatalogQueryArgs(filters)
  return JSON.stringify([modifiedAfter, modifiedBefore])
}
