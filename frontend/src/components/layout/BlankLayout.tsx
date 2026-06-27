import { Flex } from "@chakra-ui/react"

import { Outlet, ScrollRestoration } from "react-router"

/**
 * Chrome-less shell — no header, footer, or nav, with the routed content
 * centered in the viewport. Used for focused, single-purpose flows that arrive
 * from an external link (e.g. email account activation).
 */
export function BlankLayout() {
  return (
    <Flex as="main" direction="column" align="center" justify="center" minH="100dvh" px="4" py="12">
      <ScrollRestoration />
      <Outlet />
    </Flex>
  )
}
