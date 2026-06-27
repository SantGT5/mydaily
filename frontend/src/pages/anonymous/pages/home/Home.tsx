import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"

import type { ReactNode } from "react"

import {
  LuArrowRight,
  LuCalendarCheck,
  LuClipboardList,
  LuFolderGit2,
  LuGitCommitHorizontal,
  LuGithub,
  LuSparkles,
} from "react-icons/lu"
import { Link as RouterLink } from "react-router"

import { siteConfig } from "@/config/site"
import { AuthRoutes } from "@/pages/auth"

interface Feature {
  icon: ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <LuGithub />,
    title: "Connect your GitHub",
    description:
      "Securely link your GitHub account once and keep everything in sync automatically.",
  },
  {
    icon: <LuFolderGit2 />,
    title: "Browse repos & commits",
    description:
      "See all your repositories and dig into their commit history without leaving the app.",
  },
  {
    icon: <LuCalendarCheck />,
    title: "Daily commit report",
    description:
      "Wake up to a tidy summary of yesterday's commits, grouped by repository and ready to read.",
  },
  {
    icon: <LuClipboardList />,
    title: "Standup-ready",
    description: "Glance at your report during the morning meeting and recap your work in seconds.",
  },
]

interface Step {
  title: string
  description: string
}

const steps: Step[] = [
  {
    title: "Connect GitHub",
    description: "Authorize My Daily to read your repositories and commit activity.",
  },
  {
    title: "We track your commits",
    description: "Every day we collect what you pushed across your repositories.",
  },
  {
    title: "Read it at standup",
    description: "Open your daily report and share your update — no scrambling required.",
  },
]

/** A small mock of the daily report, used as the hero's visual. */
function ReportPreview() {
  const items = [
    { repo: "mydaily", message: "feat: add layout components", time: "09:14" },
    { repo: "mydaily", message: "fix: header alignment on mobile", time: "11:02" },
    { repo: "api-gateway", message: "ref: extract auth middleware", time: "16:48" },
  ]

  return (
    <Box
      w="full"
      maxW="md"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      shadow="lg"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        px="5"
        py="4"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <HStack gap="2">
          <Icon color="brand.fg" boxSize="5">
            <LuCalendarCheck />
          </Icon>
          <Text fontWeight="semibold">Daily report</Text>
        </HStack>
        <Badge colorPalette="brand" size="sm">
          Today
        </Badge>
      </HStack>

      <VStack align="stretch" gap="0" px="5" py="3">
        {items.map((item, index) => (
          <HStack
            key={index}
            gap="3"
            py="3"
            borderBottomWidth={index === items.length - 1 ? "0" : "1px"}
            borderColor="border"
            align="flex-start"
          >
            <Icon color="fg.muted" boxSize="4" mt="0.5">
              <LuGitCommitHorizontal />
            </Icon>
            <Box flex="1" minW="0">
              <Text fontSize="sm" lineClamp={1}>
                {item.message}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {item.repo}
              </Text>
            </Box>
            <Text fontSize="xs" color="fg.subtle" fontFamily="mono">
              {item.time}
            </Text>
          </HStack>
        ))}
      </VStack>

      <HStack px="5" py="3" borderTopWidth="1px" borderColor="border" color="fg.muted">
        <Icon boxSize="4">
          <LuClipboardList />
        </Icon>
        <Text fontSize="xs">3 commits across 2 repositories — ready for standup.</Text>
      </HStack>
    </Box>
  )
}

const Home = () => {
  return (
    <Box>
      {/* Hero */}
      <Box bg="bg.subtle" borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={{ base: "16", md: "24" }}>
          <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            gap={{ base: "12", lg: "16" }}
            alignItems="center"
          >
            <Stack gap="6" maxW="2xl">
              <Badge colorPalette="brand" size="lg" alignSelf="flex-start" rounded="full" px="3">
                <LuSparkles />
                Your standup, sorted
              </Badge>

              <Heading
                as="h1"
                size={{ base: "3xl", md: "5xl" }}
                lineHeight="1.1"
                letterSpacing="tight"
              >
                Turn your GitHub commits into an effortless daily standup.
              </Heading>

              <Text fontSize={{ base: "lg", md: "xl" }} color="fg.muted">
                {siteConfig.tagline ||
                  "Connect your GitHub, track your commits, and get a daily report you can read straight from your morning meeting."}
              </Text>

              <HStack gap="3" pt="2" flexWrap="wrap">
                <Button asChild colorPalette="brand" size="lg">
                  <RouterLink to={AuthRoutes.Login.path}>
                    <LuGithub />
                    Connect GitHub
                  </RouterLink>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how-it-works">
                    See how it works
                    <LuArrowRight />
                  </a>
                </Button>
              </HStack>
            </Stack>

            <Box
              justifySelf={{ base: "stretch", lg: "end" }}
              w="full"
              display="flex"
              justifyContent="center"
            >
              <ReportPreview />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxW="6xl" py={{ base: "16", md: "20" }}>
        <Stack gap="3" mb="12" maxW="2xl">
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight">
            Everything you need for a 30-second update
          </Heading>
          <Text fontSize="lg" color="fg.muted">
            My Daily watches your GitHub activity so you can walk into standup already knowing
            exactly what you shipped.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
          {features.map(feature => (
            <VStack
              key={feature.title}
              align="flex-start"
              gap="4"
              p="6"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border"
              rounded="lg"
              h="full"
            >
              <Box
                display="inline-flex"
                p="3"
                rounded="lg"
                bg="brand.subtle"
                color="brand.fg"
                fontSize="xl"
              >
                {feature.icon}
              </Box>
              <Box>
                <Text fontWeight="semibold" mb="1">
                  {feature.title}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                  {feature.description}
                </Text>
              </Box>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>

      {/* How it works */}
      <Box
        id="how-it-works"
        bg="bg.subtle"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Container maxW="6xl" py={{ base: "16", md: "20" }}>
          <Stack gap="3" mb="12" maxW="2xl">
            <Heading as="h2" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight">
              How it works
            </Heading>
            <Text fontSize="lg" color="fg.muted">
              Three steps from "what did I do yesterday?" to a report you can read out loud.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
            {steps.map((step, index) => (
              <VStack
                key={step.title}
                align="flex-start"
                gap="4"
                p="6"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                rounded="lg"
                h="full"
              >
                <HStack
                  justify="center"
                  boxSize="10"
                  rounded="full"
                  bg="brand.solid"
                  color="brand.contrast"
                  fontWeight="bold"
                >
                  {index + 1}
                </HStack>
                <Box>
                  <Text fontWeight="semibold" mb="1">
                    {step.title}
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {step.description}
                  </Text>
                </Box>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxW="6xl" py={{ base: "16", md: "24" }}>
        <VStack
          gap="6"
          textAlign="center"
          bg="brand.subtle"
          borderWidth="1px"
          borderColor="border"
          rounded="2xl"
          px={{ base: "6", md: "12" }}
          py={{ base: "12", md: "16" }}
        >
          <Heading as="h2" size={{ base: "2xl", md: "3xl" }} letterSpacing="tight" maxW="2xl">
            Stop digging through your git log every morning
          </Heading>
          <Text fontSize="lg" color="fg.muted" maxW="xl">
            Connect {siteConfig.name} to your GitHub and let your daily report write itself.
          </Text>
          <Button asChild colorPalette="brand" size="lg">
            <RouterLink to={AuthRoutes.Login.path}>
              <LuGithub />
              Connect GitHub
              <LuArrowRight />
            </RouterLink>
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}

export { Home }
