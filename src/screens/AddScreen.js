import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, COLORS } from '../constants/theme';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  X,
} from 'lucide-react-native';

export default function AddScreen({ navigation, route }) {
  const { addTransaction, updateTransaction, checkBudgetAlert } = useBudget();
  const { theme } = useTheme();
  const tToEdit = route.params?.transactionToEdit;
  const isEditMode = !!tToEdit;

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [catId, setCatId] = useState('nourriture');
  const [focusedInput, setFocusedInput] = useState(null);

  const isExpense = type === 'expense';
  const accentColor = isExpense ? COLORS.danger : COLORS.success;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const amountScale = useRef(new Animated.Value(1)).current;

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

  // Animation au changement de type
  useEffect(() => {
    Animated.sequence([
      Animated.timing(amountScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(amountScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [type]);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (tToEdit) {
      setType(tToEdit.type || 'expense');
      setAmount(tToEdit.amount.toString());
      setTitle(tToEdit.title);
      setCatId(tToEdit.category);
      navigation.setOptions({ title: 'Modifier' });
    }
  }, [tToEdit]);

  const handleSave = () => {
    if (!amount || !title) {
      Alert.alert('Erreur', 'Merci de remplir le montant et le titre.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un nombre positif.');
      return;
    }

    if (isExpense) {
      const msg = checkBudgetAlert(catId, numAmount);
      if (msg) Alert.alert('Attention', msg);
    }

    const data = {
      title,
      amount: numAmount,
      category: type === 'income' ? 'revenu' : catId,
      type,
      date: tToEdit
        ? tToEdit.date
        : new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          }),
      dateISO: tToEdit ? tToEdit.dateISO : new Date().toISOString(),
    };

    if (tToEdit) updateTransaction({ ...tToEdit, ...data });
    else addTransaction({ id: Date.now(), ...data });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: theme.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ============ TOGGLE DÉPENSE / REVENU ============ */}
          <View
            style={[
              styles.toggleContainer,
              { backgroundColor: theme.track || '#f3f4f6' },
            ]}
          >
            <TouchableOpacity
              onPress={() => setType('expense')}
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                isExpense && styles.toggleBtnActive,
              ]}
            >
              <ArrowDownCircle
                size={18}
                color={isExpense ? COLORS.danger : theme.subText}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: isExpense ? COLORS.danger : theme.subText },
                  isExpense && styles.toggleTextActive,
                ]}
              >
                Dépense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setType('income')}
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                !isExpense && styles.toggleBtnActive,
              ]}
            >
              <ArrowUpCircle
                size={18}
                color={!isExpense ? COLORS.success : theme.subText}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: !isExpense ? COLORS.success : theme.subText },
                  !isExpense && styles.toggleTextActive,
                ]}
              >
                Revenu
              </Text>
            </TouchableOpacity>
          </View>

          {/* ============ MONTANT XXL ============ */}
          <Animated.View
            style={[
              styles.amountSection,
              { transform: [{ scale: amountScale }] },
            ]}
          >
            <Text style={[styles.amountLabel, { color: theme.subText }]}>
              {isExpense ? 'MONTANT DE LA DÉPENSE' : 'MONTANT DU REVENU'}
            </Text>
            <View style={styles.amountRow}>
              <TextInput
                placeholder="0"
                placeholderTextColor={accentColor + '50'}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                onFocus={() => setFocusedInput('amount')}
                onBlur={() => setFocusedInput(null)}
                style={[
                  styles.amountInput,
                  {
                    color: accentColor,
                    borderBottomColor:
                      focusedInput === 'amount'
                        ? accentColor
                        : theme.track || '#e5e7eb',
                  },
                ]}
              />
              <Text style={[styles.amountCurrency, { color: accentColor }]}>
                DH
              </Text>
            </View>
          </Animated.View>

          {/* ============ TITRE ============ */}
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.subText }]}>
              TITRE
            </Text>
            <TextInput
              placeholder="Ex : Courses du samedi"
              placeholderTextColor={theme.subText + '80'}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedInput('title')}
              onBlur={() => setFocusedInput(null)}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor:
                    focusedInput === 'title'
                      ? accentColor
                      : theme.track || '#e5e7eb',
                },
              ]}
            />
          </View>

          {/* ============ CATÉGORIES ============ */}
          {isExpense && (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.subText }]}>
                CATÉGORIE
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = catId === cat.id;
                  const CatIcon = cat.icon;

                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCatId(cat.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: isSelected
                            ? cat.color + '20'
                            : theme.card,
                          borderColor: isSelected
                            ? cat.color
                            : theme.track || '#e5e7eb',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryIconBox,
                          {
                            backgroundColor: isSelected
                              ? cat.color
                              : cat.color + '20',
                          },
                        ]}
                      >
                        {CatIcon ? (
                          <CatIcon
                            size={18}
                            color={isSelected ? '#fff' : cat.color}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Text
                            style={{
                              color: isSelected ? '#fff' : cat.color,
                              fontWeight: '900',
                            }}
                          >
                            {cat.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.categoryName,
                          {
                            color: isSelected
                              ? cat.color
                              : theme.text,
                          },
                          isSelected && styles.categoryNameActive,
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.checkBadge,
                            { backgroundColor: cat.color },
                          ]}
                        >
                          <Check size={10} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Espace pour le bouton fixe */}
          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* ============ BOUTON FIXE EN BAS ============ */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.bg,
            borderTopColor: theme.track || '#e5e7eb',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={styles.saveBtnWrapper}
        >
          <LinearGradient
            colors={
              isExpense
                ? ['#ef4444', '#dc2626']
                : ['#10b981', '#059669']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtn}
          >
            <Check size={20} color="#fff" strokeWidth={3} />
            <Text style={styles.saveBtnText}>
              {isEditMode ? 'Enregistrer' : 'Ajouter'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },

  // ============ TOGGLE ============
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  toggleTextActive: {
    fontWeight: '900',
  },

  // ============ MONTANT ============
  amountSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amountInput: {
    fontSize: 52,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -2,
    minWidth: 120,
    paddingVertical: 4,
    borderBottomWidth: 2,
  },
  amountCurrency: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // ============ CHAMPS ============
  field: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: '600',
  },

  // ============ CATÉGORIES ============
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    position: 'relative',
  },
  categoryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.2,
  },
  categoryNameActive: {
    fontWeight: '900',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ============ BOUTON FIXE ============
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  saveBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 16,
    minHeight: 56,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});