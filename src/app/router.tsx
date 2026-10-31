import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductPage } from '../pages/ProductPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { FavoritesPage } from '../pages/FavoritesPage'
import { ProductOperationsPage } from '../pages/ProductOperationsPage'

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <CatalogPage /> },
        { path: '/products/:id', element: <ProductPage /> },
        { path: '/favorites', element: <FavoritesPage /> },
        { path: '/api-demo', element: <ProductOperationsPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
