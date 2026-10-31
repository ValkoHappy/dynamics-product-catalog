import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addFavorite, removeFavorite, selectIsFavorite } from './favoritesSlice'
import styles from './FavoriteButton.module.scss'

interface FavoriteButtonProps {
  productId: number
  title?: string
}

export function FavoriteButton({ productId, title }: FavoriteButtonProps) {
  const dispatch = useAppDispatch()
  const selected = useAppSelector((state) => selectIsFavorite(state, productId))
  const label = selected ? 'Удалить из избранного' : 'Добавить в избранное'

  function toggleFavorite() {
    dispatch(selected ? removeFavorite(productId) : addFavorite(productId))
  }

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={selected}
      aria-label={`${label}: ${title || 'Товар'}`}
      onClick={toggleFavorite}
    >
      <span aria-hidden="true">{selected ? '♥' : '♡'}</span>
      {selected ? 'В избранном' : 'В избранное'}
    </button>
  )
}
