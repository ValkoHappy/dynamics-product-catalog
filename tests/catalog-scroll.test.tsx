import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, renderHook } from '@testing-library/react'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useCatalogScroll } from '../src/features/catalog-pagination/useCatalogScroll'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  sessionStorage.clear()
})

test('leaving during next-page loading saves the position for the new URL before route scroll reset', () => {
  vi.useFakeTimers()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const { result, rerender, unmount } = renderHook(
    ({ ready }) => {
      const [, setParams] = useSearchParams()
      useCatalogScroll(ready)
      return () => setParams({ page: '2' })
    },
    {
      initialProps: { ready: true },
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={['/?page=1']}>{children}</MemoryRouter>
      ),
    },
  )
  act(() => vi.advanceTimersToNextFrame())
  Object.defineProperty(window, 'scrollY', { value: 900, configurable: true })
  fireEvent.scroll(window)
  act(() => {
    result.current()
    rerender({ ready: false })
  })
  expect(sessionStorage.getItem('catalog-scroll:?page=2')).toBe('900')
  Object.defineProperty(window, 'scrollY', { value: 950, configurable: true })
  unmount()
  expect(sessionStorage.getItem('catalog-scroll:?page=2')).toBe('950')
})
