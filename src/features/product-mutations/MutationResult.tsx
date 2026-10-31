import type { Product } from '../../entities/product/types'
import { formatPrice } from '../../shared/formatPrice'

interface MutationResultProps {
  data?: Product
  loading: boolean
  error: boolean
}

export function MutationResult({ data, loading, error }: MutationResultProps) {
  if (loading) return <p role="status">Отправляем запрос…</p>
  if (error) return <p role="alert">Запрос не выполнен. Проверьте ID и попробуйте ещё раз.</p>
  if (!data) return null

  return (
    <div role="status">
      <p>Сервер подтвердил операцию. ID товара {data.id}.</p>
      {data.title && <p>{data.title}</p>}
      {typeof data.price === 'number' && <p>{formatPrice(data.price)}</p>}
    </div>
  )
}
