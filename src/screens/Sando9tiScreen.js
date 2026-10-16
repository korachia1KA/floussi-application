import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { COLORS } from '../constants/theme';
import {
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Trash2,
  X,
  Trophy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react-native';

export default function Sando9tiScreen({ navigation }) {
  const { theme } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal, addTransaction } =
    useBudget();

  const [modalType, setModalType] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [amountInput, setAmountInput] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heroScale = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalSaved = goals.reduce((acc, goal) => acc + goal.saved, 0);
  const totalTarget = goals.reduce((acc, goal) => acc + goal.target, 0);
  const globalPercent =
    totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  /* ============================================================
     CRÉER UN OBJECTIF
     ============================================================ */
  const handleCreateGoal = async () => {
    if (!newGoalName || !newGoalTarget) {
      Alert.alert('Erreur', 'Remplis tous les champs.');
      return;
    }
    const target = parseFloat(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Erreur', 'Le montant cible doit être positif.');
      return;
    }
    await addGoal({
      id: Date.now().toString(),
      name: newGoalName,
      target,
      saved: 0,
    });
    closeModal();
  };

  /* ============================================================
     DÉPOSER
     ============================================================ */
  const handleDeposit = async () => {
    if (!selectedGoal || !amountInput) return;
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Montant invalide.');
      return;
    }

    await updateGoal({
      ...selectedGoal,
      saved: selectedGoal.saved + amount,
    });

    await addTransaction({
      id: Date.now().toString(),
      title: `Épargne : ${selectedGoal.name}`,
      amount,
      type: 'expense',
      category: 'epargne',
      date: new Date().toISOString(),
      dateISO: new Date().toISOString(),
    });

    closeModal();
    Alert.alert('Succès', `${amount} DH épargnés ! 🐷`);
  };

  /* ============================================================
     RETIRER
     ============================================================ */
  const handleWithdraw = async () => {
    if (!selectedGoal || !amountInput) return;
    const amount = parseFloat(amountInput);

    if (amount > selectedGoal.saved) {
      Alert.alert('Erreur', 'Solde insuffisant !');
      return;
    }

    await updateGoal({
      ...selectedGoal,
      saved: selectedGoal.saved - amount,
    });

    await addTransaction({
      id: Date.now().toString(),
      title: `Retrait Épargne : ${selectedGoal.name}`,
      amount,
      type: 'income',
      category: 'epargne',
      date: new Date().toISOString(),
      dateISO: new Date().toISOString(),
    });

    closeModal();
    Alert.alert('Retrait', `${amount} DH retirés.`);
  };

  const handleDeleteGoal = (id) => {
    Alert.alert('Supprimer', 'Supprimer cet objectif ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteGoal(id),
      },
    ]);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedGoal(null);
    setAmountInput('');
    setNewGoalName('');
    setNewGoalTarget('');
    setFocusedInput(null);
  };

  const openModal = (type, goal = null) => {
    setModalType(type);
    if (goal) setSelectedGoal(goal);
  };

  /* ============================================================
     CARTE OBJECTIF
     ============================================================ */
  const renderGoalCard = (goal, index) => {
    const percentage =
      goal.target > 0
        ? Math.min((goal.saved / goal.target) * 100, 100)
        : 0;
    const isCompleted = goal.saved >= goal.target;
    const remaining = Math.max(goal.target - goal.saved, 0);

    return (
      <View
        key={goal.id}
        style={[
          styles.goalCard,
          {
            backgroundColor: theme.card,
            borderColor: isCompleted ? COLORS.primary : 'transparent',
            borderWidth: isCompleted ? 2 : 0,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.goalHeader}>
          <View style={styles.goalHeaderLeft}>
            <View
              style={[
                styles.goalIconBox,
                {
                  backgroundColor: isCompleted
                    ? COLORS.primary + '20'
                    : '#fbbf2420',
                },
              ]}
            >
              {isCompleted ? (
                <Trophy size={18} color={COLORS.primary} strokeWidth={2.4} />
              ) : (
                <Target size={18} color="#fbbf24" strokeWidth={2.4} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.goalTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {goal.name}
              </Text>
              <Text
                style={[styles.goalSubtitle, { color: theme.subText }]}
              >
                {isCompleted
                  ? '🎉 Objectif atteint !'
                  : `Reste ${remaining.toLocaleString('fr-FR')} DH`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteGoal(goal.id)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Trash2 size={15} color="#ef4444" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Montants */}
        <View style={styles.amountRow}>
          <Text
            style={[styles.savedAmount, { color: theme.text }]}
          >
            {goal.saved.toLocaleString('fr-FR')}
            <Text style={styles.amountUnit}> DH</Text>
          </Text>
          <Text
            style={[styles.targetAmount, { color: theme.subText }]}
          >
            / {goal.target.toLocaleString('fr-FR')} DH
          </Text>
        </View>

        {/* Barre de progression */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.bg },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isCompleted
                  ? COLORS.primary
                  : '#fbbf24',
              },
            ]}
          >
            <View style={styles.progressShine} />
          </View>
        </View>

        {/* Footer : pourcentage + actions */}
        <View style={styles.goalFooter}>
          <View
            style={[
              styles.percentBadge,
              {
                backgroundColor: isCompleted
                  ? COLORS.primary + '20'
                  : '#fbbf2420',
              },
            ]}
          >
            <Text
              style={[
                styles.percentText,
                {
                  color: isCompleted ? COLORS.primary : '#f59e0b',
                },
              ]}
            >
              {percentage.toFixed(0)}%
            </Text>
          </View>

          <View style={styles.goalActions}>
            <TouchableOpacity
              onPress={() => openModal('deposit', goal)}
              activeOpacity={0.8}
              style={[
                styles.miniActionBtn,
                { backgroundColor: '#10b98115' },
              ]}
            >
              <ArrowUpCircle
                size={14}
                color="#10b981"
                strokeWidth={2.6}
              />
              <Text
                style={[styles.miniActionText, { color: '#10b981' }]}
              >
                Déposer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openModal('withdraw', goal)}
              activeOpacity={0.8}
              style={[
                styles.miniActionBtn,
                { backgroundColor: '#ef444415' },
              ]}
            >
              <ArrowDownCircle
                size={14}
                color="#ef4444"
                strokeWidth={2.6}
              />
              <Text
                style={[styles.miniActionText, { color: '#ef4444' }]}
              >
                Retirer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
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
                Sando9ti
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: theme.subText }]}
              >
                Tirelire et objectifs d'épargne
              </Text>
            </View>
          </View>

          {/* ============ HERO CARD ============ */}
          <Animated.View
            style={[
              styles.heroCardWrapper,
              { transform: [{ scale: heroScale }] },
            ]}
          >
            <LinearGradient
              colors={['#006233', '#004d25']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Motifs */}
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />

              <View style={styles.heroTopRow}>
                <View style={styles.heroIconBox}>
                  <PiggyBank size={24} color="#fff" strokeWidth={2.4} />
                </View>
                <View style={styles.heroSparkle}>
                  <Sparkles size={12} color="#fff" strokeWidth={2.4} />
                  <Text style={styles.heroSparkleText}>ÉPARGNE</Text>
                </View>
              </View>

              <Text style={styles.heroLabel}>Solde total Sando9ti</Text>
              <Text style={styles.heroAmount}>
                {totalSaved.toLocaleString('fr-FR')}
                <Text style={styles.heroCurrency}> DH</Text>
              </Text>

              {/* Progression globale */}
              {totalTarget > 0 && (
                <View style={styles.heroProgressWrapper}>
                  <View style={styles.heroProgressHeader}>
                    <Text style={styles.heroProgressLabel}>
                      {globalPercent.toFixed(0)}% de tes objectifs
                    </Text>
                    <Text style={styles.heroProgressTarget}>
                      / {totalTarget.toLocaleString('fr-FR')} DH
                    </Text>
                  </View>
                  <View style={styles.heroProgressTrack}>
                    <View
                      style={[
                        styles.heroProgressFill,
                        { width: `${globalPercent}%` },
                      ]}
                    >
                      <View style={styles.heroProgressShine} />
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* ============ ACTIONS ============ */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => openModal('deposit')}
              activeOpacity={0.85}
              style={[styles.actionBtn, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: '#10b98120' },
                ]}
              >
                <ArrowUpCircle
                  size={22}
                  color="#10b981"
                  strokeWidth={2.4}
                />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Déposer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openModal('withdraw')}
              activeOpacity={0.85}
              style={[styles.actionBtn, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: '#ef444420' },
                ]}
              >
                <ArrowDownCircle
                  size={22}
                  color="#ef4444"
                  strokeWidth={2.4}
                />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Retirer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openModal('create')}
              activeOpacity={0.85}
              style={[styles.actionBtn, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: '#3b82f620' },
                ]}
              >
                <Target size={22} color="#3b82f6" strokeWidth={2.4} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                Nouvel obj.
              </Text>
            </TouchableOpacity>
          </View>

          {/* ============ SECTION OBJECTIFS ============ */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Trophy size={16} color={theme.text} strokeWidth={2.4} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Mes objectifs
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: COLORS.primary + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: COLORS.primary },
                  ]}
                >
                  {goals.length}
                </Text>
              </View>
            </View>
          </View>

          {goals.length === 0 ? (
            <View
              style={[styles.emptyState, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.emptyIconBox,
                  { backgroundColor: '#fbbf2420' },
                ]}
              >
                <Target size={32} color="#fbbf24" strokeWidth={2} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Aucun objectif
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: theme.subText }]}
              >
                Crée ton premier objectif d'épargne et commence à mettre
                de côté pour tes projets.
              </Text>
              <TouchableOpacity
                onPress={() => openModal('create')}
                activeOpacity={0.85}
                style={styles.emptyBtnWrapper}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyBtn}
                >
                  <Target size={16} color="#fff" strokeWidth={2.8} />
                  <Text style={styles.emptyBtnText}>
                    Créer un objectif
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {goals.map(renderGoalCard)}
            </View>
          )}

          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>

      {/* ============ MODAL ============ */}
      <Modal
        visible={modalType !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.card }]}
          >
            <View style={styles.handle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.modalIconBox,
                    {
                      backgroundColor:
                        modalType === 'create'
                          ? '#3b82f620'
                          : modalType === 'deposit'
                          ? '#10b98120'
                          : '#ef444420',
                    },
                  ]}
                >
                  {modalType === 'create' ? (
                    <Target size={18} color="#3b82f6" strokeWidth={2.4} />
                  ) : modalType === 'deposit' ? (
                    <ArrowUpCircle
                      size={18}
                      color="#10b981"
                      strokeWidth={2.4}
                    />
                  ) : (
                    <ArrowDownCircle
                      size={18}
                      color="#ef4444"
                      strokeWidth={2.4}
                    />
                  )}
                </View>
                <View>
                  <Text
                    style={[styles.modalTitle, { color: theme.text }]}
                  >
                    {modalType === 'create'
                      ? 'Nouvel objectif'
                      : modalType === 'deposit'
                      ? 'Déposer'
                      : 'Retirer'}
                  </Text>
                  <Text
                    style={[
                      styles.modalSubtitle,
                      { color: theme.subText },
                    ]}
                  >
                    {modalType === 'create'
                      ? 'Définis ton objectif'
                      : modalType === 'deposit'
                      ? 'Ajoute de l’argent à ta tirelire'
                      : 'Retire de l’argent de ta tirelire'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <X size={18} color={theme.subText} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* ============ CREATE ============ */}
            {modalType === 'create' && (
              <>
                <Text
                  style={[styles.inputLabel, { color: theme.subText }]}
                >
                  NOM DE L'OBJECTIF
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.bg,
                      borderColor:
                        focusedInput === 'name'
                          ? COLORS.primary
                          : theme.track || '#e5e7eb',
                    },
                  ]}
                  value={newGoalName}
                  onChangeText={setNewGoalName}
                  placeholder="Ex : Voiture"
                  placeholderTextColor={theme.subText + '80'}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />

                <Text
                  style={[styles.inputLabel, { color: theme.subText }]}
                >
                  MONTANT CIBLE (DH)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.bg,
                      borderColor:
                        focusedInput === 'target'
                          ? COLORS.primary
                          : theme.track || '#e5e7eb',
                    },
                  ]}
                  value={newGoalTarget}
                  onChangeText={setNewGoalTarget}
                  keyboardType="numeric"
                  placeholder="Ex : 50 000"
                  placeholderTextColor={theme.subText + '80'}
                  onFocus={() => setFocusedInput('target')}
                  onBlur={() => setFocusedInput(null)}
                />

                <TouchableOpacity
                  onPress={handleCreateGoal}
                  activeOpacity={0.85}
                  style={styles.confirmBtnWrapper}
                >
                  <LinearGradient
                    colors={['#006233', '#004d25']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmBtn}
                  >
                    <CheckCircle2
                      size={18}
                      color="#fff"
                      strokeWidth={2.8}
                    />
                    <Text style={styles.confirmBtnText}>Créer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* ============ DEPOSIT / WITHDRAW ============ */}
            {(modalType === 'deposit' || modalType === 'withdraw') && (
              <>
                <Text
                  style={[styles.inputLabel, { color: theme.subText }]}
                >
                  CHOISIR UN OBJECTIF
                </Text>

                {goals.length === 0 ? (
                  <Text
                    style={[
                      styles.noGoalsText,
                      { color: theme.subText },
                    ]}
                  >
                    Aucun objectif. Crée-en un d'abord.
                  </Text>
                ) : (
                  <View style={styles.goalSelectorWrapper}>
                    {goals.map((item) => {
                      const isSelected = selectedGoal?.id === item.id;
                      const percent =
                        item.target > 0
                          ? (item.saved / item.target) * 100
                          : 0;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => setSelectedGoal(item)}
                          activeOpacity={0.8}
                          style={[
                            styles.goalSelectorItem,
                            {
                              backgroundColor: isSelected
                                ? COLORS.primary + '15'
                                : theme.bg,
                              borderColor: isSelected
                                ? COLORS.primary
                                : theme.track || '#e5e7eb',
                            },
                          ]}
                        >
                          <View style={styles.goalSelectorLeft}>
                            <View
                              style={[
                                styles.goalSelectorIconBox,
                                {
                                  backgroundColor: isSelected
                                    ? COLORS.primary
                                    : theme.track + '50',
                                },
                              ]}
                            >
                              {isSelected && (
                                <CheckCircle2
                                  size={14}
                                  color="#fff"
                                  strokeWidth={3}
                                />
                              )}
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.goalSelectorName,
                                  {
                                    color: isSelected
                                      ? COLORS.primary
                                      : theme.text,
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              <Text
                                style={[
                                  styles.goalSelectorSub,
                                  { color: theme.subText },
                                ]}
                              >
                                {item.saved.toLocaleString('fr-FR')} DH
                                {' · '}
                                {percent.toFixed(0)}%
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {selectedGoal && (
                  <>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: theme.subText, marginTop: 8 },
                      ]}
                    >
                      MONTANT (DH)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.amountInput,
                        {
                          color:
                            modalType === 'deposit'
                              ? '#10b981'
                              : '#ef4444',
                          backgroundColor: theme.bg,
                          borderColor:
                            focusedInput === 'amount'
                              ? modalType === 'deposit'
                                ? '#10b981'
                                : '#ef4444'
                              : theme.track || '#e5e7eb',
                        },
                      ]}
                      value={amountInput}
                      onChangeText={setAmountInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.subText + '80'}
                      onFocus={() => setFocusedInput('amount')}
                      onBlur={() => setFocusedInput(null)}
                    />

                    {selectedGoal && (
                      <Text
                        style={[
                          styles.hint,
                          { color: theme.subText },
                        ]}
                      >
                        {modalType === 'deposit'
                          ? `Solde actuel : ${selectedGoal.saved.toLocaleString('fr-FR')} DH`
                          : `Disponible : ${selectedGoal.saved.toLocaleString('fr-FR')} DH`}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={
                        modalType === 'deposit'
                          ? handleDeposit
                          : handleWithdraw
                      }
                      activeOpacity={0.85}
                      style={styles.confirmBtnWrapper}
                    >
                      <LinearGradient
                        colors={
                          modalType === 'deposit'
                            ? ['#10b981', '#059669']
                            : ['#ef4444', '#dc2626']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.confirmBtn}
                      >
                        <CheckCircle2
                          size={18}
                          color="#fff"
                          strokeWidth={2.8}
                        />
                        <Text style={styles.confirmBtnText}>
                          {modalType === 'deposit'
                            ? 'Déposer'
                            : 'Retirer'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 20
        : 60,
    paddingHorizontal: 20,
  },

  /* ============ HEADER ============ */
  header: { marginBottom: 20 },
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

  /* ============ HERO ============ */
  heroCardWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCard: {
    padding: 22,
    borderRadius: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroSparkle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroSparkleText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  heroLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroAmount: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroCurrency: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
  },

  heroProgressWrapper: { marginTop: 4 },
  heroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroProgressLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroProgressTarget: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroProgressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  /* ============ ACTIONS ============ */
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: -0.2,
  },

  /* ============ SECTION ============ */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },

  /* ============ CARTE OBJECTIF ============ */
  goalCard: {
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  goalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  goalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  goalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef444415',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 10,
  },
  savedAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  amountUnit: {
    fontSize: 13,
    fontWeight: '800',
    opacity: 0.7,
  },
  targetAmount: {
    fontSize: 13,
    fontWeight: '700',
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8