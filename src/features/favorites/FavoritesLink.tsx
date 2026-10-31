import { Link } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectFavoriteCount } from './favoritesSlice'

export function FavoritesLink() {
  const count = useAppSelector(selectFavoriteCount)
  return (
    <Link to="/favorites">
      <span aria-live="polite" aria-atomic="true">
        Избранное ({count})
      </span>
    </Link>
  )
}
