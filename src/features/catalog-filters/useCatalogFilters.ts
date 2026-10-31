import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readCatalogFilters, updateCatalogParams } from './model'
import type { CatalogFilters } from './model'

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()
  const filters = readCatalogFilters(params)

  const updateFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      setParams((previous) => updateCatalogParams(previous, patch))
    },
    [setParams],
  )

  const resetFilters = () => {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      for (const key of Object.keys(filters)) next.delete(key)
      next.delete('page')
      return next
    })
  }

  return { filters, updateFilters, resetFilters }
}
