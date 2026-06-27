import axios from "axios"

import { store } from "@/store"

/**
 * Base URL for the API.
 *
 * Defaults to the relative `/api` path (so it works behind a dev proxy or when
 * the SPA is served from the same origin as the API). Point it at an absolute
 * URL in production via the `VITE_API_URL` env var, e.g.
 * `VITE_API_URL=https://mydaily.com/api`.
 */
const baseURL = import.meta.env.VITE_API_URL ?? "/api"

/**
 * Single axios instance used by every request in the app.
 *
 * TanStack Query sits on top of this as the caching/state layer — axios stays
 * responsible only for the transport. Keeping it isolated here means swapping
 * the transport (or its config) never touches the query layer.
 */
const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

// Attach the session token to every request from the Redux store, so callers
// (and query functions) never have to thread it through by hand.
http.interceptors.request.use(config => {
  const { session } = store.getState().session

  if (session) config.headers.set("X-Session", session)

  return config
})

export { http }
