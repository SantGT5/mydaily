import { Box, Flex, Text } from "@chakra-ui/react"

import { siteConfig } from "@/config/site"

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" py="8" mt="16">
      <Flex
        maxW="8xl"
        mx="auto"
        px={{ base: "4", md: "6" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
        justify="space-between"
        align="center"
        color="fg.muted"
        fontSize="sm"
      >
        <Text>
          © {new Date().getFullYear()} {siteConfig.name}
        </Text>
      </Flex>
    </Box>
  )
}
