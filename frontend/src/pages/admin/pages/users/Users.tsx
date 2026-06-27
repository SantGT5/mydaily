import { Box, Heading, Text } from "@chakra-ui/react"

const Users = () => {
  return (
    <Box>
      <Heading size="lg" mb="1">
        Users
      </Heading>
      <Text color="fg.muted">
        Manage application users here. This is where the paginated users list will live.
      </Text>
    </Box>
  )
}

export { Users }
