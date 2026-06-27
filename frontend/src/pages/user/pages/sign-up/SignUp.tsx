import {
  Alert,
  Box,
  Button,
  Container,
  Field,
  Heading,
  Icon,
  Input,
  InputGroup,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { isAxiosError } from "axios"

import { type ComponentProps, useState } from "react"

import { LuMail, LuMailCheck, LuUser, LuUserPlus } from "react-icons/lu"
import { Link as RouterLink } from "react-router"

import { useCreateUser } from "@/api"
import { siteConfig } from "@/config/site"
import { AuthRoutes } from "@/pages/auth"

/** Pull a human-readable message out of the API's error shapes. */
function getSignUpErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { error?: string; validationError?: Record<string, string> } | undefined

    if (data?.error) return data.error

    const firstFieldError = data?.validationError && Object.values(data.validationError)[0]

    if (firstFieldError) return firstFieldError
  }

  return "Something went wrong. Please try again."
}

const SignUp = () => {
  const createUserMutation = useCreateUser()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const handleSubmit: ComponentProps<"form">["onSubmit"] = async event => {
    event.preventDefault()
    setFormError(null)

    const name = fullName.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!name || !normalizedEmail) {
      setFormError("Please enter your full name and email.")

      return
    }

    setSubmitting(true)

    try {
      // Role is fixed to "user" for public sign-ups — the backend still requires
      // the field, and only admins are provisioned through other flows.
      await createUserMutation.mutateAsync({
        full_name: name,
        email: normalizedEmail,
        role: "user",
      })

      // No session is returned: the account must be activated from the email
      // link, so land on a confirmation screen instead of logging in.
      setSubmittedEmail(normalizedEmail)
    } catch (error) {
      setFormError(getSignUpErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxW="md" py={{ base: "12", md: "20" }}>
      <Box
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
        rounded="xl"
        shadow="sm"
        p={{ base: "6", md: "8" }}
      >
        {submittedEmail ? (
          <VStack gap="3" textAlign="center">
            <Box
              display="inline-flex"
              p="3"
              rounded="full"
              bg="green.subtle"
              color="green.fg"
              mb="1"
            >
              <Icon boxSize="6">
                <LuMailCheck />
              </Icon>
            </Box>
            <Heading size="xl" letterSpacing="tight">
              Check your email
            </Heading>
            <Text color="fg.muted">
              We sent an activation link to{" "}
              <Text as="span" fontWeight="medium">
                {submittedEmail}
              </Text>
              . Open it to set your password and finish creating your account.
            </Text>
            <Button asChild variant="outline" mt="2" w="full" size="lg">
              <RouterLink to={AuthRoutes.Login.path}>Back to log in</RouterLink>
            </Button>
          </VStack>
        ) : (
          <>
            <VStack gap="2" mb="6" textAlign="center">
              <Box
                display="inline-flex"
                p="3"
                rounded="full"
                bg="brand.subtle"
                color="brand.fg"
                mb="1"
              >
                <Icon boxSize="6">
                  <LuUserPlus />
                </Icon>
              </Box>
              <Heading size="xl" letterSpacing="tight">
                Create your account
              </Heading>
              <Text color="fg.muted">
                Join {siteConfig.name} to turn your commits into a daily report.
              </Text>
            </VStack>

            {formError && (
              <Alert.Root status="error" rounded="md" mb="4">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{formError}</Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="4">
                <Field.Root required>
                  <Field.Label>Name</Field.Label>
                  <InputGroup
                    startElement={
                      <Icon color="fg.muted">
                        <LuUser />
                      </Icon>
                    }
                  >
                    <Input
                      autoFocus
                      type="text"
                      value={fullName}
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      onChange={event => setFullName(event.target.value)}
                    />
                  </InputGroup>
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Email</Field.Label>
                  <InputGroup
                    startElement={
                      <Icon color="fg.muted">
                        <LuMail />
                      </Icon>
                    }
                  >
                    <Input
                      type="email"
                      value={email}
                      autoComplete="email"
                      placeholder="you@example.com"
                      onChange={event => setEmail(event.target.value)}
                    />
                  </InputGroup>
                </Field.Root>

                <Button
                  mt="2"
                  w="full"
                  size="lg"
                  type="submit"
                  colorPalette="brand"
                  loading={submitting}
                  loadingText="Creating account…"
                  disabled={fullName.trim() === "" || email.trim() === ""}
                >
                  <LuUserPlus />
                  Create account
                </Button>
              </Stack>
            </form>

            <Text mt="6" textAlign="center" color="fg.muted" fontSize="sm">
              Already have an account?{" "}
              <Link asChild colorPalette="brand" fontWeight="medium">
                <RouterLink to={AuthRoutes.Login.path}>Log in</RouterLink>
              </Link>
            </Text>
          </>
        )}
      </Box>
    </Container>
  )
}

export { SignUp }
