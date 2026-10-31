import { afterEach, expect, test, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import {
  addFavorite,
  removeFavorite,
  favoritesReducer,
} from '../src/features/favorites/favoritesSlice'
import {
  FAVORITES_STORAGE_KEY,
  loadFavoriteIds,
  persistFavorites,
} from '../src/features/favorites/favoritesStorage'

afterEach(() => localStorage.clear())

function createFavoritesStore() {
  return configureStore({
    reducer: { favorites: favoritesReducer },
    preloadedState: { favorites: { ids: loadFavoriteIds() } },
  })
}

test('favorites survive a new store and unrelated actions do not write to storage', () => {
  const store = createFavoritesStore()
  const stop = persistFavorites(store)
  const write = vi.spyOn(Storage.prototype, 'setItem')
  store.dispatch(addFavorite(7))
  store.dispatch(addFavorite(9))
  store.dispatch(removeFavorite(7))
  expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([9])
  expect(createFavoritesStore().getState().favorites.ids).toEqual([9])
  write.mockClear()
  store.dispatch({ type: 'products/requestFinished' })
  store.dispatch(addFavorite(9))
  expect(write).not.toHaveBeenCalled()
  stop()
})

test('stored IDs are validated and duplicates removed', () => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, '[3,3,0,-1,1.5,"7",null,{},9]')
  expect(loadFavoriteIds()).toEqual([3, 9])
  for (const raw of ['broken json', '{}', 'null', '"text"']) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, raw)
    expect(loadFavoriteIds()).toEqual([])
  }
})

test('blocked or full storage does not break reading or updating favorites', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota exceeded')
  })
  expect(loadFavoriteIds()).toEqual([])
  const store = createFavoritesStore()
  const stop = persistFavorites(store)
  expect(() => store.dispatch(addFavorite(3))).not.toThrow()
  expect(store.getState().favorites.ids).toEqual([3])
  stop()
})
