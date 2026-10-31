import { skipToken } from '@reduxjs/toolkit/query'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useGetProductQuery } from '../entities/product/api'
import { parseProductId } from '../entities/product/parseProductId'
import { RequestState } from '../shared/RequestState'
import { ProductDetails } from './ProductDetails'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { isNotFoundError } from '../shared/isNotFoundError'

function getReturnTo(value: unknown): string {
  if (typeof value !== 'string') return '/'
  if (value === '/favorites' || value === '/' || value.startsWith('/?')) return value
  return '/'
}

function ProductContent({ productId }: { productId: number | null }) {
  const { data, isLoading, isError, error, refetch } = useGetProductQuery(productId ?? skipToken)
  const isNotFound = productId === null || isNotFoundError(error)

  if (isNotFound) {
    return <h1>Товар не найден</h1>
  }

  if (isLoading) {
    return <RequestState message="Загружаем товар…" />
  }

  if (isError) {
    return <RequestState error message="Не удалось загрузить товар." onRetry={refetch} />
  }

  if (!data) {
    return <RequestState message="Нет данных о товаре." />
  }

  return (
    <ProductDetails
      product={data}
      action={<FavoriteButton productId={data.id} title={data.title} />}
    />
  )
}

export function ProductPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const returnTo = getReturnTo(state?.returnTo)

  return (
    <section>
      <Link to={returnTo}>{returnTo === '/favorites' ? '← В избранное' : '← В каталог'}</Link>
      <ProductContent productId={parseProductId(id)} />
    </section>
  )
}
