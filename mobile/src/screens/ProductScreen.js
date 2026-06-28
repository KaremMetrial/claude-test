import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'

import api from '../api/client'
import { useCart } from '../store/cart'
import { useLocalization } from '../store/localization'
import { colors, spacing, radius } from '../theme'

export default function ProductScreen({ route, navigation }) {
  const { slug } = route.params
  const { t, i18n } = useTranslation()
  const [product, setProduct] = useState(null)
  const add = useCart((s) => s.add)
  const currency = useLocalization((s) => s.currency)

  useEffect(() => {
    let active = true
    api.get(`/products/${slug}`).then(({ data }) => active && setProduct(data.data))
    return () => {
      active = false
    }
  }, [slug, i18n.language, currency])

  if (!product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    )
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }}>
      <Image source={{ uri: product.images?.[0]?.url || product.thumbnail }} style={styles.hero} />

      <View style={styles.body}>
        {product.vendor && (
          <Text style={styles.vendor}>
            {t('product.sold_by')} {product.vendor.store_name}
          </Text>
        )}
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>{product.price_formatted}</Text>
          {product.on_sale && <Text style={styles.compare}>{product.compare_at_price_formatted}</Text>}
        </View>

        <Text style={[styles.stock, { color: product.in_stock ? colors.success : colors.rose }]}>
          ● {product.in_stock ? t('product.in_stock') : t('product.out_of_stock')}
        </Text>

        {product.description ? (
          <View style={{ marginTop: spacing(5) }}>
            <Text style={styles.sectionTitle}>{t('product.description')}</Text>
            <Text style={styles.desc}>{product.description}</Text>
          </View>
        ) : null}

        {product.reviews?.length > 0 && (
          <View style={{ marginTop: spacing(6) }}>
            <Text style={styles.sectionTitle}>{t('product.reviews')}</Text>
            {product.reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <Text style={styles.reviewAuthor}>
                  {r.author} · {'★'.repeat(r.rating)}
                </Text>
                {r.body ? <Text style={styles.reviewBody}>{r.body}</Text> : null}
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.cta}
        disabled={!product.in_stock}
        onPress={async () => {
          await add(product.id, 1)
          navigation.navigate('CartTab')
        }}
      >
        <Text style={styles.ctaText}>{t('product.add_to_cart')}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  hero: { width: '100%', aspectRatio: 1, backgroundColor: colors.brandLight },
  body: { padding: spacing(4) },
  vendor: { color: colors.brand, fontWeight: '600' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing(1) },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing(2), marginTop: spacing(3) },
  price: { fontSize: 26, fontWeight: '800', color: colors.text },
  compare: { fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },
  stock: { marginTop: spacing(2), fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing(2) },
  desc: { color: colors.muted, lineHeight: 22 },
  review: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing(3), marginBottom: spacing(2), borderWidth: 1, borderColor: colors.border },
  reviewAuthor: { fontWeight: '600', color: colors.text },
  reviewBody: { color: colors.muted, marginTop: spacing(1) },
  cta: { backgroundColor: colors.brand, margin: spacing(4), borderRadius: radius.md, paddingVertical: spacing(4), alignItems: 'center' },
  ctaText: { color: colors.white, fontWeight: '800', fontSize: 16 },
})
