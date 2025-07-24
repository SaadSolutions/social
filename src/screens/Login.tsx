import { observer } from "mobx-react-lite"
import { ComponentType, FC, useMemo, useState } from "react"
import { Alert, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { useStores } from "../models"
import { useRouter } from "expo-router"
import { colors, spacing } from "../theme"

interface LoginScreenProps {}

export const LoginScreen: FC<LoginScreenProps> = observer(function LoginScreen() {
  const router = useRouter()
  const { authenticationStore } = useStores()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [attemptsCount, setAttemptsCount] = useState(0)

  const error = useMemo(
    () => (attemptsCount > 2 ? "Invalid email or password" : ""),
    [attemptsCount],
  )

  const handleLogin = async () => {
    try {
      await authenticationStore.login(email.trim(), password)
      // Navigation will happen automatically via the auth state change
    } catch (loginError: any) {
      setAttemptsCount(attemptsCount + 1)
      Alert.alert(
        "Login Failed",
        loginError.message || "Please check your credentials and try again.",
      )
    }
  }

  const handleSignUpPress = () => {
    router.push("/signup" as any)
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory() {
        return (
          <TouchableOpacity onPress={() => setIsPasswordHidden(!isPasswordHidden)}>
            <Icon
              icon={isPasswordHidden ? "view" : "hidden"}
              color={colors.palette.neutral800}
              size={20}
            />
          </TouchableOpacity>
        )
      },
    [isPasswordHidden],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="login-heading" text="Sign In" preset="heading" style={$signIn} />
      <Text text="Enter your details below to continue" preset="subheading" style={$enterDetails} />
      {attemptsCount > 2 && (
        <Text text="Check your email and password" size="sm" weight="light" style={$hint} />
      )}

      <TextField
        value={email}
        onChangeText={setEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        label="Email"
        placeholder="Enter your email address"
        helper={error}
        status={error ? "error" : undefined}
      />

      <TextField
        value={password}
        onChangeText={setPassword}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isPasswordHidden}
        label="Password"
        placeholder="Enter your password"
        RightAccessory={PasswordRightAccessory}
        onSubmitEditing={handleLogin}
      />

      <Button
        testID="login-button"
        text="Sign In"
        style={$tapButton}
        preset="reversed"
        onPress={handleLogin}
        disabled={authenticationStore.isLoading || !email.trim() || !password}
      />

      <Text style={$signUpText}>
        <Text text="Don't have an account? " />
        <Text text="Sign Up" style={$signUpLink} onPress={handleSignUpPress} />
      </Text>
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $signIn: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.md,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.lg,
}

const $signUpText: TextStyle = {
  textAlign: "center",
}

const $signUpLink: TextStyle = {
  color: colors.tint,
  textDecorationLine: "underline",
}

export default LoginScreen
