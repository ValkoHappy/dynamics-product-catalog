import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ProductCard } from '../src/entities/product/ProductCard'
import { ProductPage } from '../src/pages/ProductPage'

vi.mock('../src/entities/product/api', () => ({
  useGetProductQuery: () => ({ isLoading: true }),
}))

afterEach(cleanup)

function CurrentAddress() {
  const { pathname, search } = useLocation()
  return (
    <output aria-label="Адрес">
      {pathname}
      {search}
    </output>
  )
}

test.each([
  { returnTo: '/?q=phone&category=smartphones&page=2', label: '← В каталог' },
  { returnTo: '/favorites', label: '← В избранное' },
])('product returns to $returnTo supplied by its parent', async ({ returnTo, label }) => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[returnTo]}>
      <CurrentAddress />
      <Routes>
        <Route
          path="/"
          element={<ProductCard product={{ id: 7, title: 'Phone' }} returnTo={returnTo} />}
        />
        <Route
          path="/favorites"
          element={<ProductCard product={{ id: 7, title: 'Phone' }} returnTo={returnTo} />}
        />
        <Route path="/products/:id" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('link'))
  expect(screen.getByLabelText('Адрес').textContent).toBe('/products/7')
  await user.click(screen.getByRole('link', { name: label }))
  expect(screen.getByLabelText('Адрес').textContent).toBe(returnTo)
})
