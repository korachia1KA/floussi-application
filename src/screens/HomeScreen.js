import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import SummaryHeader from '../components/SummaryHeader';
import TransactionItem from '../components/TransactionItem';
import { Users, PiggyBank, Receipt, ChevronRight } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const {
    balance,
    totalExpenses,
    transactions,
    income,
    deleteTransaction,
    totalExtraIncome,
  } = useBudget();
  const { theme } = useTheme();

  const handleLongPress = (t) => {
    Alert.alert('Action', `Gérer "${t.title}"`, [
      {
        text: 'Modifier',
        onPress: () =>
          navigation.navigate('Ajout', { transactionToEdit: t }),
      },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteTransaction(t.id),
      },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const totalIncome = income + (totalExtraIncome || 0);
  const recentTransactions = transactions.slice(0, 5);

  // Animations
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

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* ============ HEADER CLIQUABLE ============ */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => navigation.navigate('Stats')}
      >
        <SummaryHeader
          balance={balance}
          income={totalIncome}
          expenses={totalExpenses}
          theme={theme}
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============ CARTES OUTILS ============ */}
        <View style={styles.toolsRow}>
          {/* Daret */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('DaretList')}
            style={[styles.toolCard, { backgroundColor: theme.card }]}
          >
            <View
              style={[
                styles.toolIconBox,
                { backgroundColor: '#3b82f620' },
              ]}
            >
              <Users size={22} color="#3b82f6" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.toolTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                Darets
              </Text>
              <Text
                style={[styles.toolSubtitle, { color: theme.subText }]}
                numberOfLines={1}
              >
                Tontines
              </Text>
            </View>
            <ChevronRight
              size={16}
              color={theme.subText}
              strokeWidth={2.4}
            />
          </TouchableOpacity>

          {/* Sando9ti */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Sando9ti')}
            style={[styles.toolCard, { backgroundColor: theme.card }]}
          >
            <View
              style={[
                styles.toolIconBox,
                { backgroundColor: '#10b98120' },
              ]}
            >
              <PiggyBank size={22} color="#10b981" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.toolTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                Sando9ti
              </Text>
              <Text
                style={[styles.toolSubtitle, { color: theme.subText }]}
                numberOfLines={1}
              >
                Épargne
              </Text>
            </View>
            <ChevronRight
              size={16}
              color={theme.subText}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </View>

        {/* ============ SECTION OPÉRATIONS ============ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.sectionIconBox,
                { backgroundColor: theme.track || '#f3f4f6' },
              ]}
            >
              <Receipt size={16} color={theme.text} strokeWidth={2.4} />
            </View>
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.text }]}
              >
                Opérations récentes
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: theme.subText }]}
              >
                {transactions.length} opération
                {transactions.length > 1 ? 's' : ''} au total
              </Text>
            </View>
          </View>

          {transactions.length > 5 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Stats')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.seeAllText,
                  { color: theme.subText },
                ]}
              >
                Tout voir
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* État vide */}
        {transactions.length === 0 && (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: theme.card },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: theme.track || '#f3f4f6' },
              ]}
            >
              <Receipt size={28} color={theme.subText} strokeWidth={2} />
            </View>
            <Text
              style={[styles.emptyTitle, { color: theme.text }]}
            >
              Aucune opération
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.subText }]}
            >
              Appuie sur le bouton + en bas pour ajouter ta première
              dépense ou ton premier revenu.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Ajout')}
              activeOpacity={0.85}
              style={styles.emptyBtnWrapper}
            >
              <LinearGradient
                colors={['#006233', '#004d25']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Ajouter une opération</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Liste des transactions */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {recentTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              item={t}
              theme={theme}
              onLongPress={() => handleLongPress(t)}
            />
          ))}

          {transactions.length > 5 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Stats')}
              activeOpacity={0.8}
              style={[
                styles.moreBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.track || '#e5e7eb',
                },
              ]}
            >
              <Text
                style={[styles.moreBtnText, { color: theme.text }]}
              >
                Voir toutes les opérations ({transactions.length})
              </Text>
              <ChevronRight
                size={16}
                color={theme.subText}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 5 },

  /* ============ TOOLS ROW ============ */
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  toolCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  toolIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  toolSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },

  /* ============ SECTION HEADER ============ */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },

  /* ============ EMPTY STATE ============ */
  emptyState: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  emptyBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyBtn: {
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  /* ============ MORE BUTTON ============ */
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  moreBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});