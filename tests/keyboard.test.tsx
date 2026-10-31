import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from '../src/app/Layout'
import { favoritesReducer, selectFavoriteCount } from '../src/features/favorites/favoritesSlice'
import { FavoriteButton } from '../src/features/favorites/FavoriteButton'
import { ProductCard } from '../src/entities/product/ProductCard'

afterEach(cleanup)

function CurrentRoute() {
  return <output aria-label="Текущий путь">{useLocation().pathname}</output>
}

test('Tab reaches the favorite button and Space/Enter toggle it without opening the product', async () => {
  const user = userEvent.setup()
  const store = configureStore({ reducer: { favorites: favoritesReducer } })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CurrentRoute />
        <ProductCard
          product={{ id: 7, title: 'Phone' }}
          action={<FavoriteButton productId={7} title="Phone" />}
        />
      </MemoryRouter>
    </Provider>,
  )
  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('link'))
  await user.tab()
  const button = screen.getByRole('button')
  expect(document.activeElement).toBe(button)
  await user.keyboard('[Space]')
  expect(button.getAttribute('aria-pressed')).toBe('true')
  expect(selectFavoriteCount(store.getState())).toBe(1)
  await user.keyboard('[Enter]')
  expect(button.getAttribute('aria-pressed')).toBe('false')
  expect(selectFavoriteCount(store.getState())).toBe(0)
  expect(screen.getByLabelText('Текущий путь').textContent).toBe('/')
})

test('keyboard navigation starts with the skip link and moves focus into a new page', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const store = configureStore({ reducer: { favorites: favoritesReducer } })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Link to="/products/1">Открыть товар</Link>} />
            <Route path="/products/1" element={<h1>Товар</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Перейти к содержимому' }))
  for (let index = 0; index < 4; index++) await user.tab()
  expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Открыть товар' }))
  await user.keyboard('[Enter]')
  expect(screen.getByRole('heading', { name: 'Товар' })).toBeDefined()
  expect(document.activeElement).toBe(screen.getByRole('main'))
})
