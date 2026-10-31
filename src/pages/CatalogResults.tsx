import type { CatalogFilters } from '../features/catalog-filters/model'
import { useLocation } from 'react-router-dom'
import { useCatalogPages } from '../features/catalog-pagination/useCatalogPages'
import { ProductCard } from '../entities/product/ProductCard'
import { ProductGrid } from '../entities/product/ProductGrid'
import { RequestState } from '../shared/RequestState'
import { CatalogLoadMore } from './CatalogLoadMore'
import { FavoriteButton } from '../features/favorites/FavoriteButton'
import styles from './CatalogPage.module.scss'

export function CatalogResults({ filters }: { filters: CatalogFilters }) {
  const catalog = useCatalogPages(filters)
  const { search } = useLocation()

  if (catalog.invalidRange) {
    return <RequestState error message="Дата начала должна быть не позже даты окончания." />
  }

  if (catalog.loading && !catalog.hasData) {
    return <RequestState message="Загружаем товары…" />
  }

  if (catalog.initialError) {
    return (
      <RequestState error message="Не удалось загрузить товары." onRetry={catalog.retryInitial} />
    )
  }

  if (!catalog.products.length) {
    return <RequestState message="Товары не найдены." />
  }

  return (
    <>
      <p className={styles.count}>
        Показано {catalog.products.length} из {catalog.total}
      </p>
      <ProductGrid>
        {catalog.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            returnTo={`/${search}`}
            action={<FavoriteButton productId={product.id} title={product.title} />}
          />
        ))}
      </ProductGrid>
      <CatalogLoadMore
        loading={catalog.loading}
        error={catalog.nextPageError}
        hasMore={catalog.hasMore}
        restoring={catalog.restoring}
        onLoad={catalog.loadMore}
        onRetry={catalog.retryNextPage}
      />
    </>
  )
}
