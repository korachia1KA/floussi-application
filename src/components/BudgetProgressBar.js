import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

export default function BudgetProgressBar({
  categoryName,
  spent,
  limit,
  color,
  theme,
  icon,
}) {
  if (!limit || limit === 0) return null;

  const percent = Math.min((spent / limit) * 100, 100);
  const rawPercent = (spent / limit) * 100;
  const isOver = spent > limit;
  const isWarning = !isOver && rawPercent >= 80;

  // Couleur dynamique selon l'état
  const barColor = isOver
    ? COLORS.danger
    : isWarning
    ? '#f59e0b'
    : color;

  // Animation de remplissage
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const remaining = Math.max(limit - spent, 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: isOver ? COLORS.danger + '40' : 'transparent',
          borderWidth: isOver ? 1 : 0,
        },
      ]}
    >
      {/* Header : nom + montants */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconBox, { backgroundColor: barColor + '20' }]}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          )}
          <View>
            <Text style={[styles.categoryName, { color: theme.text }]}>
              {categoryName}
            </Text>
            <Text style={[styles.remainingText, { color: theme.subText }]}>
              {isOver
                ? `Dépassé de ${(spent - limit).toFixed(0)} DH`
                : `${remaining.toFixed(0)} DH restants`}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={[styles.spentText, { color: barColor }]}>
            {spent.toFixed(0)}
            <Text style={[styles.limitText, { color: theme.subText }]}>
              {' '}/ {limit} DH
            </Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: barColor + '20' }]}>
            <Text style={[styles.badgeText, { color: barColor }]}>
              {rawPercent.toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={[styles.track, { backgroundColor: theme.track || '#f3f4f6' }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animatedWidth,
              backgroundColor: barColor,
            },
          ]}
        >
          {/* Effet de brillance */}
          <View style={styles.shine} />
        </Animated.View>

        {/* Marqueur 80% */}
        {!isOver && (
          <View style={[styles.marker, { left: '80%' }]}>
            <View style={styles.markerLine} />
          </View>
        )}
      </View>

      {/* Message d'alerte si dépassement */}
      {isOver && (
        <View style={styles.alertRow}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={[styles.alertText, { color: COLORS.danger }]}>
            Limite dépassée — attention à ce poste de dépense
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // ===== Header =====
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  spentText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  limitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // ===== Barre =====
  track: {
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // Marqueur 80%
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
  },
  markerLine: {
    width: 1.5,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // ===== Alerte =====
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.15)',
  },
  alertIcon: {
    fontSize: 12,
  },
  alertText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
});