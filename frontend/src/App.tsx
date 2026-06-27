import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistGate } from "redux-persist/integration/react"

import { Provider } from "react-redux"
import { RouterProvider } from "react-router"

import { queryClient } from "@/api"
import { Provider as ProviderTheme } from "@/components/ui/provider"
import { router } from "@/router"

import { persistor, store } from "./store"

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ProviderTheme defaultTheme="system">
            <RouterProvider router={router} />
          </ProviderTheme>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export { App }
