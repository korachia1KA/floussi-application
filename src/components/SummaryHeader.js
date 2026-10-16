import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useBudget } from '../context/BudgetContext';

export default function SummaryHeader({ balance, income, expenses, theme }) {
  const { user } = useBudget();
  const isOverBudget = balance < 0;

  const userName = user?.displayName
    ? user.displayName.split(' ')[0]
    : 'Amine';

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const balanceScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(balanceScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Couleurs dynamiques selon l'état
  const gradientColors = isOverBudget
    ? ['#7f1d1d', '#450a0a']
    : ['#006233', '#003d1f'];

  const accentColor = isOverBudget ? '#fca5a5' : '#4ade80';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Motifs décoratifs */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorStripe} />

        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* ============ LIGNE SALUTATION ============ */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.salamText}>Salam,</Text>
              <Text style={styles.nameText} numberOfLines={1}>
                {userName} 👋
              </Text>
            </View>

            {isOverBudget && (
              <View style={styles.alertBadge}>
                <AlertTriangle size={12} color="#dc2626" strokeWidth={2.5} />
                <Text style={styles.alertText}>Alerte</Text>
              </View>
            )}
          </View>

          {/* ============ SOLDE PRINCIPAL ============ */}
          <Animated.View
            style={[
              styles.balanceContainer,
              { transform: [{ scale: balanceScale }] },
            ]}
          >
            <View style={styles.balanceLabelRow}>
              <Wallet size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.balanceLabel}>Solde restant</Text>
            </View>
            <Text style={styles.balanceAmount} numberOfLines={1}>
              {balance.toLocaleString('fr-FR')}
              <Text style={styles.currency}> DH</Text>
            </Text>
            <View
              style={[
                styles.balanceIndicator,
                { backgroundColor: accentColor + '30' },
              ]}
            >
              <View
                style={[
                  styles.balanceDot,
                  { backgroundColor: accentColor },
                ]}
              />
              <Text style={[styles.balanceHint, { color: accentColor }]}>
                {isOverBudget ? 'Budget dépassé' : 'Tout va bien'}
              </Text>
            </View>
          </Animated.View>

          {/* ============ STATS ENTRÉES / SORTIES ============ */}
          <View style={styles.statsRow}>
            {/* Entrées */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <ArrowUpCircle size={20} color="#4ade80" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Entrées</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {income.toLocaleString('fr-FR')}
                  <Text style={styles.statUnit}> DH</Text>
                </Text>
              </View>
            </View>

            {/* Sorties */}
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <ArrowDownCircle size={20} color="#f87171" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>Sorties</Text>
                <Text style={styles.statValue} numberOfLines={1}>
                  {expenses.toLocaleString('fr-FR')}
                  <Text style={styles.statUnit}> DH</Text>
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },

  headerGradient: {
    paddingTop: 55,
    paddingBottom: 28,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },

  // ============ MOTIFS DÉCORATIFS ============
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  decorStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#c1272d',
    opacity: 0.9,
  },

  headerContent: {
    paddingHorizontal: 22,
  },

  // ============ LIGNE SALUTATION ============
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  salamText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  nameText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },

  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  alertText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // ============ SOLDE ============
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  currency: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0,
  },
  balanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  balanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  balanceHint: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ============ STATS ============
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 10,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
  },
});