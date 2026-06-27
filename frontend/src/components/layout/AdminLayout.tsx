import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Separator,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"

import type { ReactNode } from "react"

import { LuHouse, LuLayoutDashboard, LuLogOut, LuShieldCheck, LuUsers } from "react-icons/lu"
import { NavLink, Outlet, ScrollRestoration, useNavigate } from "react-router"

import { queryClient, useMe } from "@/api"
import { ColorModeButton } from "@/components/ui/color-mode"
import { BELOW_HEADER_HEIGHT, HEADER_HEIGHT, SIDEBAR_WIDTH } from "@/config/layout"
import { siteConfig } from "@/config/site"
import { AdminRoutes } from "@/pages/admin"
import { AnonymousRoutes } from "@/pages/anonymous"
import { AuthRoutes } from "@/pages/auth"
import { useAppDispatch } from "@/store"
import { sessionActions } from "@/store/slices"

interface AdminNavItem {
  label: string
  to: string
  icon: ReactNode
  /** Match the path exactly (used for the index route so it isn't always active). */
  end?: boolean
}

const navItems: AdminNavItem[] = [
  { label: "Dashboard", to: AdminRoutes.Dashboard.path, icon: <LuLayoutDashboard />, end: true },
  { label: "Users", to: AdminRoutes.Users.path, icon: <LuUsers /> },
]

function SidebarLink({ label, to, icon, end }: AdminNavItem) {
  return (
    <NavLink to={to} end={end} style={{ display: "block", width: "100%" }}>
      {({ isActive }) => (
        <HStack
          gap="3"
          px="3"
          py="2"
          rounded="md"
          fontSize="sm"
          fontWeight="medium"
          color={isActive ? "brand.fg" : "fg.muted"}
          bg={isActive ? "brand.subtle" : "transparent"}
          _hover={isActive ? undefined : { bg: "bg.muted", color: "fg" }}
        >
          <Icon boxSize="4">{icon}</Icon>
          <Text>{label}</Text>
        </HStack>
      )}
    </NavLink>
  )
}

/**
 * Shell for the admin area.
 *
 * Deliberately distinct from the public `RootLayout`: a persistent branded
 * sidebar with an "Admin" badge makes it obvious at a glance that you're in the
 * privileged section rather than the normal user-facing app.
 */
export function AdminLayout() {
  const { data: user } = useMe()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSignOut = () => {
    dispatch(sessionActions.reset())
    queryClient.clear()
    navigate(AuthRoutes.Login.path)
  }

  const handleGoHome = () => {
    navigate(AnonymousRoutes.Home.path)
  }

  return (
    <Flex minH="100dvh">
      <ScrollRestoration />

      {/* Sidebar — hidden on small screens (mobile nav is a TODO). */}
      <Flex
        as="aside"
        direction="column"
        display={{ base: "none", md: "flex" }}
        w={SIDEBAR_WIDTH}
        position="sticky"
        top="0"
        h="100dvh"
        bg="bg.panel"
        borderRightWidth="1px"
        borderColor="border"
        px="4"
        py="5"
      >
        <HStack gap="2" px="2" mb="6">
          <Icon color="brand.fg" boxSize="6">
            <LuShieldCheck />
          </Icon>
          <Text fontWeight="bold" fontSize="lg" letterSpacing="tight">
            {siteConfig.name}
          </Text>
          <Badge colorPalette="brand" size="sm">
            Admin
          </Badge>
        </HStack>

        <VStack as="nav" align="stretch" gap="1">
          {navItems.map(item => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </VStack>

        <Spacer />

        <Separator mb="3" />
        <Box px="2" mb="3">
          <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
            {user?.full_name ?? "Admin"}
          </Text>

          <Text fontSize="xs" color="fg.muted" lineClamp={1}>
            {user?.email}
          </Text>
        </Box>

        <HStack gap="2">
          <IconButton
            variant="outline"
            size="sm"
            aria-label="Go to home page"
            onClick={handleGoHome}
          >
            <LuHouse />
          </IconButton>

          <IconButton variant="outline" size="sm" aria-label="Sign out" onClick={handleSignOut}>
            <LuLogOut />
          </IconButton>
        </HStack>
      </Flex>

      {/* Main column */}
      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          h={HEADER_HEIGHT}
          align="center"
          gap="3"
          px={{ base: "4", md: "6" }}
          borderBottomWidth="1px"
          borderColor="border"
          bg="bg.panel"
          position="sticky"
          top="0"
          zIndex="1000"
        >
          <Badge colorPalette="brand" display={{ base: "inline-flex", md: "none" }}>
            Admin
          </Badge>
          <Spacer />
          <ColorModeButton />
        </Flex>

        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          outline="none"
          minH={BELOW_HEADER_HEIGHT}
          px={{ base: "4", md: "6" }}
          py="6"
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
