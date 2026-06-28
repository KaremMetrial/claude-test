import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radius, spacing } from '../theme'

export default function ProductCard({ product, onPress, onAdd }) {
  const { t } = useTranslation()

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} />
      {product.on_sale && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
          </Text>
        </View>
      )}
      <View style={styles.body}>
        {product.vendor && <Text style={styles.vendor}>{product.vendor.store_name}</Text>}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.price}>{product.price_formatted}</Text>
          <Text style={styles.rating}>★ {Number(product.rating).toFixed(1)}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={onAdd}>
          <Text style={styles.btnText}>{t('product.add_to_cart')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    margin: spacing(1.5),
  },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.brandLight },
  badge: {
    position: 'absolute',
    top: spacing(2),
    start: spacing(2),
    backgroundColor: colors.rose,
    borderRadius: radius.full,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  body: { padding: spacing(3) },
  vendor: { color: colors.brand, fontSize: 11, fontWeight: '600' },
  name: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2, minHeight: 38 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing(2) },
  price: { fontSize: 16, fontWeight: '800', color: colors.text },
  rating: { fontSize: 12, color: colors.amber, fontWeight: '600' },
  btn: {
    marginTop: spacing(3),
    backgroundColor: colors.brand,
    borderRadius: radius.sm,
    paddingVertical: spacing(2.5),
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
})
