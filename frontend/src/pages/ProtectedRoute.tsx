import React from "react"

type ProtectedRouteProps = {
  children: React.ReactNode
}

// check if user as admin permission
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return children
}

export { ProtectedRoute }
