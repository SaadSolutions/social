// File: /complete social/social/src/app/_layout.tsx
import { useEffect, useState } from "react"
import { Slot, SplashScreen } from "expo-router"
import { KeyboardProvider } from "react-native-keyboard-controller"

import { useInitialRootStore } from "../models"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { customFontsToLoad } from "../theme"
import { initI18n } from "../i18n"
import { loadDateFnsLocale } from "../utils/formatDate"
import { useThemeProvider } from "../utils/useAppTheme"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  require("src/devtools/ReactotronConfig.ts")
}

export { ErrorBoundary } from "../components/ErrorBoundary/ErrorBoundary"

export default function Root() {
  const { rehydrated } = useInitialRootStore()
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const { themeScheme, setThemeContextOverride, ThemeProvider } = useThemeProvider()

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = fontsLoaded && isI18nInitialized && rehydrated

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <KeyboardProvider>
        <Slot />
      </KeyboardProvider>
    </ThemeProvider>
  )
}
