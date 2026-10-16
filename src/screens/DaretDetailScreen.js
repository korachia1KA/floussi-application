import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Pause,
  Play,
  Plus,
  Trash2,
  Users,
  TrendingUp,
  Trophy,
  Crown,
  X,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useDaret } from '../context/DaretContext';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { generateId } from '../utils/daretHelpers';

export const DaretDetailScreen = ({ route, navigation }) => {
  const { daretId } = route.params;
  const { getDaretById, updateDaret, deleteDaret, pauseDaret, resumeDaret } =
    useDaret();
  const { theme } = useTheme();
  const { addTransaction, user } = useBudget();

  const daret = getDaretById(daretId);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const potScale = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(potScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!daret) return null;

  const currentRound = daret.currentRoundIndex + 1;
  const currentRecipient = daret.members[daret.currentRoundIndex];
  const potAmount = daret.monthlyAmount * daret.members.length;
  const isCompleted = currentRound > daret.totalCycles;
  const isActive = daret.status === 'active';
  const totalPaid = daret.currentRoundIndex * daret.monthlyAmount;

  const progress =
    daret.totalCycles > 0
      ? (daret.currentRoundIndex / daret.totalCycles) * 100
      : 0;

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la Daret',
      'Cette action est irréversible. Toutes les données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteDaret(daretId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const updatedMembers = [
        ...daret.members,
        {
          id: generateId(),
          name: newMemberName.trim(),
          joinedAt: new Date().toISOString(),
          status: 'active',
        },
      ];
      updateDaret(daret.id, {
        members: updatedMembers,
        totalCycles: updatedMembers.length,
      });
      setNewMemberName('');
      setModalVisible(false);
    }
  };

  /* ============================================================
     LOGIQUE COMPTABLE INTELLIGENTE (inchangée)
     ============================================================ */
  const handleCompleteRound = async () => {
    if (isCompleted) return;

    Alert.alert(
      `Fin du tour de ${currentRecipient?.name}`,
      'Qui reçoit la cagnotte ce mois-ci ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '👤 Un autre membre',
          onPress: () => {
            Alert.alert(
              'Cotisation mensuelle',
              `Voulez-vous déduire votre part (${daret.monthlyAmount} DH) de votre solde ?`,
              [
                {
                  text: 'Non, juste valider',
                  onPress: () => advanceRoundLogic(),
                },
                {
                  text: 'Oui, payer & valider',
                  onPress: async () => {
                    await advanceRoundLogic();
                    await addTransaction({
                      id: Date.now().toString(),
                      title: `Daret : Cotisation pour ${currentRecipient?.name}`,
                      amount: parseFloat(daret.monthlyAmount),
                      type: 'expense',
                      category: 'daret',
                      date: new Date().toISOString(),
                      dateISO: new Date().toISOString(),
                    });
                    Alert.alert(
                      'Payé ! 💸',
                      `Votre cotisation de ${daret.monthlyAmount} DH a été déduite.`
                    );
                  },
                },
              ]
            );
          },
        },
        {
          text: "💰 C'est moi !",
          onPress: async () => {
            await advanceRoundLogic();
            await addTransaction({
              id: Date.now().toString(),
              title: `Daret : Mon tour (${daret.name})`,
              amount: parseFloat(potAmount),
              type: 'income',
              category: 'daret',
              date: new Date().toISOString(),
              dateISO: new Date().toISOString(),
            });
            Alert.alert(
              'Félicitations 🤑',
              `${potAmount} DH ont été ajoutés à ton solde !`
            );
          },
        },
      ]
    );
  };

  const advanceRoundLogic = async () => {
    const newHistory = [
      ...daret.roundHistory,
      {
        roundNumber: currentRound,
        recipientId: currentRecipient.id,
        amount: potAmount,
        date: new Date().toISOString(),
        status: 'completed',
      },
    ];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    await updateDaret(daret.id, {
      roundHistory: newHistory,
      currentRoundIndex: daret.currentRoundIndex + 1,
      nextDueDate: nextDate.toISOString(),
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ============ HEADER ============ */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.track || 'transparent',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={theme.text} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {daret.name}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() =>
              isActive ? pauseDaret(daretId) : resumeDaret(daretId)
            }
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            {isActive ? (
              <Pause size={20} color={theme.subText} strokeWidth={2.4} />
            ) : (
              <Play size={20} color={COLORS.primary} strokeWidth={2.4} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color="#ef4444" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

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
          {/* ============ CARTE STATUS PRINCIPALE ============ */}
          <LinearGradient
            colors={
              isCompleted
                ? ['#6b7280', '#4b5563']
                : isActive
                ? ['#006233', '#003d1f']
                : ['#7f1d1d', '#450a0a']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            {/* Motifs */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.statusHeader}>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isCompleted
                        ? '#9ca3af'
                        : isActive
                        ? '#4ade80'
                        : '#fca5a5',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isCompleted
                        ? '#e5e7eb'
                        : isActive
                        ? '#4ade80'
                        : '#fca5a5',
                    },
                  ]}
                >
                  {isCompleted
                    ? 'TERMINÉE'
                    : isActive
                    ? 'EN COURS'
                    : 'PAUSÉE'}
                </Text>
              </View>

              <View style={styles.monthlyBadge}>
                <Text style={styles.monthlyAmount}>
                  {daret.monthlyAmount}
                </Text>
                <Text style={styles.monthlyUnit}>DH/mois</Text>
              </View>
            </View>

            <Text style={styles.statusLabel}>POT MENSUEL</Text>
            <Animated.Text
              style={[
                styles.potAmount,
                { transform: [{ scale: potScale }] },
              ]}
            >
              {potAmount.toLocaleString('fr-FR')}
              <Text style={styles.potCurrency}> DH</Text>
            </Animated.Text>

            <View style={styles.nextDateRow}>
              <Calendar size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.nextDateText}>
                Prochain tour :{' '}
                <Text style={styles.nextDateValue}>
                  {new Date(
                    daret.nextDueDate || Date.now()
                  ).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </Text>
            </View>
          </LinearGradient>

          {/* ============ STATS GRID ============ */}
          <View style={styles.statsGrid}>
            <StatBox
              label="Avancement"
              value={`${currentRound}/${daret.totalCycles}`}
              icon={Clock}
              theme={theme}
              accent={COLORS.primary}
            />
            <StatBox
              label="Membres"
              value={`${daret.members.length}`}
              icon={Users}
              theme={theme}
              accent="#3b82f6"
            />
            <StatBox
              label="Déjà versé"
              value={`${totalPaid} DH`}
              icon={TrendingUp}
              theme={theme}
              accent="#f59e0b"
            />
          </View>

          {/* ============ BÉNÉFICIAIRE ACTUEL ============ */}
          {!isCompleted && currentRecipient && (
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: theme.card },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleRow}>
                  <Crown size={16} color={COLORS.primary} />
                  <Text
                    style={[styles.sectionTitle, { color: theme.subText }]}
                  >
                    BÉNÉFICIAIRE DU TOUR #{currentRound}
                  </Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>ACTUEL</Text>
                </View>
              </View>

              <View style={styles.recipientRow}>
                <View style={styles.recipientAvatar}>
                  <Text style={styles.recipientInitial}>
                    {currentRecipient.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.recipientName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {currentRecipient.name}
                  </Text>
                  <Text
                    style={[
                      styles.recipientSubtitle,
                      { color: theme.subText },
                    ]}
                  >
                    Va recevoir{' '}
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontWeight: '900',
                      }}
                    >
                      {potAmount} DH
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCompleteRound}
                activeOpacity={0.85}
                style={styles.actionBtnWrapper}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionBtn}
                >
                  <CheckCircle size={20} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.actionBtnText}>Valider le tour</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ============ PROGRESSION ============ */}
          <View
            style={[styles.sectionCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.progressHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.subText }]}
              >
                PROGRESSION GLOBALE
              </Text>
              <Text
                style={[styles.progressPercent, { color: theme.text }]}
              >
                {Math.round(progress)}%
              </Text>
            </View>
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: theme.track || '#f3f4f6' },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              >
                <View style={styles.progressShine} />
              </View>
            </View>

            <View style={styles.statsRow}>
              <MiniStat
                label="J'ai versé"
                value={`${totalPaid} DH`}
                theme={theme}
                accent={COLORS.primary}
              />
              <MiniStat
                label="Tours complétés"
                value={`${daret.currentRoundIndex}`}
                theme={theme}
                accent="#10b981"
              />
            </View>
          </View>

          {/* ============ MEMBRES ============ */}
          <View style={styles.membersSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Users size={18} color={theme.text} />
                <Text
                  style={[styles.membersTitle, { color: theme.text }]}
                >
                  Membres & Ordre
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
                    {daret.members.length}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.addBtn}
                activeOpacity={0.8}
              >
                <Plus size={18} color="#fff" strokeWidth={2.8} />
              </TouchableOpacity>
            </View>

            {daret.members.map((member, index) => {
              const isCurrent = index === daret.currentRoundIndex;
              const isDone = index < daret.currentRoundIndex;

              return (
                <View
                  key={member.id}
                  style={[
                    styles.memberCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: isCurrent
                        ? COLORS.primary
                        : 'transparent',
                      borderWidth: isCurrent ? 2 : 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      {
                        backgroundColor: isCurrent
                          ? COLORS.primary
                          : isDone
                          ? '#10b981'
                          : theme.track || '#f3f4f6',
                      },
                    ]}
                  >
                    {isDone ? (
                      <CheckCircle size={20} color="#fff" strokeWidth={2.8} />
                    ) : isCurrent ? (
                      <Trophy size={20} color="#fff" strokeWidth={2.8} />
                    ) : (
                      <Text
                        style={[
                          styles.avatarText,
                          { color: theme.subText },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[styles.memberName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {member.name}
                    </Text>
                    <View style={styles.memberStatusRow}>
                      <View
                        style={[
                          styles.memberStatusDot,
                          {
                            backgroundColor: isDone
                              ? '#10b981'
                              : isCurrent
                              ? COLORS.primary
                              : '#9ca3af',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.memberDate,
                          { color: theme.subText },
                        ]}
                      >
                        {isDone
                          ? 'A reçu son tour'
                          : isCurrent
                          ? 'Tour en cours'
                          : 'En attente'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.memberAmount, { color: theme.text }]}
                  >
                    {daret.monthlyAmount}
                    <Text
                      style={{
                        fontSize: 10,
                        color: theme.subText,
                        fontWeight: '700',
                      }}
                    >
                      {' '}
                      DH
                    </Text>
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {/* ============ MODAL AJOUT MEMBRE ============ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.card }]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View
                  style={[
                    styles.modalIconBox,
                    { backgroundColor: COLORS.primary + '20' },
                  ]}
                >
                  <Users size={18} color={COLORS.primary} strokeWidth={2.4} />
                </View>
                <Text
                  style={[styles.modalTitle, { color: theme.text }]}
                >
                  Nouveau membre
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={theme.subText} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <Text
              style={[styles.modalSubtitle, { color: theme.subText }]}
            >
              Ajoute un membre à cette Daret. L'ordre de passage sera
              déterminé par l'ordre d'ajout.
            </Text>

            <Text style={[styles.inputLabel, { color: theme.subText }]}>
              NOM DU MEMBRE
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor:
                    focusedInput === 'member'
                      ? COLORS.primary
                      : theme.track || '#e5e7eb',
                  backgroundColor: theme.bg,
                },
              ]}
              placeholder="Ex : Amine Tazi"
              placeholderTextColor={theme.subText + '80'}
              value={newMemberName}
              onChangeText={setNewMemberName}
              onFocus={() => setFocusedInput('member')}
              onBlur={() => setFocusedInput(null)}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.cancelBtn, { borderColor: theme.track }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: theme.subText }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMember}
                style={styles.saveBtnWrapper}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtn}
                >
                  <Plus size={16} color="#fff" strokeWidth={3} />
                  <Text style={styles.saveBtnText}>Ajouter</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ============================================================
   SOUS-COMPOSANTS
   ============================================================ */
const StatBox = ({ label, value, icon: Icon, theme, accent }) => (
  <View
    style={[
      styles.statBox,
      {
        backgroundColor: theme.card,
        borderColor: accent + '20',
      },
    ]}
  >
    <View
      style={[styles.statIconBox, { backgroundColor: accent + '18' }]}
    >
      <Icon size={16} color={accent} strokeWidth={2.4} />
    </View>
    <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
      {value}
    </Text>
    <Text style={[styles.statLabel, { color: theme.subText }]}>{label}</Text>
  </View>
);

const MiniStat = ({ label, value, theme, accent }) => (
  <View
    style={[
      styles.miniStat,
      { backgroundColor: theme.bg, borderLeftColor: accent },
    ]}
  >
    <Text style={[styles.miniStatLabel, { color: theme.subText }]}>
      {label}
    </Text>
    <Text style={[styles.miniStatValue, { color: accent }]}>{value}</Text>
  </View>
);

/* ============================================================
   STYLES
   ============================================================ */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* ============ HEADER ============ */
  header: {
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 12
        : 56,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  scrollContent: { padding: 16 },

  /* ============ STATUS CARD ============ */
  statusCard: {
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  monthlyBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  monthlyAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  monthlyUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
  },

  statusLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  potAmount: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  potCurrency: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
  },
  nextDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  nextDateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },
  nextDateValue: {
    color: '#fff',
    fontWeight: '900',
  },

  /* ============ STATS GRID ============ */
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  /* ============ SECTION CARD ============ */
  sectionCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  /* ============ RECIPIENT ============ */
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  recipientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  recipientName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  recipientSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },

  /* ============ ACTION BTN ============ */
  actionBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 8,
    minHeight: 52,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  /* ============ PROGRESS ============ */
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  /* ============ MEMBERS ============ */
  membersSection: {
    marginTop: 6,
  },
  membersTitle: {
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '900',
    fontSize: 15,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  memberStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  memberDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberAmount: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  /* ============ MODAL ============ */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 22,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 15,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  saveBtnWrapper: {
    flex: 1.4,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    minHeight: 48,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});