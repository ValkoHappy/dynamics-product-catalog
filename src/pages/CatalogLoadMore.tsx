import { useIntersectionLoad } from '../shared/useIntersectionLoad'
import styles from './CatalogPage.module.scss'

interface CatalogLoadMoreProps {
  loading: boolean
  error: boolean
  hasMore: boolean
  restoring: boolean
  onLoad: () => void
  onRetry: () => void
}

export function CatalogLoadMore({
  loading,
  error,
  hasMore,
  restoring,
  onLoad,
  onRetry,
}: CatalogLoadMoreProps) {
  const sentinelRef = useIntersectionLoad(hasMore && !loading && !error && !restoring, onLoad)

  return (
    <div className={styles.pagination}>
      {loading && !restoring && <p role="status">Загружаем товары…</p>}
      {restoring && !error && <p role="status">Восстанавливаем загруженные товары…</p>}
      {error && (
        <p role="alert">
          Не удалось догрузить товары.{' '}
          <button type="button" onClick={onRetry}>
            Повторить
          </button>
        </p>
      )}
      {hasMore && !error && (
        <button type="button" disabled={loading || restoring} onClick={onLoad}>
          Показать ещё
        </button>
      )}
      {!hasMore && !loading && <p>Все товары загружены</p>}
      <div ref={sentinelRef} aria-hidden="true" />
    </div>
  )
}
