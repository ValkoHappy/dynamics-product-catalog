import assert from 'node:assert/strict'
import { test } from 'vitest'
import {
  addFavorite,
  removeFavorite,
  favoritesReducer,
  selectFavoriteCount,
  selectIsFavorite,
} from '../src/features/favorites/favoritesSlice'

test('favorites contain only unique valid product IDs', () => {
  let state = favoritesReducer(undefined, addFavorite(3))
  state = favoritesReducer(state, addFavorite(3))
  state = favoritesReducer(state, addFavorite(7))
  for (const id of [0, -1, NaN, Infinity, 1.5]) {
    state = favoritesReducer(state, addFavorite(id))
  }
  assert.deepEqual(state, { ids: [3, 7] })
  assert.equal(selectFavoriteCount({ favorites: state }), 2)
  assert.equal(selectIsFavorite({ favorites: state }, 3), true)
})

test('removing a favorite updates all selectors without changing previous state', () => {
  const previous = favoritesReducer(undefined, addFavorite(3))
  const next = favoritesReducer(previous, removeFavorite(3))
  assert.deepEqual(previous.ids, [3])
  assert.equal(selectFavoriteCount({ favorites: next }), 0)
  assert.equal(selectIsFavorite({ favorites: next }, 3), false)
  assert.deepEqual(favoritesReducer(next, removeFavorite(99)), next)
})
