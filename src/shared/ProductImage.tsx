import { useState } from 'react'

interface ProductImageProps {
  src: string | undefined
  alt: string
  loading?: 'lazy' | 'eager'
}

export function ProductImage({ src, alt, loading = 'lazy' }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return <span>Нет изображения</span>
  }

  return <img src={src} alt={alt} loading={loading} onError={() => setFailedSrc(src)} />
}
