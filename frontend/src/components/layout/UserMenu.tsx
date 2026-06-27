import { Avatar, Box, Menu, Portal, Text } from "@chakra-ui/react"

import { useRef, useState } from "react"

import { LuLogOut, LuUser } from "react-icons/lu"
import { useNavigate } from "react-router"

import { queryClient } from "@/api"
import { AdminRoutes } from "@/pages/admin"
import { AuthRoutes } from "@/pages/auth"
import { useAppDispatch, useAppSelector } from "@/store"
import { sessionActions } from "@/store/slices"

/**
 * Account control shown in the header when a user is signed in.
 *
 * An avatar button that reveals a menu on hover (and on click/focus, so it
 * stays keyboard accessible). A short delay before closing lets the pointer
 * travel from the trigger to the portaled menu without it disappearing.
 */
export function UserMenu() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(state => state.session.user)

  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fullName = typeof user.full_name === "string" ? user.full_name : undefined
  const email = typeof user.email === "string" ? user.email : undefined

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const openMenu = () => {
    cancelClose()
    setOpen(true)
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const handleProfile = () => {
    setOpen(false)
    // TODO: point at a dedicated profile page once one exists.
    navigate(AdminRoutes.Dashboard.path)
  }

  const handleLogout = () => {
    setOpen(false)
    dispatch(sessionActions.reset())
    queryClient.clear()
    navigate(AuthRoutes.Login.path)
  }

  return (
    <Menu.Root
      open={open}
      onOpenChange={event => setOpen(event.open)}
      positioning={{ placement: "bottom-end" }}
    >
      <Menu.Trigger
        asChild
        rounded="full"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onFocus={openMenu}
      >
        <Box as="button" aria-label="Account menu" cursor="pointer" rounded="full" lineHeight="0">
          <Avatar.Root size="sm" colorPalette="brand">
            <Avatar.Fallback name={fullName}>
              <LuUser />
            </Avatar.Fallback>
          </Avatar.Root>
        </Box>
      </Menu.Trigger>

      <Portal>
        <Menu.Positioner onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <Menu.Content minW="14rem">
            {(fullName || email) && (
              <Box px="3" py="2">
                {fullName && (
                  <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                    {fullName}
                  </Text>
                )}
                {email && (
                  <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                    {email}
                  </Text>
                )}
              </Box>
            )}

            {(fullName || email) && <Menu.Separator />}

            <Menu.Item value="profile" onClick={handleProfile}>
              <LuUser />
              <Box flex="1">Profile</Box>
            </Menu.Item>
            <Menu.Item
              value="logout"
              onClick={handleLogout}
              color="fg.error"
              _highlighted={{ bg: "bg.error", color: "fg.error" }}
            >
              <LuLogOut />
              <Box flex="1">Logout</Box>
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
