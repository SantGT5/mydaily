import {
  Alert,
  Box,
  Button,
  Field,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { isAxiosError } from "axios"

import { type ComponentProps, useState } from "react"

import { LuCircleAlert, LuEye, LuEyeOff, LuLock, LuUserPlus } from "react-icons/lu"
import { Link as RouterLink, useNavigate } from "react-router"

import { useActivateUser, useValidateEmailToken } from "@/api"
import { siteConfig } from "@/config/site"
import { AuthRoutes } from "@/pages/auth"
import { UserRoutes } from "@/pages/user"
import { getQueryParams, isValidPassword } from "@/utils"

const PASSWORD_HINT =
  "Use 8–64 characters with an uppercase letter, a lowercase letter, a number, and a special character."

/** Pull a human-readable message out of the API's error shapes. */
function getActivateErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { error?: string; validationError?: Record<string, string> } | undefined

    if (data?.error) return data.error

    const firstFieldError = data?.validationError && Object.values(data.validationError)[0]

    if (firstFieldError) return firstFieldError
  }

  return "Something went wrong. Please try again."
}

/** Shared card shell — `BlankLayout` centers it in the viewport. */
const Card = (props: ComponentProps<typeof Box>) => (
  <Box
    w="full"
    maxW="md"
    bg="bg.panel"
    borderWidth="1px"
    borderColor="border"
    rounded="xl"
    shadow="sm"
    p={{ base: "6", md: "8" }}
    {...props}
  />
)

const ActiveAccount = () => {
  const navigate = useNavigate()
  const activateMutation = useActivateUser()

  // The activation link lands here as /auth/activate?token=…; read it once.
  const [token] = useState(() => getQueryParams(window.location.href).token ?? "")
  const validation = useValidateEmailToken(token)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit: ComponentProps<"form">["onSubmit"] = async event => {
    event.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")

      return
    }

    if (!isValidPassword(password)) {
      setFormError(PASSWORD_HINT)

      return
    }

    setSubmitting(true)

    try {
      await activateMutation.mutateAsync({ token, password })

      // Account is now active — send them to log in with their new password.
      navigate(AuthRoutes.Login.path)
    } catch (error) {
      setFormError(getActivateErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // 1) Verifying the token.
  if (token && validation.isLoading) {
    return (
      <Card>
        <VStack gap="3" py="4">
          <Spinner size="lg" color="brand.fg" />
          <Text color="fg.muted">Verifying your activation link…</Text>
        </VStack>
      </Card>
    )
  }

  // 2) Missing, expired, or otherwise invalid token.
  if (!token || validation.isError || validation.data === false) {
    return (
      <Card>
        <VStack gap="3" textAlign="center">
          <Box display="inline-flex" p="3" rounded="full" bg="red.subtle" color="red.fg" mb="1">
            <Icon boxSize="6">
              <LuCircleAlert />
            </Icon>
          </Box>
          <Heading size="xl" letterSpacing="tight">
            Link expired
          </Heading>
          <Text color="fg.muted">
            This activation link is invalid or has expired. Please sign up again to get a new one.
          </Text>
          <Button asChild colorPalette="brand" mt="2" w="full" size="lg">
            <RouterLink to={UserRoutes.SignUp.path}>
              <LuUserPlus />
              Back to sign up
            </RouterLink>
          </Button>
        </VStack>
      </Card>
    )
  }

  // 3) Valid token — let the user set a password to finish activation.
  return (
    <Card>
      <VStack gap="2" mb="6" textAlign="center">
        <Box display="inline-flex" p="3" rounded="full" bg="brand.subtle" color="brand.fg" mb="1">
          <Icon boxSize="6">
            <LuLock />
          </Icon>
        </Box>
        <Heading size="xl" letterSpacing="tight">
          Activate your account
        </Heading>
        <Text color="fg.muted">
          Set a password to finish setting up your {siteConfig.name} account.
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
            <Field.Label>Password</Field.Label>
            <InputGroup
              startElement={
                <Icon color="fg.muted">
                  <LuLock />
                </Icon>
              }
              endElement={
                <IconButton
                  me="-2"
                  size="xs"
                  variant="ghost"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(value => !value)}
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </IconButton>
              }
            >
              <Input
                autoFocus
                value={password}
                placeholder="••••••••"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                onChange={event => setPassword(event.target.value)}
              />
            </InputGroup>
            <Field.HelperText>{PASSWORD_HINT}</Field.HelperText>
          </Field.Root>

          <Field.Root required>
            <Field.Label>Confirm password</Field.Label>
            <InputGroup
              startElement={
                <Icon color="fg.muted">
                  <LuLock />
                </Icon>
              }
            >
              <Input
                value={confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                onChange={event => setConfirmPassword(event.target.value)}
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
            loadingText="Activating…"
            disabled={password === "" || confirmPassword === ""}
          >
            Activate account
          </Button>
        </Stack>
      </form>
    </Card>
  )
}

export { ActiveAccount }
