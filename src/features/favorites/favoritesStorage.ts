import type { Store } from '@reduxjs/toolkit'
import { selectFavoriteIds, type FavoritesState } from './favoritesSlice'

export const FAVORITES_STORAGE_KEY = 'polka:favorites:v1'

export function loadFavoriteIds(): number[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value)) return []
    return [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))]
  } catch {
    return []
  }
}

function saveFavoriteIds(ids: number[]) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    return
  }
}

export function persistFavorites(
  store: Pick<Store<{ favorites: FavoritesState }>, 'getState' | 'subscribe'>,
) {
  let previousIds = selectFavoriteIds(store.getState())
  return store.subscribe(() => {
    const ids = selectFavoriteIds(store.getState())
    if (ids === previousIds) return
    previousIds = ids
    saveFavoriteIds(ids)
  })
}
