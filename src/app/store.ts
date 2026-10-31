import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { productsApi } from '../entities/product/api'
import { favoritesReducer } from '../features/favorites/favoritesSlice'
import { loadFavoriteIds, persistFavorites } from '../features/favorites/favoritesStorage'

export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
    favorites: favoritesReducer,
  },
  preloadedState: { favorites: { ids: loadFavoriteIds() } },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware),
})
setupListeners(store.dispatch)
persistFavorites(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
