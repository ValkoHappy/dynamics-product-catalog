import { useGetProductQuery } from '../entities/product/api'
import { ProductCard } from '../entities/product/ProductCard'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import { RequestState } from '../shared/RequestState'
import styles from './FavoriteProduct.module.scss'
import { isNotFoundError } from '../shared/isNotFoundError'

export function FavoriteProduct({ productId }: { productId: number }) {
  const { data, isLoading, isError, error, refetch } = useGetProductQuery(productId)
  const action = <FavoriteButton productId={productId} title={data?.title} />

  if (isLoading) {
    return <RequestState message="Загружаем товар…" />
  }

  if (isNotFoundError(error)) {
    return (
      <article className={styles.unavailable}>
        <RequestState message="Товар больше недоступен." />
        {action}
      </article>
    )
  }

  if (isError || !data) {
    return (
      <article className={styles.unavailable}>
        <RequestState error message="Не удалось загрузить товар." onRetry={refetch} />
        {action}
      </article>
    )
  }

  return <ProductCard product={data} action={action} returnTo="/favorites" />
}
