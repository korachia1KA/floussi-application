import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-chart-kit';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  PieChart as PieIcon,
  Target,
  Sparkles,
} from 'lucide-react-native';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import BudgetProgressBar from '../components/BudgetProgressBar';

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { transactions, categoryLimits, allCategories } = useBudget();
  const { theme } = useTheme();

  const [dateA, setDateA] = useState(new Date());
  const [dateB, setDateB] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [isCompareMode, setIsCompareMode] = useState(false);

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

  const changeDate = (isDateA, direction) => {
    const targetDate = isDateA ? dateA : dateB;
    const setTargetDate = isDateA ? setDateA : setDateB;
    const newDate = new Date(targetDate);
    newDate.setMonth(targetDate.getMonth() + direction);
    setTargetDate(newDate);
  };

  const formatDate = (date) =>
    `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  /* ============================================================
     CALCUL NET (dépenses - retraits épargne/daret)
     ============================================================ */
  const getSpendingMap = (date) => {
    const map = {};
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    transactions.forEach((t) => {
      let d = new Date(t.date || t.dateISO || new Date());
      if (isNaN(d.getTime())) d = new Date();

      if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
        if (t.type === 'expense') {
          map[t.category] = (map[t.category] || 0) + parseFloat(t.amount);
        } else if (
          t.type === 'income' &&
          (t.category === 'epargne' || t.category === 'daret')
        ) {
          map[t.category] = (map[t.category] || 0) - parseFloat(t.amount);
        }
      }
    });

    Object.keys(map).forEach((key) => {
      if (map[key] < 0) map[key] = 0;
    });

    return map;
  };

  const spendingMapA = useMemo(
    () => getSpendingMap(dateA),
    [transactions, dateA]
  );
  const spendingMapB = useMemo(
    () => getSpendingMap(dateB),
    [transactions, dateB]
  );

  const totalA = Object.values(spendingMapA).reduce((a, b) => a + b, 0);
  const totalB = Object.values(spendingMapB).reduce((a, b) => a + b, 0);
  const diff = totalA - totalB;
  const isSavings = diff < 0;
  const diffPercent = totalB > 0 ? (Math.abs(diff) / totalB) * 100 : 0;

  const chartData = useMemo(() => {
    return Object.keys(spendingMapA)
      .map((catId) => {
        if (spendingMapA[catId] <= 0) return null;

        let cat = allCategories.find((c) => c.id === catId);

        if (catId === 'epargne')
          cat = { name: 'Sando9ti', color: '#10b981' };
        if (catId === 'daret')
          cat = { name: 'Daret', color: '#0891b2' };

        const finalName = cat ? cat.name : 'Autre';
        const finalColor = cat ? cat.color : '#9ca3af';

        return {
          name: finalName,
          population: spendingMapA[catId],
          color: finalColor,
          legendFontColor: theme.subText,
          legendFontSize: 11,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.population - a.population);
  }, [spendingMapA, allCategories, theme]);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ============ HEADER ============ */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            backgroundColor: theme.card,
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Ligne titre + toggle */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleLeft}>
            <View
              style={[
                styles.headerIconBox,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Sparkles
                size={16}
                color={COLORS.primary}
                strokeWidth={2.4}
              />
            </View>
            <View>
              <Text
                style={[styles.headerTitle, { color: theme.text }]}
              >
                {isCompareMode ? 'Comparateur' : 'Historique'}
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.subText }]}
              >
                {isCompareMode
                  ? 'Compare deux mois'
                  : 'Analyse tes dépenses'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsCompareMode(!isCompareMode)}
            activeOpacity={0.85}
            style={[
              styles.compareToggle,
              {
                backgroundColor: isCompareMode
                  ? COLORS.primary
                  : theme.bg,
                borderColor: isCompareMode
                  ? COLORS.primary
                  : theme.track || '#e5e7eb',
              },
            ]}
          >
            <ArrowRightLeft
              size={16}
              color={isCompareMode ? '#fff' : theme.text}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {/* Sélecteur mois A */}
        <MonthSelector
          date={dateA}
          onChange={(dir) => changeDate(true, dir)}
          theme={theme}
          label={isCompareMode ? 'Mois A (Actuel)' : 'Mois sélectionné'}
        />

        {/* Sélecteur mois B (comparaison) */}
        {isCompareMode && (
          <View
            style={[
              styles.secondarySelector,
              { borderTopColor: theme.track || '#e5e7eb' },
            ]}
          >
            <MonthSelector
              date={dateB}
              onChange={(dir) => changeDate(false, dir)}
              theme={theme}
              label="Mois B (Référence)"
              isSecondary
            />
          </View>
        )}

        {/* Solde principal (mode simple) */}
        {!isCompareMode && (
          <View style={styles.totalWrapper}>
            <Text
              style={[styles.totalLabel, { color: theme.subText }]}
            >
              TOTAL DÉPENSÉ
            </Text>
            <Text style={styles.totalAmount}>
              {totalA.toLocaleString('fr-FR')}
              <Text style={styles.totalCurrency}> DH</Text>
            </Text>
          </View>
        )}

        {/* Mode comparaison : afficher les 2 totaux côte à côte */}
        {isCompareMode && (
          <View style={styles.compareTotalsRow}>
            <View style={styles.compareTotalItem}>
              <Text
                style={[styles.compareTotalLabel, { color: theme.subText }]}
              >
                MOIS A
              </Text>
              <Text
                style={[styles.compareTotalValue, { color: theme.text }]}
                numberOfLines={1}
              >
                {totalA.toLocaleString('fr-FR')}
              </Text>
            </View>

            <View style={styles.compareTotalDivider} />

            <View style={styles.compareTotalItem}>
              <Text
                style={[styles.compareTotalLabel, { color: theme.subText }]}
              >
                MOIS B
              </Text>
              <Text
                style={[styles.compareTotalValue, { color: theme.text }]}
                numberOfLines={1}
              >
                {totalB.toLocaleString('fr-FR')}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>

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
          {isCompareMode ? (
            /* ============ MODE COMPARAISON ============ */
            <>
              {/* Carte différence */}
              <View
                style={[
                  styles.diffCard,
                  {
                    backgroundColor: theme.card,
                    borderColor:
                      diff === 0
                        ? theme.track
                        : isSavings
                        ? '#10b98140'
                        : '#ef444440',
                  },
                ]}
              >
                <View style={styles.diffHeader}>
                  <View
                    style={[
                      styles.diffIconBox,
                      {
                        backgroundColor:
                          diff === 0
                            ? theme.track + '40'
                            : isSavings
                            ? '#10b98120'
                            : '#ef444420',
                      },
                    ]}
                  >
                    {diff === 0 ? (
                      <Minus
                        size={22}
                        color={theme.subText}
                        strokeWidth={2.4}
                      />
                    ) : isSavings ? (
                      <TrendingDown
                        size={22}
                        color="#10b981"
                        strokeWidth={2.4}
                      />
                    ) : (
                      <TrendingUp
                        size={22}
                        color="#ef4444"
                        strokeWidth={2.4}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.diffLabel,
                        { color: theme.subText },
                      ]}
                    >
                      DIFFÉRENCE
                    </Text>
                    <Text
                      style={[
                        styles.diffValue,
                        {
                          color:
                            diff === 0
                              ? theme.text
                              : isSavings
                              ? '#10b981'
                              : '#ef4444',
                        },
                      ]}
                    >
                      {isSavings ? '−' : '+'}
                      {Math.abs(diff).toLocaleString('fr-FR')}
                      <Text style={styles.diffCurrency}> DH</Text>
                    </Text>
                  </View>

                  {diffPercent > 0 && (
                    <View
                      style={[
                        styles.diffPercentBadge,
                        {
                          backgroundColor:
                            isSavings
                              ? '#10b98120'
                              : '#ef444420',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffPercentText,
                          {
                            color: isSavings
                              ? '#10b981'
                              : '#ef4444',
                          },
                        ]}
                      >
                        {diffPercent.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.diffHint,
                    { backgroundColor: theme.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.diffHintText,
                      { color: theme.subText },
                    ]}
                  >
                    {diff === 0
                      ? 'Même montant dépensé sur les deux mois.'
                      : isSavings
                      ? `Tu as dépensé ${Math.abs(
                          diff
                        ).toLocaleString('fr-FR')} DH de moins qu'en ${formatDate(
                          dateB
                        )}.`
                      : `Tu as dépensé ${Math.abs(
                          diff
                        ).toLocaleString('fr-FR')} DH de plus qu'en ${formatDate(
                          dateB
                        )}.`}
                  </Text>
                </View>
              </View>

              {/* Carte détail par mois */}
              <View
                style={[
                  styles.compareDetailCard,
                  { backgroundColor: theme.card },
                ]}
              >
                <View style={styles.compareDetailRow}>
                  <View style={styles.compareDetailItem}>
                    <View style={styles.compareDetailHeader}>
                      <View
                        style={[
                          styles.compareDetailDot,
                          { backgroundColor: COLORS.primary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.compareDetailLabel,
                          { color: theme.subText },
                        ]}
                      >
                        {formatDate(dateA)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.compareDetailValue,
                        { color: theme.text },
                      ]}
                    >
                      {totalA.toLocaleString('fr-FR')}
                      <Text style={styles.compareDetailUnit}> DH</Text>
                    </Text>
                  </View>

                  <View style={styles.compareDetailItem}>
                    <View style={styles.compareDetailHeader}>
                      <View
                        style={[
                          styles.compareDetailDot,
                          { backgroundColor: '#9ca3af' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.compareDetailLabel,
                          { color: theme.subText },
                        ]}
                      >
                        {formatDate(dateB)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.compareDetailValue,
                        { color: theme.text },
                      ]}
                    >
                      {totalB.toLocaleString('fr-FR')}
                      <Text style={styles.compareDetailUnit}> DH</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            /* ============ MODE SIMPLE ============ */
            <>
              {/* Section titre */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.sectionIconBox,
                      { backgroundColor: COLORS.primary + '15' },
                    ]}
                  >
                    <PieIcon
                      size={15}
                      color={COLORS.primary}
                      strokeWidth={2.4}
                    />
                  </View>
                  <Text
                    style={[styles.sectionTitle, { color: theme.text }]}
                  >
                    Répartition (Net)
                  </Text>
                </View>
              </View>

              {/* Pie chart */}
              <View
                style={[
                  styles.chartCard,
                  { backgroundColor: theme.card },
                ]}
              >
                {chartData.length > 0 ? (
                  <>
                    <PieChart
                      data={chartData}
                      width={screenWidth - 60}
                      height={220}
                      chartConfig={{ color: () => COLORS.primary }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      absolute
                    />
                    {/* Résumé sous le graphique */}
                    <View
                      style={[
                        styles.chartSummary,
                        { borderTopColor: theme.track || '#e5e7eb' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chartSummaryLabel,
                          { color: theme.subText },
                        ]}
                      >
                        {chartData.length} catégorie
                        {chartData.length > 1 ? 's' : ''} ce mois
                      </Text>
                      <Text
                        style={[
                          styles.chartSummaryValue,
                          { color: COLORS.primary },
                        ]}
                      >
                        {totalA.toLocaleString('fr-FR')} DH
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyChart}>
                    <View
                      style={[
                        styles.emptyChartIconBox,
                        { backgroundColor: theme.track || '#f3f4f6' },
                      ]}
                    >
                      <PieIcon
                        size={26}
                        color={theme.subText}
                        strokeWidth={2}
                      />
                    </View>
                    <Text
                      style={[
                        styles.emptyChartText,
                        { color: theme.subText },
                      ]}
                    >
                      Aucune dépense nette ce mois-ci.
                    </Text>
                  </View>
                )}
              </View>

              {/* Section Budget */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View
                    style={[
                      styles.sectionIconBox,
                      { backgroundColor: '#fbbf2415' },
                    ]}
                  >
                    <Target
                      size={15}
                      color="#fbbf24"
                      strokeWidth={2.4}
                    />
                  </View>
                  <Text
                    style={[styles.sectionTitle, { color: theme.text }]}
                  >
                    Objectifs vs Réalité
                  </Text>
                </View>
              </View>

              {allCategories.map((cat) => {
                const spent = spendingMapA[cat.id] || 0;
                const limit =
                  categoryLimits[cat.id] || cat.defaultLimit || 0;

                return (
                  <BudgetProgressBar
                    key={cat.id}
                    categoryName={cat.name}
                    icon={cat.icon ? undefined : cat.name.charAt(0)}
                    spent={spent}
                    limit={limit}
                    color={cat.color || COLORS.primary}
                    theme={theme}
                  />
                );
              })}
            </>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   SÉLECTEUR DE MOIS
   ============================================================ */
const MonthSelector = ({ date, onChange, theme, label, isSecondary }) => (
  <View
    style={[
      styles.monthSelector,
      isSecondary && { opacity: 0.9 },
    ]}
  >
    <TouchableOpacity
      onPress={() => onChange(-1)}
      style={[
        styles.arrowBtn,
        { backgroundColor: theme.bg },
      ]}
      activeOpacity={0.7}
    >
      <ChevronLeft color={theme.text} size={20} strokeWidth={2.4} />
    </TouchableOpacity>

    <View style={styles.monthCenter}>
      <Text
        style={[styles.monthLabel, { color: theme.subText }]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.monthValue,
          {
            color: isSecondary ? theme.text : COLORS.primary,
          },
        ]}
      >
        {MONTHS[date.getMonth()]} {date.getFullYear()}
      </Text>
    </View>

    <TouchableOpacity
      onPress={() => onChange(1)}
      style={[
        styles.arrowBtn,
        { backgroundColor: theme.bg },
      ]}
      activeOpacity={0.7}
    >
      <ChevronRight color={theme.text} size={20} strokeWidth={2.4} />
    </TouchableOpacity>
  </View>
);

/* ============================================================
   STYLES
   ============================================================ */
const styles = StyleSheet.create({
  root: { flex: 1 },

  /* ============ HEADER ============ */
  headerContainer: {
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 56,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  compareToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },

  /* ============ MONTH SELECTOR ============ */
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCenter: {
    alignItems: 'center',
    flex: 1,
  },
  monthLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  monthValue: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  secondarySelector: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },

  /* ============ TOTAL (mode simple) ============ */
  totalWrapper: {
    alignItems: 'center',
    marginTop: 18,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: COLORS.primary,
  },
  totalCurrency: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    opacity: 0.75,
  },

  /* ============ COMPARE TOTALS (mode compare) ============ */
  compareTotalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  compareTotalItem: {
    flex: 1,
    alignItems: 'center',
  },
  compareTotalLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  compareTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  compareTotalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  /* ============ SCROLL ============ */
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  /* ============ DIFF CARD (compare mode) ============ */
  diffCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  diffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  diffIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 3,
  },
  diffValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  diffCurrency: {
    fontSize: 14,
    fontWeight: '800',
    opacity: 0.7,
  },
  diffPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  diffPercentText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  diffHint: {
    padding: 12,
    borderRadius: 12,
  },
  diffHintText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },

  /* ============ COMPARE DETAIL ============ */
  compareDetailCard: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  compareDetailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  compareDetailItem: {
    flex: 1,
  },
  compareDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  compareDetailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compareDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  compareDetailValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  compareDetailUnit: {
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.6,
  },

  /* ============ SECTION ============ */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  /* ============ CHART ============ */
  chartCard: {
    borderRadius: 20,
    padding: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 22,
    alignItems: 'center',
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    width: '100%',
    marginTop: 6,
  },
  chartSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartSummaryValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  emptyChart: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyChartIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});