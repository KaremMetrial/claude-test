import { useEffect } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useCart } from '../store/cart'
import { colors, spacing, radius } from '../theme'

export default function CartScreen() {
  const { t } = useTranslation()
  const { cart, fetch, updateItem, remove } = useCart()

  useEffect(() => {
    fetch()
  }, [fetch])

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('cart.empty')}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: spacing(3) }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={{ flex: 1, marginHorizontal: spacing(3) }}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.line}>
                {cart.currency} {item.line_total}
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItem(item.id, Math.max(1, item.quantity - 1))}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateItem(item.id, item.quantity + 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)} style={{ marginStart: spacing(4) }}>
                  <Text style={styles.remove}>{t('cart.remove')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>{t('cart.subtotal')}</Text>
          <Text style={styles.subtotalValue}>{cart?.subtotal_formatted}</Text>
        </View>
        <TouchableOpacity style={styles.checkout}>
          <Text style={styles.checkoutText}>{t('cart.checkout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  empty: { color: colors.muted, fontSize: 16 },
  item: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing(3), marginBottom: spacing(3), borderWidth: 1, borderColor: colors.border },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.brandLight },
  name: { fontWeight: '600', color: colors.text },
  line: { color: colors.muted, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) },
  qtyBtn: { width: 30, height: 30, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: colors.text },
  qty: { marginHorizontal: spacing(3), fontWeight: '700', color: colors.text },
  remove: { color: colors.rose, fontWeight: '600' },
  footer: { backgroundColor: colors.white, padding: spacing(4), borderTopWidth: 1, borderTopColor: colors.border },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(3) },
  subtotalLabel: { fontSize: 16, color: colors.muted },
  subtotalValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  checkout: { backgroundColor: colors.brand, borderRadius: radius.md, paddingVertical: spacing(4), alignItems: 'center' },
  checkoutText: { color: colors.white, fontWeight: '800', fontSize: 16 },
})
