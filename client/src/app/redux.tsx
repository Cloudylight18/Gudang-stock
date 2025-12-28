"use client"; // Wajib karena menggunakan useRef, useEffect, dan Provider

import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";
import globalReducer from "@/state";
import { api } from "@/state/api";
import { setupListeners } from "@reduxjs/toolkit/query";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/* --- REDUX PERSISTENCE (Mencegah error SSR di Next.js) --- */
// Fungsi ini memastikan bahwa jika kita berada di sisi server, storage tidak akan mencoba mengakses 'window'
const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global"], // Hanya simpan state 'global' (seperti dark mode/sidebar) di localStorage
};

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* --- REDUX STORE CONFIGURATION --- */
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Abaikan aksi internal redux-persist agar tidak muncul error serializable di konsol
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware),
  });
};

/* --- REDUX TYPES & HOOKS --- */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Hook kustom agar TypeScript mengenali tipe data global state Anda
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* --- PROVIDER COMPONENT --- */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gunakan useRef untuk memastikan store dan persistor hanya dibuat satu kali
  const storeRef = useRef<AppStore>();
  const persistorRef = useRef<any>();

  if (!storeRef.current) {
    // Membuat store
    storeRef.current = makeStore();
    // Mengaktifkan listeners untuk RTK Query (seperti refetchOnFocus)
    setupListeners(storeRef.current.dispatch);
    // Membuat persistor untuk mengelola penyimpanan lokal
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      {/* PersistGate menunda render UI sampai state yang tersimpan di localStorage berhasil dimuat kembali */}
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>