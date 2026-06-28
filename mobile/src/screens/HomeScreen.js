import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { useCart } from '../store/cart'
import { useLocalization } from '../store/localization'
import { colors, spacing, radius } from '../theme'

export default function HomeScreen({ navigation }) {
  const { t, i18n } = useTranslation()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const add = useCart((s) => s.add)
  const currency = useLocalization((s) => s.currency)

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      api.get('/products', { params: { featured: 1, per_page: 10 } }),
      api.get('/categories'),
    ])
    setFeatured(p.data.data)
    setCategories(c.data.data)
  }, [])

  useEffect(() => {
    load()
  }, [load, i18n.language, currency])

  const onRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <FlatList
      data={featured}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      contentContainerStyle={{ padding: spacing(2), backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hero}>
            <Text style={styles.heroText}>{t('home.hero')}</Text>
          </View>

          <Text style={styles.section}>{t('home.categories')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing(2) }}>
            {categories.map((c) => (
              <TouchableOpacity key={c.id} style={styles.chip}>
                <Text style={styles.chipText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.section}>{t('home.featured')}</Text>
        </View>
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => navigation.navigate('Product', { slug: item.slug })}
          onAdd={() => add(item.id, 1)}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.brand,
    borderRadius: radius.lg,
    padding: spacing(5),
    marginBottom: spacing(4),
  },
  heroText: { color: colors.white, fontSize: 22, fontWeight: '800' },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing(2), marginHorizontal: spacing(1.5) },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    marginHorizontal: spacing(1.5),
  },
  chipText: { color: colors.text, fontWeight: '600' },
})
