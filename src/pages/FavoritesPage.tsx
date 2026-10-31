import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { selectFavoriteIds } from '../features/favorites/favoritesSlice'
import { RequestState } from '../shared/RequestState'
import { FavoriteProduct } from './FavoriteProduct'
import { ProductGrid } from '../entities/product/ProductGrid'

export function FavoritesPage() {
  const ids = useAppSelector(selectFavoriteIds)

  return (
    <section>
      <Link to="/">← В каталог</Link>
      <h1>Избранное</h1>
      {ids.length === 0 ? (
        <RequestState message="Пока здесь пусто. Добавляйте товары в избранное в каталоге." />
      ) : (
        <ProductGrid>
          {ids.map((id) => (
            <FavoriteProduct key={id} productId={id} />
          ))}
        </ProductGrid>
      )}
    </section>
  )
}
