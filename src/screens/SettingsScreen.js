import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FileText,
  Bell,
  Globe,
  Save,
  Banknote,
  DollarSign,
  Moon,
  Sun,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { COLORS, CATEGORIES } from '../constants/theme';
import { generatePDF, scheduleReminder, fetchRates } from '../utils/helpers';

export default function SettingsScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const {
    income,
    updateMonthlyIncome,
    categoryLimits,
    setLimitForCategory,
    transactions,
  } = useBudget();

  const [salaryInput, setSalaryInput] = useState('');
  const [euroRate, setEuroRate] = useState(10.7);
  const [usdRate, setUsdRate] = useState(10.0);
  const [focusedInput, setFocusedInput] = useState(null);
  const [savingSalary, setSavingSalary] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (income) setSalaryInput(income.toString());

    fetchRates().then((rates) => {
      if (rates) {
        setEuroRate(rates.EUR);
        setUsdRate(rates.USD);
      }
    });
  }, [income]);

  const handleSaveSalary = async () => {
    setSavingSalary(true);
    await updateMonthlyIncome(salaryInput);
    setSavingSalary(false);
    Alert.alert('Succès', 'Ton revenu mensuel a été mis à jour.');
  };

  const handleExportPDF = async () => {
    try {
      await generatePDF(transactions);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'exporter le PDF.");
    }
  };

  const handleScheduleReminder = async () => {
    try {
      await scheduleReminder();
      Alert.alert('Succès', 'Rappel programmé !');
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de programmer le rappel.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Réglages
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.subText }]}
              >
                Personnalise ton expérience
              </Text>
            </View>
          </View>

          {/* ============ SECTION PRÉFÉRENCES ============ */}
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconBox,
                { backgroundColor: '#3b82f615' },
              ]}
            >
              <Sparkles size={15} color="#3b82f6" strokeWidth={2.4} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Préférences
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {/* Mode sombre */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIconBox,
                    { backgroundColor: '#8b5cf615' },
                  ]}
                >
                  {isDarkMode ? (
                    <Moon size={16} color="#8b5cf6" strokeWidth={2.4} />
                  ) : (
                    <Sun size={16} color="#8b5cf6" strokeWidth={2.4} />
                  )}
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Mode sombre
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.subText }]}
                  >
                    {isDarkMode ? 'Activé' : 'Désactivé'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d1d5db', true: COLORS.primary + '80' }}
                thumbColor={isDarkMode ? COLORS.primary : '#f4f3f4'}
                ios_backgroundColor="#d1d5db"
              />
            </View>

            {/* Export PDF */}
            <TouchableOpacity
              onPress={handleExportPDF}
              activeOpacity={0.7}
              style={styles.row}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIconBox,
                    { backgroundColor: '#22c55e15' },
                  ]}
                >
                  <FileText size={16} color="#22c55e" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Exporter en PDF
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.subText }]}
                  >
                    Télécharge l'historique de tes transactions
                  </Text>
                </View>
              </View>
              <CheckCircle2
                size={16}
                color={theme.subText}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            {/* Rappel */}
            <TouchableOpacity
              onPress={handleScheduleReminder}
              activeOpacity={0.7}
              style={[styles.row, styles.rowLast]}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIconBox,
                    { backgroundColor: '#eab30815' },
                  ]}
                >
                  <Bell size={16} color="#eab308" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Programmer un rappel
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.subText }]}
                  >
                    Reçois une notification mensuelle
                  </Text>
                </View>
              </View>
              <CheckCircle2
                size={16}
                color={theme.subText}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          </View>

          {/* ============ SECTION DEVISES ============ */}
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconBox,
                { backgroundColor: '#00623315' },
              ]}
            >
              <Globe size={15} color={COLORS.primary} strokeWidth={2.4} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Taux de change
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIconBox,
                    { backgroundColor: '#3b82f615' },
                  ]}
                >
                  <Text style={styles.euroSymbol}>€</Text>
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Euro
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.subText }]}
                  >
                    1 EUR = {euroRate.toFixed(2)} DH
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.rateBadge,
                  { backgroundColor: '#3b82f615' },
                ]}
              >
                <Text
                  style={[styles.rateBadgeText, { color: '#3b82f6' }]}
                >
                  {euroRate.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={[styles.row, styles.rowLast]}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.rowIconBox,
                    { backgroundColor: '#16a34a15' },
                  ]}
                >
                  <DollarSign size={16} color="#16a34a" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>
                    Dollar
                  </Text>
                  <Text
                    style={[styles.rowSubtitle, { color: theme.subText }]}
                  >
                    1 USD = {usdRate.toFixed(2)} DH
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.rateBadge,
                  { backgroundColor: '#16a34a15' },
                ]}
              >
                <Text
                  style={[styles.rateBadgeText, { color: '#16a34a' }]}
                >
                  {usdRate.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* ============ SECTION REVENU ============ */}
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconBox,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Banknote size={15} color={COLORS.primary} strokeWidth={2.4} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mon revenu mensuel
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.inputLabel, { color: theme.subText }]}>
              REVENU FIXE (DH)
            </Text>

            <View style={styles.salaryRow}>
              <TextInput
                value={salaryInput}
                onChangeText={setSalaryInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.subText + '80'}
                onFocus={() => setFocusedInput('salary')}
                onBlur={() => setFocusedInput(null)}
                style={[
                  styles.salaryInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.bg,
                    borderColor:
                      focusedInput === 'salary'
                        ? COLORS.primary
                        : theme.track || '#e5e7eb',
                  },
                ]}
              />

              <TouchableOpacity
                onPress={handleSaveSalary}
                disabled={savingSalary}
                activeOpacity={0.85}
                style={styles.saveBtnWrapper}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveBtn}
                >
                  <Save size={18} color="#fff" strokeWidth={2.6} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.hintBox,
                { backgroundColor: COLORS.primary + '10' },
              ]}
            >
              <TrendingUp
                size={13}
                color={COLORS.primary}
                strokeWidth={2.4}
              />
              <Text
                style={[styles.hintText, { color: COLORS.primary }]}
              >
                Ce montant est utilisé pour calculer ton solde disponible
              </Text>
            </View>
          </View>

          {/* ============ SECTION OBJECTIFS ============ */}
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconBox,
                { backgroundColor: '#fbbf2415' },
              ]}
            >
              <Shield size={15} color="#fbbf24" strokeWidth={2.4} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Objectifs de budget
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]}>
            {CATEGORIES.map((cat, index) => {
              const isLast = index === CATEGORIES.length - 1;
              const hasLimit = categoryLimits[cat.id] > 0;

              return (
                <View
                  key={cat.id}
                  style={[
                    styles.limitRow,
                    isLast && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.limitLeft}>
                    {cat.icon ? (
                      <View
                        style={[
                          styles.rowIconBox,
                          {
                            backgroundColor:
                              (cat.color || COLORS.primary) + '15',
                          },
                        ]}
                      >
                        <cat.icon
                          size={16}
                          color={cat.color || COLORS.primary}
                          strokeWidth={2.4}
                        />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.rowIconBox,
                          { backgroundColor: COLORS.primary + '15' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.limitInitial,
                            { color: COLORS.primary },
                          ]}
                        >
                          {cat.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text
                        style={[styles.rowTitle, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                      <Text
                        style={[
                          styles.rowSubtitle,
                          { color: theme.subText },
                        ]}
                      >
                        {hasLimit
                          ? `Limite : ${categoryLimits[cat.id]} DH`
                          : 'Aucune limite'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.limitInputWrapper}>
                    <TextInput
                      defaultValue={
                        categoryLimits[cat.id]?.toString() || ''
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.subText + '80'}
                      onEndEditing={(e) =>
                        setLimitForCategory(
                          cat.id,
                          e.nativeEvent.text
                        )
                      }
                      style={[
                        styles.limitInput,
                        {
                          color: theme.text,
                          backgroundColor: theme.bg,
                          borderColor: theme.track || '#e5e7eb',
                        },
                      ]}
                    />
                    <Text
                      style={[styles.limitUnit, { color: theme.subText }]}
                    >
                      DH
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 20
        : 60,
    paddingHorizontal: 20,
  },

  /* ============ HEADER ============ */
  header: { marginBottom: 22 },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },

  /* ============ SECTION ============ */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionIconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  /* ============ CARD ============ */
  card: {
    borderRadius: 18,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  /* ============ ROW ============ */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  /* ============ RATE BADGE ============ */
  rateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rateBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  euroSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3b82f6',
  },

  /* ============ SALARY INPUT ============ */
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  salaryInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  saveBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtn: {
    width: 54,
    height: '100%',
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },

  /* ============ LIMITS ============ */
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 10,
  },
  limitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  limitInitial: {
    fontSize: 15,
    fontWeight: '900',
  },
  limitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
    minWidth: 80,
  },
  limitUnit: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});