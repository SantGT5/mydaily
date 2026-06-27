import { Box, Heading, SimpleGrid, Stat, Text } from "@chakra-ui/react"

import { useMe } from "@/api"

const Dashboard = () => {
  const { data: user } = useMe()

  return (
    <Box>
      <Heading size="lg" mb="1">
        Dashboard
      </Heading>
      <Text color="fg.muted" mb="6">
        Welcome back{user?.full_name ? `, ${user.full_name}` : ""}.
      </Text>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
        <Stat.Root borderWidth="1px" borderColor="border" rounded="lg" p="5">
          <Stat.Label>Users</Stat.Label>
          <Stat.ValueText>—</Stat.ValueText>
        </Stat.Root>
        <Stat.Root borderWidth="1px" borderColor="border" rounded="lg" p="5">
          <Stat.Label>Active sessions</Stat.Label>
          <Stat.ValueText>—</Stat.ValueText>
        </Stat.Root>
        <Stat.Root borderWidth="1px" borderColor="border" rounded="lg" p="5">
          <Stat.Label>Your role</Stat.Label>
          <Stat.ValueText textTransform="capitalize">{user?.role ?? "—"}</Stat.ValueText>
        </Stat.Root>
      </SimpleGrid>
    </Box>
  )
}

export { Dashboard }
