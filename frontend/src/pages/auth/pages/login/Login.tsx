import {
  Alert,
  Box,
  Button,
  Container,
  Field,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { isAxiosError } from "axios"

import { type ComponentProps, useState } from "react"

import { LuEye, LuEyeOff, LuLock, LuLogIn, LuMail } from "react-icons/lu"
import { useNavigate } from "react-router"

import { meQueryOptions, queryClient, useLogin } from "@/api"
import { siteConfig } from "@/config/site"
import { AdminRoutes } from "@/pages/admin"
import { AnonymousRoutes } from "@/pages/anonymous"
import { useAppDispatch } from "@/store"
import { sessionActions } from "@/store/slices"

/** Pull a human-readable message out of the API's error shapes. */
function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { error?: string; validationError?: Record<string, string> } | undefined

    if (data?.error) return data.error

    const firstFieldError = data?.validationError && Object.values(data.validationError)[0]

    if (firstFieldError) return firstFieldError
  }

  return "Something went wrong. Please try again."
}

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit: ComponentProps<"form">["onSubmit"] = async event => {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const { session_token } = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      })

      // Store the token first so the axios interceptor attaches `X-Session` to
      // the `/auth/me/` request below.
      dispatch(sessionActions.sessionMutation({ session: session_token }))

      try {
        const user = await queryClient.fetchQuery(meQueryOptions())

        dispatch(
          sessionActions.sessionMutation({
            user,
            isAdmin: user.role === "admin",
            isUser: user.role === "user",
          })
        )

        // No dedicated user area yet, so non-admins land on the home page.
        navigate(user.role === "admin" ? AdminRoutes.Dashboard.path : AnonymousRoutes.Home.path)
      } catch (meError) {
        // The token worked but loading the user failed — roll back so we don't
        // sit in a half-authenticated state.
        dispatch(sessionActions.reset())
        queryClient.removeQueries({ queryKey: meQueryOptions().queryKey })
        throw meError
      }
    } catch (error) {
      setFormError(getLoginErrorMessage(error))
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
        <VStack gap="2" mb="6" textAlign="center">
          <Box display="inline-flex" p="3" rounded="full" bg="brand.subtle" color="brand.fg" mb="1">
            <Icon boxSize="6">
              <LuLock />
            </Icon>
          </Box>
          <Heading size="xl" letterSpacing="tight">
            Welcome back
          </Heading>
          <Text color="fg.muted">
            Sign in to {siteConfig.name} to see your daily commit report.
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
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </InputGroup>
            </Field.Root>

            <Field.Root required>
              <Field.Label>Password</Field.Label>
              <InputGroup
                startElement={
                  <Icon color="fg.muted">
                    <LuLock />
                  </Icon>
                }
                endElement={
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    variant="ghost"
                    size="xs"
                    me="-2"
                    onClick={() => setShowPassword(value => !value)}
                  >
                    {showPassword ? <LuEyeOff /> : <LuEye />}
                  </IconButton>
                }
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </InputGroup>
            </Field.Root>

            <Button
              type="submit"
              colorPalette="brand"
              size="lg"
              w="full"
              mt="2"
              loading={submitting}
              loadingText="Signing in…"
              disabled={!email || !password}
            >
              <LuLogIn />
              Sign in
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  )
}

export { Login }
