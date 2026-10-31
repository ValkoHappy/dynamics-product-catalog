import { useEffect, useState } from 'react'
import type { CatalogFilters } from './model'
import { getCatalogDateKey } from './catalogQueryArgs'

const DATE_SETTLE_MS = 150

export function useDateSettling(filters: CatalogFilters) {
  const key = getCatalogDateKey(filters)
  const [settledKey, setSettledKey] = useState(key)

  useEffect(() => {
    if (key === settledKey) return
    const timer = window.setTimeout(() => setSettledKey(key), DATE_SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [key, settledKey])

  return key !== settledKey
}
