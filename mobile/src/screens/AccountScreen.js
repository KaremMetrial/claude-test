import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import { LANGUAGES, setLanguage } from '../i18n'
import { useLocalization } from '../store/localization'
import { colors, spacing, radius } from '../theme'

export default function AccountScreen() {
  const { t, i18n } = useTranslation()
  const { currencies, currency, setCurrency } = useLocalization()

  const onPickLanguage = async (code) => {
    const wasRtl = i18n.dir() === 'rtl'
    await setLanguage(code)
    const isRtl = i18n.dir(code) === 'rtl'
    if (wasRtl !== isRtl) {
      Alert.alert(t('app.name'), t('account.restart_note'))
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(4) }}>
      <Text style={styles.guest}>{t('account.guest')}</Text>

      <Text style={styles.section}>{t('account.language')}</Text>
      <View style={styles.group}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.option, i18n.language === l.code && styles.optionActive]}
            onPress={() => onPickLanguage(l.code)}
          >
            <Text style={[styles.optionText, i18n.language === l.code && styles.optionTextActive]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>{t('account.currency')}</Text>
      <View style={styles.group}>
        {(currencies.length ? currencies : [{ code: 'USD', symbol: '$' }]).map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.option, currency === c.code && styles.optionActive]}
            onPress={() => setCurrency(c.code)}
          >
            <Text style={[styles.optionText, currency === c.code && styles.optionTextActive]}>
              {c.code} {c.symbol ? `(${c.symbol})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  guest: { color: colors.muted, marginBottom: spacing(4) },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: spacing(2), marginTop: spacing(2) },
  group: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  option: { paddingVertical: spacing(3.5), paddingHorizontal: spacing(4), borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  optionActive: { backgroundColor: colors.brandLight },
  optionText: { fontSize: 15, color: colors.text },
  optionTextActive: { color: colors.brand, fontWeight: '700' },
})
