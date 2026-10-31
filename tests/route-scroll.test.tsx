import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { RouteScrollReset } from '../src/app/RouteScrollReset'

afterEach(cleanup)

test('product navigation resets scroll and leaves catalog restoration to its own hook', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  render(
    <MemoryRouter>
      <RouteScrollReset />
      <Link to="/products/1">Товар</Link>
      <Link to="/">Каталог</Link>
    </MemoryRouter>,
  )
  expect(scrollTo).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('link', { name: 'Товар' }))
  expect(scrollTo).toHaveBeenCalledExactlyOnceWith(0, 0)
  fireEvent.click(screen.getByRole('link', { name: 'Каталог' }))
  expect(scrollTo).toHaveBeenCalledTimes(1)
})
