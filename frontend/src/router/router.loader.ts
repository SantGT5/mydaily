import { isAxiosError } from "axios"

import { redirect } from "react-router"

import { meQueryOptions, queryClient } from "@/api"
import { AccountRoutes } from "@/pages/account"
import { AuthRoutes } from "@/pages/auth"
import { store } from "@/store"
import { sessionActions } from "@/store/slices"
import { Me } from "@/type"

// Wait for Redux rehydration
const waitForRehydration = () =>
  new Promise<void>(resolve => {
    if (store.getState()._persist?.rehydrated) return resolve()

    const unsubscribe = store.subscribe(() => {
      if (store.getState()._persist?.rehydrated) {
        unsubscribe()
        resolve()
      }
    })
  })

// Get current session
const getSession = () => store.getState().session

// Fetch the current user through TanStack Query so the cache is warm before the
// route renders. `ensureQueryData` returns the cached user if it's still fresh,
// otherwise it runs the query (the X-Session header is added by the axios
// interceptor). The result is mirrored into Redux for the rest of the app.
const fetchUser = async () => {
  const user = await queryClient.ensureQueryData(meQueryOptions())

  store.dispatch(
    sessionActions.sessionMutation({
      user,
      isAdmin: user.role === "admin",
    })
  )

  return user
}

// Handle 401 auth error
const handleAuthError = (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401) {
    store.dispatch(sessionActions.reset())
    queryClient.removeQueries({ queryKey: meQueryOptions().queryKey })

    return redirect(AuthRoutes.Login.path)
  }

  return null
}

// Loader for routes requiring authentication. Returns the user, or a redirect
// Response to the login page when there's no valid session.
const accountRouteLoader = async () => {
  await waitForRehydration()

  const { session } = getSession()

  if (!session) return redirect(AuthRoutes.Login.path)

  try {
    return await fetchUser()
  } catch (error) {
    return handleAuthError(error)
  }
}

// Loader for admin-only routes. Reuses the auth loader, then additionally
// requires the `admin` role.
const adminRouteLoader = async () => {
  const result = await accountRouteLoader()

  // A redirect (not logged in / 401) — pass it straight through.
  if (result instanceof Response) return result

  const user = result as Me | null

  // Authenticated but not an admin — send them to their own account dashboard.
  if (user?.role !== "admin") return redirect(AccountRoutes.Dashboard.path)

  return user
}

// Loader for public routes (redirect if already logged in)
const publicRouteLoader = async () => {
  const { session } = getSession()

  if (!session) return null
}

export { accountRouteLoader, adminRouteLoader, publicRouteLoader }
