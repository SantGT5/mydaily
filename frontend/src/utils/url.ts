/**
 * Constructs a query string from a base URL and a set of parameters,
 * removing any parameters with undefined or empty values.
 * @param {object} props - Props
 * @param {string} props.baseUrl - The base URL to which the query string will be appended. Defaults to an empty string.
 * @param {object} props.params - An object representing key-value pairs of query parameters.
 *   - Keys are parameter names.
 *   - Values must be valid (e.g., strings, numbers, booleans). Invalid values (`undefined`, `null`, or `NaN`) are excluded.
 * @returns {string} A complete URL with the cleaned query string appended. If no valid parameters are present, returns the base URL.
 * @example
 * // Without a base URL
 * const queryString = buildQueryString({ baseUrl: "", params: { category: "books", price: "" } });
 * console.log(queryString); // "?category=books"
 */
const buildQueryString = ({
  baseUrl = "",
  params = {},
}: {
  baseUrl?: string
  params: Record<string, string | number | boolean | null | undefined>
}): string => {
  const filteredParams = Object.entries(params)
    .filter(
      ([_, value]) => undefined !== value && null !== value && !Number.isNaN(value) && "" !== value // Remove undefined, null, NaN, and empty string values
    )
    .map(([key, value]) => {
      const safeValue = value as string | number | boolean

      return `${encodeURIComponent(key)}=${encodeURIComponent(safeValue)}`
    })

  return filteredParams.length > 0 ? `${baseUrl}?${filteredParams.join("&")}` : baseUrl
}

/**
 * Removes specific query parameters from a URL.
 * @param {string} url - The original URL.
 * @param {string[]} keys - An array of parameter keys to remove.
 * @returns {string} - The updated URL without the specified parameters.
 * @example
 * const url = removeQueryParam("/user?page=1&sort_by=name&filter=active", ["sort_by", "filter"]);
 * console.log(url); // "/user?page=1"
 */
const removeQueryParam = (url: string, keys: string[] = []): string => {
  const [baseUrl, queryString] = url.split("?")
  const params = new URLSearchParams(queryString || "")

  keys.forEach(key => params.delete(key))

  const updatedQueryString = params.toString()

  return updatedQueryString ? `${baseUrl}?${updatedQueryString}` : baseUrl
}

/**
 * Updates the current URL by adding or updating query parameters.
 * @param {object} props - Props
 * @param {object} props.params - Key-value pairs representing the query parameters to add or update.
 *   - Keys are parameter names.
 *   - Values must be valid (e.g., strings, numbers, booleans). Invalid values (`undefined`, `null`, `NaN`, or empty strings) are excluded.
 * @param {boolean} [props.replaceHistory] - If true, replaces the current URL in browser history. Otherwise, adds a new entry. Defaults to `false`.
 */
const updateUrlWithQueries = ({
  params = {},
  replaceHistory = false,
}: {
  params: Record<string, string | number | boolean | null | undefined>
  replaceHistory?: boolean
}): void => {
  if (typeof window === "undefined") return

  // Create a URL object for the current location
  const currentUrl = new URL(window.location.href)

  // Iterate through the parameters to add or update
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && !Number.isNaN(value) && value !== "") {
      currentUrl.searchParams.set(key, String(value)) // Add or update the parameter
    } else {
      currentUrl.searchParams.delete(key) // Remove invalid parameters
    }
  })

  // Update the URL without reloading
  if (replaceHistory) {
    window.history.replaceState(null, "", currentUrl.toString())
  } else {
    window.history.pushState(null, "", currentUrl.toString())
  }
}

/**
 * Extracts query parameters from a URL as an object.
 * @param {string} url - The URL to parse.
 * @returns {object} - An object containing the key-value pairs of query parameters.
 * @example
 * const params = getQueryParams("/user?page=1&sort_by=name&filter=active");
 * console.log(params); // { page: "1", sort_by: "name", filter: "active" }
 */
const getQueryParams = (url: string): Record<string, string> => {
  const queryString = url.split("?")[1] || ""
  const params = new URLSearchParams(queryString)

  return Array.from(params.entries()).reduce((acc: Record<string, string>, [key, value]) => {
    acc[key] = value

    return acc
  }, {})
}

/**
 * Checks if a specific query parameter exists in a URL.
 * @param {string} url - The URL to check.
 * @param {string} key - The query parameter key to look for.
 * @returns {boolean} - `true` if the parameter exists, otherwise `false`.
 * @example
 * const exists = hasQueryParam("/user?page=1&sort_by=name", "sort_by");
 * console.log(exists); // true
 */
const hasQueryParam = (url: string, key: string): boolean => {
  const queryString = url.split("?")[1] || ""
  const params = new URLSearchParams(queryString)

  return params.has(key)
}

export { buildQueryString, getQueryParams, hasQueryParam, removeQueryParam, updateUrlWithQueries }
