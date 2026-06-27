import { Box, Flex, HStack, IconButton, Spacer } from "@chakra-ui/react"

import { LuMenu } from "react-icons/lu"

import { ColorModeButton } from "@/components/ui/color-mode"
import { HEADER_HEIGHT } from "@/config/layout"

import { Logo } from "./Logo"

interface HeaderProps {
  /** Called when the mobile menu button is pressed. Omit to hide the button. */
  onMenuOpen?: () => void
}

export function Header({ onMenuOpen }: HeaderProps) {
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
        <HStack gap="1">
          <ColorModeButton />
        </HStack>
      </Flex>
    </Box>
  )
}
