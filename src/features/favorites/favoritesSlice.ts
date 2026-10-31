import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface FavoritesState {
  ids: number[]
}

const initialState: FavoritesState = { ids: [] }

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite(state, { payload: id }: PayloadAction<number>) {
      if (Number.isSafeInteger(id) && id > 0 && !state.ids.includes(id)) {
        state.ids.push(id)
      }
    },
    removeFavorite(state, { payload: id }: PayloadAction<number>) {
      state.ids = state.ids.filter((productId) => productId !== id)
    },
  },
  selectors: {
    selectFavoriteIds: (state) => state.ids,
    selectFavoriteCount: (state) => state.ids.length,
    selectIsFavorite: (state, id: number) => state.ids.includes(id),
  },
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions
export const { selectFavoriteIds, selectFavoriteCount, selectIsFavorite } = favoritesSlice.selectors
export const favoritesReducer = favoritesSlice.reducer
