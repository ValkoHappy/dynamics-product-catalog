import { useEffect, useRef } from 'react'

export function useIntersectionLoad(enabled: boolean, onLoad: () => void) {
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!enabled || !target || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect()
          onLoad()
        }
      },
      { rootMargin: '0px 0px 240px 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [enabled, onLoad])

  return targetRef
}
