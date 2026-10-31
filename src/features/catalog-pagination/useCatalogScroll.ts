import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { readCatalogFilters } from '../catalog-filters/model'
import { getCatalogFilterKey } from '../catalog-filters/catalogQueryArgs'

const STORAGE_PREFIX = 'catalog-scroll:'

function readPosition(key: string): number {
  try {
    const value = Number(sessionStorage.getItem(key))
    return Number.isFinite(value) && value >= 0 ? value : 0
  } catch {
    return 0
  }
}

export function useCatalogScroll(ready: boolean) {
  const { search } = useLocation()
  const filterKey = getCatalogFilterKey(readCatalogFilters(new URLSearchParams(search)))
  const restored = useRef(false)
  const requestedPosition = useRef(0)
  const activeFilter = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (activeFilter.current === filterKey) return
    activeFilter.current = filterKey
    restored.current = false
    requestedPosition.current = readPosition(`${STORAGE_PREFIX}${search}`)
    window.scrollTo(0, 0)
  }, [filterKey, search])

  useEffect(() => {
    if (!ready || restored.current) return
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, requestedPosition.current)
      restored.current = true
    })
    return () => cancelAnimationFrame(frame)
  }, [ready, filterKey])

  useLayoutEffect(() => {
    const savePosition = () => {
      if (!restored.current) return
      try {
        sessionStorage.setItem(`${STORAGE_PREFIX}${search}`, String(window.scrollY))
      } catch {
        return
      }
    }
    window.addEventListener('scroll', savePosition, { passive: true })
    window.addEventListener('pagehide', savePosition)
    savePosition()
    return () => {
      savePosition()
      window.removeEventListener('scroll', savePosition)
      window.removeEventListener('pagehide', savePosition)
    }
  }, [search])
}
