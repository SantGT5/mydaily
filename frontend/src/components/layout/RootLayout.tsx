import { Box, Flex } from "@chakra-ui/react"

import type { ReactNode } from "react"

import { Outlet, ScrollRestoration } from "react-router"

import { Footer } from "./Footer"
import { Header } from "./Header"

interface RootLayoutProps {
  /** Rendered instead of the routed `<Outlet />` (used for the 404 route). */
  children?: ReactNode
}

/** Full-width shell with header + footer. Used for the home and error pages. */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <Flex direction="column" minH="100dvh">
      <ScrollRestoration />
      <Header />
      <Box as="main" id="main-content" tabIndex={-1} flex="1" outline="none">
        {children ?? <Outlet />}
      </Box>
      <Footer />
    </Flex>
  )
}
