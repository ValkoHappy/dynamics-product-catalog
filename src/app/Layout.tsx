import { Link, Outlet } from 'react-router-dom'
import styles from './Layout.module.scss'
import { FavoritesLink } from '../features/favorites/FavoritesLink'
import { RouteScrollReset } from './RouteScrollReset'

export function Layout() {
  return (
    <div className={styles.app}>
      <RouteScrollReset />
      <a className={styles.skipLink} href="#main-content">
        Перейти к содержимому
      </a>
      <header className={styles.header}>
        <Link className={styles.logo} to="/">
          Магазин
        </Link>
        <nav className={styles.navigation} aria-label="Основная навигация">
          <FavoritesLink />
          <Link to="/api-demo">Операции API</Link>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
