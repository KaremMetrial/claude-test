import { Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTranslation } from 'react-i18next'

import HomeScreen from '../screens/HomeScreen'
import ProductScreen from '../screens/ProductScreen'
import CartScreen from '../screens/CartScreen'
import AccountScreen from '../screens/AccountScreen'
import { useCart } from '../store/cart'
import { colors } from '../theme'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const screenHeader = {
  headerStyle: { backgroundColor: colors.brand },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '800' },
}

function HomeStack() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator screenOptions={screenHeader}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('app.name') }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ title: '' }} />
    </Stack.Navigator>
  )
}

// Simple emoji icons keep the app dependency-free (swap for vector icons later).
function tabIcon(emoji) {
  return ({ color }) => <Text style={{ fontSize: 20, color }}>{emoji}</Text>
}

export default function RootNavigator() {
  const { t } = useTranslation()
  const count = useCart((s) => s.cart?.item_count ?? 0)

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        ...screenHeader,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ headerShown: false, title: t('tabs.home'), tabBarIcon: tabIcon('🏠') }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: t('tabs.cart'),
          tabBarIcon: tabIcon('🛒'),
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ title: t('tabs.account'), tabBarIcon: tabIcon('👤') }}
      />
    </Tab.Navigator>
  )
}
