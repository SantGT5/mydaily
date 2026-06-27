import { Link, VStack } from "@chakra-ui/react"

import { NavLink } from "react-router"

interface SidebarNavProps {
  /** Called after a nav link is activated (e.g. to close the mobile drawer). */
  onNavigate?: () => void
}

/**
 * Placeholder navigation list shared by the mobile drawer.
 *
 * NOTE: stubbed so the build stays green — `MobileNav` imported `./SidebarNav`
 * but the file didn't exist yet. Replace these links with the real nav.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <VStack as="nav" align="stretch" gap="1">
      <Link asChild fontSize="sm" fontWeight="medium" color="fg.muted" _hover={{ color: "fg" }}>
        <NavLink to="/docs" onClick={onNavigate}>
          Documentation
        </NavLink>
      </Link>
    </VStack>
  )
}
