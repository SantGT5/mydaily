import { Box, Flex, Link, Text } from "@chakra-ui/react"

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
          © {new Date().getFullYear()} {siteConfig.name}. Built with React, Vite &amp; Chakra UI.
        </Text>
        <Flex gap="5">
          <Link
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer noopener"
            color="fg.muted"
            _hover={{ color: "fg" }}
          >
            GitHub
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}
