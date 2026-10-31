import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readPageCount } from './model'

export function usePageCount() {
  const [params, setParams] = useSearchParams()
  const pageCount = readPageCount(params.get('page'))

  const setPageCount = useCallback(
    (count: number) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (count > 1) next.set('page', String(count))
          else next.delete('page')
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [setParams],
  )

  return { pageCount, setPageCount }
}
