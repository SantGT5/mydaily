/**
 * Mirrors the backend password policy (`utils.IsValidPassword`): 8–64 characters
 * with at least one uppercase letter, one lowercase letter, one digit, and one
 * special character. This is only for instant client-side feedback — the server
 * re-checks on activation and stays the source of truth.
 */
const isValidPassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 64) return false

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  // Anything that isn't a letter, digit, or whitespace counts as "special".
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password)

  return hasUpper && hasLower && hasNumber && hasSpecial
}

export { isValidPassword }
