import { Box, Button, Flex, HStack, IconButton, Spacer } from "@chakra-ui/react"

import { LuLogIn, LuMenu, LuUserPlus } from "react-icons/lu"
import { Link as RouterLink } from "react-router"

import { ColorModeButton } from "@/components/ui/color-mode"
import { HEADER_HEIGHT } from "@/config/layout"
import { AuthRoutes } from "@/pages/auth"
import { UserRoutes } from "@/pages/user"
import { useAppSelector } from "@/store"

import { Logo } from "./Logo"
import { UserMenu } from "./UserMenu"

interface HeaderProps {
  /** Called when the mobile menu button is pressed. Omit to hide the button. */
  onMenuOpen?: () => void
}

export function Header({ onMenuOpen }: HeaderProps) {
  // A truthy session token is the app-wide signal that someone is signed in
  // (see the route loaders). Redux is rehydrated before render via PersistGate.
  const isLoggedIn = useAppSelector(state => Boolean(state.session.session))

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <Flex
        h={HEADER_HEIGHT}
        align="center"
        gap="3"
        px={{ base: "4", md: "6" }}
        maxW="8xl"
        mx="auto"
      >
        {onMenuOpen && (
          <IconButton
            aria-label="Open navigation menu"
            variant="ghost"
            display={{ base: "inline-flex", md: "none" }}
            onClick={onMenuOpen}
          >
            <LuMenu />
          </IconButton>
        )}
        <Logo />
        <Spacer />
        <HStack gap={{ base: "1", sm: "2" }}>
          <ColorModeButton />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <RouterLink to={AuthRoutes.Login.path}>
                  <LuLogIn />
                  Log in
                </RouterLink>
              </Button>
              <Button asChild colorPalette="brand" size="sm">
                <RouterLink to={UserRoutes.SignUp.path}>
                  <LuUserPlus />
                  Sign up
                </RouterLink>
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}
