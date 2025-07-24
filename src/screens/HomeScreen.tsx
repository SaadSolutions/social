import { observer } from "mobx-react-lite"
import { TextStyle, ViewStyle } from "react-native"
import { Button, Screen, Text } from "../components"
import { useStores } from "../models"
import { router } from "expo-router"
import { spacing } from "../theme"

export default observer(function HomeScreen() {
  const { authenticationStore } = useStores()

  const handleLogout = () => {
    authenticationStore.logout()
    router.replace("/")
  }

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text text="Welcome to Social!" preset="heading" style={$welcome} />

      {authenticationStore.currentUser && (
        <Text
          text={`Logged in as: ${authenticationStore.currentUser.email}`}
          preset="subheading"
          style={$userInfo}
        />
      )}

      <Button text="Logout" preset="filled" onPress={handleLogout} style={$logoutButton} />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $welcome: TextStyle = {
  marginBottom: spacing.lg,
}

const $userInfo: TextStyle = {
  marginBottom: spacing.lg,
}

const $logoutButton: ViewStyle = {
  marginTop: spacing.md,
}
