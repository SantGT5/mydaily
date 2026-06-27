import { CloseButton, Drawer, Portal } from "@chakra-ui/react"

import { SidebarNav } from "./SidebarNav"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

/**
 * Slide-in navigation drawer for small screens. Built on Chakra's `Drawer`,
 * which provides role="dialog", aria-modal, a focus trap, focus restoration,
 * Escape-to-close and an inert backdrop out of the box.
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={event => {
        if (!event.open) onClose()
      }}
      placement="start"
      size="xs"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth="1px">
              <Drawer.Title>Menu</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body py="5">
              <SidebarNav onNavigate={onClose} />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
