import { observer } from "mobx-react-lite"
import { ComponentType, FC, useMemo, useState } from "react"
import { Alert, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { useStores } from "../models"
import { useRouter } from "expo-router"
import { colors, spacing } from "../theme"

interface SignupScreenProps {}

export const SignupScreen: FC<SignupScreenProps> = observer(function SignupScreen() {
  const router = useRouter()
  const { authenticationStore } = useStores()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(true)

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    try {
      await authenticationStore.signup(email.trim(), password)
      // Navigation will happen automatically via the auth state change
    } catch (signupError: any) {
      Alert.alert(
        "Signup Failed",
        signupError.message || "Please check your details and try again.",
      )
    }
  }

  const handleLoginPress = () => {
    router.push("/login" as any)
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

  const ConfirmPasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function ConfirmPasswordRightAccessory() {
        return (
          <TouchableOpacity onPress={() => setIsConfirmPasswordHidden(!isConfirmPasswordHidden)}>
            <Icon
              icon={isConfirmPasswordHidden ? "view" : "hidden"}
              color={colors.palette.neutral800}
              size={20}
            />
          </TouchableOpacity>
        )
      },
    [isConfirmPasswordHidden],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="signup-heading" text="Create Account" preset="heading" style={$signUp} />
      <Text text="Enter your details to get started" preset="subheading" style={$enterDetails} />

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
      />

      <TextField
        value={password}
        onChangeText={setPassword}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="new-password"
        autoCorrect={false}
        secureTextEntry={isPasswordHidden}
        label="Password"
        placeholder="Enter your password"
        RightAccessory={PasswordRightAccessory}
      />

      <TextField
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="new-password"
        autoCorrect={false}
        secureTextEntry={isConfirmPasswordHidden}
        label="Confirm Password"
        placeholder="Confirm your password"
        RightAccessory={ConfirmPasswordRightAccessory}
        onSubmitEditing={handleSignup}
      />

      <Button
        testID="signup-button"
        text="Create Account"
        style={$tapButton}
        preset="reversed"
        onPress={handleSignup}
        disabled={
          authenticationStore.isLoading ||
          !email.trim() ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
      />

      <Text style={$loginText}>
        <Text text="Already have an account? " />
        <Text text="Sign In" style={$loginLink} onPress={handleLoginPress} />
      </Text>
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $signUp: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.lg,
}

const $loginText: TextStyle = {
  textAlign: "center",
}

const $loginLink: TextStyle = {
  color: colors.tint,
  textDecorationLine: "underline",
}

export default SignupScreen
