import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import mangaReducer, { MangaState } from './mangaSlice';

// Transform to only persist pagination-related state, not the manga arrays
const mangaTransform = createTransform<MangaState, Partial<MangaState>>(
  // Transform state on its way to being serialized and persisted
  (inboundState) => ({
    currentPage: inboundState.currentPage,
    limit: inboundState.limit,
    offset: inboundState.offset,
  }),
  // Transform state being rehydrated
  (outboundState) => ({
    popular: [],
    trending: [],
    topRated: [],
    newReleases: [],
    total: 0,
    loading: false,
    error: null,
    ...outboundState,
  } as MangaState),
  { whitelist: ['manga'] }
);

const persistConfig = {
  key: 'mangaverse',
  storage,
  whitelist: ['manga'],
  transforms: [mangaTransform],
};

const rootReducer = combineReducers({
  manga: mangaReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
