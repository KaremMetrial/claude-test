import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

import './src/i18n'
import { restoreLanguage } from './src/i18n'
import { hydrateClient } from './src/api/client'
import { useCart } from './src/store/cart'
import { useLocalization } from './src/store/localization'
import RootNavigator from './src/navigation'
import { colors } from './src/theme'

export default function App() {
  const [ready, setReady] = useState(false)
  const fetchCart = useCart((s) => s.fetch)
  const loadLocalization = useLocalization((s) => s.load)

  useEffect(() => {
    ;(async () => {
      await hydrateClient()
      await restoreLanguage()
      await loadLocalization()
      await fetchCart().catch(() => {})
      setReady(true)
    })()
  }, [fetchCart, loadLocalization])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
