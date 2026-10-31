import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function RouteScrollReset() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useLayoutEffect(() => {
    if (pathname !== '/') window.scrollTo(0, 0)
    if (previousPath.current !== pathname) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
      previousPath.current = pathname
    }
  }, [pathname])

  return null
}
