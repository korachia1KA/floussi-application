import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  HelpCircle,
  PiggyBank,
} from 'lucide-react-native';

export default function TransactionItem({ item, theme, onLongPress }) {
  const { allCategories } = useBudget();

  // Recherche de la catégorie
  const categoryDef = allCategories.find((c) => c.id === item.category);

  // --- CONFIGURATION PAR DÉFAUT ---
  let IconComponent = categoryDef?.icon || HelpCircle;
  let iconColor = categoryDef?.color || theme.text;
  let iconBg = categoryDef?.bg || theme.track || '#f3f4f6';
  let categoryName = categoryDef?.name || 'Autre';

  // --- RÈGLES SPÉCIALES ---
  // 1. CAS DARET
  if (item.category === 'daret') {
    categoryName = 'Daret';
    if (item.type === 'expense') {
      IconComponent = ArrowDownCircle;
      iconColor = '#ef4444';
      iconBg = '#fee2e2';
    } else {
      IconComponent = ArrowUpCircle;
      iconColor = '#10b981';
      iconBg = '#d1fae5';
    }
  }
  // 2. CAS SANDO9TI (ÉPARGNE)
  else if (item.category === 'epargne') {
    categoryName = 'Sando9ti';
    IconComponent = PiggyBank;
    iconColor = '#10b981';
    iconBg = '#d1fae5';
  }
  // 3. CAS REVENU GÉNÉRAL
  else if (item.type === 'income' && !categoryDef) {
    categoryName = 'Revenu';
    IconComponent = ArrowUpCircle;
    iconColor = '#10b981';
    iconBg = '#d1fae5';
  }

  const isExpense = item.type === 'expense';
  const amountColor = isExpense ? theme.text : '#10b981';
  const borderLeftColor = isExpense ? '#ef4444' : '#10b981';

  // --- GESTION DE LA DATE ---
  let dateObj = new Date(item.date || item.dateISO);
  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }
  const displayDate = dateObj.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

  // Animation au tap
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.container,
          {
            backgroundColor: theme.card,
            borderLeftColor,
          },
        ]}
        activeOpacity={1}
      >
        {/* Icône */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <IconComponent size={22} color={iconColor} strokeWidth={2.4} />
        </View>

        {/* Contenu central */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.subText }]}>
              {displayDate}
            </Text>
            <View
              style={[
                styles.metaDot,
                { backgroundColor: theme.subText + '60' },
              ]}
            />
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: iconBg },
              ]}
            >
              <Text style={[styles.categoryText, { color: iconColor }]}>
                {categoryName}
              </Text>
            </View>
          </View>
        </View>

        {/* Montant */}
        <View style={styles.amountBox}>
          <Text style={[styles.amountSign, { color: amountColor }]}>
            {isExpense ? '−' : '+'}
          </Text>
          <Text style={[styles.amountValue, { color: amountColor }]}>
            {item.amount.toLocaleString('fr-FR')}
          </Text>
          <Text style={[styles.amountUnit, { color: theme.subText }]}>
            DH
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 14,
    marginBottom: 8,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  amountSign: {
    fontSize: 14,
    fontWeight: '900',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  amountUnit: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 2,
  },
});