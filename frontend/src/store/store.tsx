import createWebStorage from "redux-persist/es/storage/createWebStorage"

import { combineReducers, configureStore } from "@reduxjs/toolkit"

import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist"

import { sessionReducer } from "./slices"

const createNoopStorage = () => {
  return {
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: string) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve(),
  }
}

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage()

const persistConfig = {
  key: "root",
  version: 1,
  blacklist: [],
  whitelist: ["session"],
  storage,
}

const rootReducer = combineReducers({ session: sessionReducer })

const persisted = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  devTools: false,
  reducer: persisted,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ["err"],
      },
    }),
})

const persistor = persistStore(store)

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

export { persistor, store }
export type { AppDispatch, RootState }
