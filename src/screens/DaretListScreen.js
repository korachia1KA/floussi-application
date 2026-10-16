import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Filter,
  Users,
  Play,
  Pause,
  Trash2,
  Trophy,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useDaret } from '../context/DaretContext';
import { useTheme } from '../context/ThemeContext';
import { generateId } from '../utils/daretHelpers';

/* ============================================================
   LISTE DES DARETS
   ============================================================ */
export const DaretListScreen = ({ navigation }) => {
  const { darets, loading, deleteDaret, pauseDaret, resumeDaret } = useDaret();
  const { theme } = useTheme();
  const [filterStatus, setFilterStatus] = useState('all');

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

  const safeDarets = darets || [];

  const filtered =
    filterStatus === 'all'
      ? safeDarets
      : safeDarets.filter((d) => d.status === filterStatus);

  const handleDeleteDaret = (daretId, daretName) => {
    Alert.alert(
      'Supprimer',
      `Supprimer définitivement "${daretName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: () => deleteDaret(daretId),
          style: 'destructive',
        },
      ]
    );
  };

  const handleToggleDaret = (daret) => {
    if (daret.status === 'active') pauseDaret(daret.id);
    else resumeDaret(daret.id);
  };

  const filters = [
    { key: 'all', label: 'Toutes', count: safeDarets.length },
    {
      key: 'active',
      label: 'En cours',
      count: safeDarets.filter((d) => d.status === 'active').length,
    },
    {
      key: 'paused',
      label: 'Pausées',
      count: safeDarets.filter((d) => d.status === 'paused').length,
    },
  ];

  if (loading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.bg }]}
      >
        <View
          style={[styles.loadingBox, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.loadingText, { color: theme.subText }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Mes Darets
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subText }]}>
            Gère tes cercles d'épargne
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateDaret')}
          activeOpacity={0.85}
          style={styles.addBtnWrapper}
        >
          <LinearGradient
            colors={['#006233', '#004d25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addBtn}
          >
            <Plus size={22} color="#fff" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* FILTRES */}
      <View style={styles.filterContainer}>
        {filters.map((f) => {
          const isActive = filterStatus === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilterStatus(f.key)}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: isActive ? COLORS.primary : theme.card,
                  borderColor: isActive
                    ? COLORS.primary
                    : theme.track || '#e5e7eb',
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#fff' : theme.subText },
                ]}
              >
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor: isActive
                      ? 'rgba(255,255,255,0.25)'
                      : theme.track || '#f3f4f6',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    { color: isActive ? '#fff' : theme.text },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LISTE */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View
            style={[
              styles.emptyContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Filter size={32} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Aucune Daret trouvée
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.subText }]}
            >
              {filterStatus === 'all'
                ? 'Commence par créer une nouvelle Daret avec le bouton + en haut.'
                : `Aucune Daret dans cette catégorie. Change de filtre ou crées-en une.`}
            </Text>

            {filterStatus === 'all' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateDaret')}
                activeOpacity={0.85}
                style={styles.emptyBtnWrapper}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyBtn}
                >
                  <Plus size={18} color="#fff" strokeWidth={3} />
                  <Text style={styles.emptyBtnText}>
                    Créer une Daret
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        }
        renderItem={({ item: daret, index }) => (
          <DaretListItem
            daret={daret}
            theme={theme}
            index={index}
            onPress={() =>
              navigation.navigate('DaretDetail', { daretId: daret.id })
            }
            onDelete={() => handleDeleteDaret(daret.id, daret.name)}
            onToggle={() => handleToggleDaret(daret)}
          />
        )}
      />
    </View>
  );
};

/* ============================================================
   CARTE DARET
   ============================================================ */
const DaretListItem = ({ daret, theme, onPress, onDelete, onToggle, index }) => {
  const members = daret.members || [];
  const nextRecipient = members[daret.currentRoundIndex];
  const isOverdue =
    daret.nextDueDate && new Date(daret.nextDueDate) < new Date();
  const isActive = daret.status === 'active';
  const potAmount = daret.monthlyAmount * members.length;
  const completedRounds = daret.roundHistory?.length || 0;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isOverdue ? '#ef444440' : 'transparent',
            borderWidth: isOverdue ? 1 : 0,
          },
        ]}
      >
        <View
          style={[
            styles.statusLine,
            { backgroundColor: isActive ? COLORS.primary : '#ef4444' },
          ]}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTitleRow}>
                <Text
                  style={[styles.cardTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {daret.name}
                </Text>
                {isOverdue && (
                  <View style={styles.overduePill}>
                    <AlertCircle size={10} color="#dc2626" strokeWidth={2.8} />
                    <Text style={styles.overduePillText}>Retard</Text>
                  </View>
                )}
              </View>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isActive ? '#10b981' : '#ef4444',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isActive ? '#10b981' : '#ef4444' },
                  ]}
                >
                  {isActive ? 'En cours' : 'Pausée'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.amountBadge,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Text
                style={[styles.amountBadgeValue, { color: COLORS.primary }]}
              >
                {daret.monthlyAmount}
              </Text>
              <Text
                style={[styles.amountBadgeUnit, { color: COLORS.primary }]}
              >
                DH/mois
              </Text>
            </View>
          </View>

          <View style={styles.cardStats}>
            <StatItem label="Membres" value={members.length} theme={theme} />
            <View style={styles.statDivider} />
            <StatItem
              label="Tours"
              value={`${completedRounds}/${daret.totalCycles || 0}`}
              theme={theme}
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Cagnotte"
              value={`${potAmount} DH`}
              theme={theme}
              accent={COLORS.primary}
            />
          </View>

          <View style={[styles.nextSection, { backgroundColor: theme.bg }]}>
            <View style={styles.nextLeft}>
              <Trophy size={13} color={COLORS.primary} strokeWidth={2.4} />
              {nextRecipient ? (
                <Text
                  style={[styles.nextText, { color: theme.subText }]}
                  numberOfLines={1}
                >
                  Prochain :{' '}
                  <Text style={{ color: COLORS.primary, fontWeight: '900' }}>
                    {nextRecipient.name}
                  </Text>
                </Text>
              ) : (
                <Text style={[styles.nextText, { color: theme.subText }]}>
                  Cycle terminé
                </Text>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onToggle}
                style={[styles.miniBtn, { backgroundColor: theme.card }]}
                activeOpacity={0.7}
              >
                {isActive ? (
                  <Pause size={14} color={theme.subText} strokeWidth={2.4} />
                ) : (
                  <Play size={14} color={COLORS.primary} strokeWidth={2.4} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onDelete}
                style={[styles.miniBtn, { backgroundColor: '#fee2e2' }]}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#dc2626" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StatItem = ({ label, value, theme, accent }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statLabel, { color: theme.subText }]}>{label}</Text>
    <Text
      style={[styles.statValue, { color: accent || theme.text }]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

/* ============================================================
   ÉCRAN CRÉATION
   ============================================================ */
export const CreateDaretScreen = ({ navigation }) => {
  const { createDaret } = useDaret();
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [daretName, setDaretName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const progressAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleAddMember = () => {
    if (memberName.trim()) {
      setMembers([...members, { id: generateId(), name: memberName.trim() }]);
      setMemberName('');
    }
  };

  const handleRemoveMember = (memberId) =>
    setMembers(members.filter((m) => m.id !== memberId));

  const handleCreateDaret = async () => {
    if (!daretName.trim() || !monthlyAmount || members.length < 2) {
      Alert.alert(
        'Erreur',
        'Il faut au minimum 2 membres pour créer une Daret.'
      );
      return;
    }

    try {
      await createDaret({
        name: daretName.trim(),
        monthlyAmount: parseFloat(monthlyAmount),
        members: members.map((m) => ({
          id: m.id || generateId(),
          name: m.name,
          joinedAt: new Date().toISOString(),
          status: 'active',
        })),
        roundHistory: [],
        currentRoundIndex: 0,
        totalCycles: members.length,
      });
      Alert.alert('Succès', 'Daret créée avec succès !');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de créer la Daret.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      {/* HEADER */}
      <View style={styles.createHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          activeOpacity={0.7}
        >
          <X size={22} color={theme.text} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.createHeaderCenter}>
          <Text style={[styles.createHeaderTitle, { color: theme.text }]}>
            Nouvelle Daret
          </Text>
          <Text style={[styles.createHeaderStep, { color: theme.subText }]}>
            Étape {step} sur 2
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* PROGRESSION */}
      <View style={styles.progressWrapper}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.track || '#f3f4f6' },
          ]}
        >
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>

        <View style={styles.progressSteps}>
          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step >= 1 ? COLORS.primary : theme.track,
                },
              ]}
            >
              {step > 1 && (
                <CheckCircle2 size={12} color="#fff" strokeWidth={3} />
              )}
            </View>
            <Text
              style={[
                styles.progressStepLabel,
                {
                  color: step >= 1 ? theme.text : theme.subText,
                  fontWeight: step >= 1 ? '900' : '600',
                },
              ]}
            >
              Infos
            </Text>
          </View>

          <View style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step >= 2 ? COLORS.primary : theme.track,
                },
              ]}
            />
            <Text
              style={[
                styles.progressStepLabel,
                {
                  color: step >= 2 ? theme.text : theme.subText,
                  fontWeight: step >= 2 ? '900' : '600',
                },
              ]}
            >
              Membres
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENU SCROLLABLE */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ÉTAPE 1 */}
        {step === 1 && (
          <View>
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepIconBox,
                  { backgroundColor: COLORS.primary + '15' },
                ]}
              >
                <Sparkles size={20} color={COLORS.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Informations
              </Text>
              <Text style={[styles.stepSubtitle, { color: theme.subText }]}>
                Donne un nom à ta Daret et définis la cotisation mensuelle.
              </Text>
            </View>

            <Text style={[styles.inputLabel, { color: theme.subText }]}>
              NOM DE LA DARET
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor:
                    focusedInput === 'name'
                      ? COLORS.primary
                      : theme.track || '#e5e7eb',
                },
              ]}
              placeholder="Ex : Daret Famille"
              placeholderTextColor={theme.subText + '80'}
              value={daretName}
              onChangeText={setDaretName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />

            <Text style={[styles.inputLabel, { color: theme.subText }]}>
              COTISATION MENSUELLE (DH)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor:
                    focusedInput === 'amount'
                      ? COLORS.primary
                      : theme.track || '#e5e7eb',
                },
              ]}
              placeholder="Ex : 500"
              placeholderTextColor={theme.subText + '80'}
              value={monthlyAmount}
              onChangeText={setMonthlyAmount}
              onFocus={() => setFocusedInput('amount')}
              onBlur={() => setFocusedInput(null)}
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => setStep(2)}
              disabled={!daretName || !monthlyAmount}
              activeOpacity={0.85}
              style={[
                styles.primaryBtnWrapper,
                (!daretName || !monthlyAmount) && { opacity: 0.5 },
              ]}
            >
              <LinearGradient
                colors={['#006233', '#004d25']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Suivant</Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.8} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ÉTAPE 2 — input simple + FlatList */}
        {step === 2 && (
          <View style={{ flex: 1 }}>
            <View style={styles.stepHeader}>
              <View
                style={[
                  styles.stepIconBox,
                  { backgroundColor: '#3b82f615' },
                ]}
              >
                <Users size={20} color="#3b82f6" strokeWidth={2.4} />
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Membres
              </Text>
              <Text style={[styles.stepSubtitle, { color: theme.subText }]}>
                Ajoute au moins 2 membres. L'ordre d'ajout détermine l'ordre de
                passage.
              </Text>
            </View>

            {/* INPUT SIMPLE */}
            <View style={styles.simpleInputRow}>
              <TextInput
                style={[
                  styles.simpleInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor:
                      focusedInput === 'member'
                        ? COLORS.primary
                        : theme.track || '#e5e7eb',
                  },
                ]}
                placeholder="Nom du membre"
                placeholderTextColor={theme.subText + '80'}
                value={memberName}
                onChangeText={setMemberName}
                onFocus={() => setFocusedInput('member')}
                onBlur={() => setFocusedInput(null)}
                onSubmitEditing={handleAddMember}
                returnKeyType="done"
              />

              <TouchableOpacity
                onPress={handleAddMember}
                disabled={!memberName}
                activeOpacity={0.85}
                style={[
                  styles.simpleAddBtn,
                  !memberName && { opacity: 0.5 },
                ]}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.simpleAddBtnInner}
                >
                  <Plus size={20} color="#fff" strokeWidth={3} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Compteur + cagnotte */}
            {members.length > 0 && (
              <View style={styles.memberCountRow}>
                <View
                  style={[
                    styles.memberCountBadge,
                    { backgroundColor: COLORS.primary + '15' },
                  ]}
                >
                  <Users size={12} color={COLORS.primary} strokeWidth={2.6} />
                  <Text
                    style={[
                      styles.memberCountText,
                      { color: COLORS.primary },
                    ]}
                  >
                    {members.length} membre{members.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <Text
                  style={[styles.memberPotPreview, { color: theme.subText }]}
                >
                  Cagnotte :{' '}
                  <Text
                    style={{ color: COLORS.primary, fontWeight: '900' }}
                  >
                    {(
                      parseFloat(monthlyAmount || 0) * members.length
                    ).toLocaleString('fr-FR')}{' '}
                    DH
                  </Text>
                </Text>
              </View>
            )}

            {/* LISTE DES MEMBRES */}
            {members.length > 0 && (
              <View style={styles.membersListWrapper}>
                <FlatList
                  data={members}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 6 }} />
                  )}
                  renderItem={({ item: member, index: idx }) => (
                    <View
                      style={[
                        styles.memberItem,
                        {
                          backgroundColor: theme.card,
                          borderLeftColor: COLORS.primary,
                        },
                      ]}
                    >
                      <View style={styles.memberItemLeft}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>
                            {idx + 1}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.memberItemText,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {member.name}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member.id)}
                        style={styles.removeBtn}
                        activeOpacity={0.7}
                      >
                        <X size={16} color="#dc2626" strokeWidth={2.8} />
                      </TouchableOpacity>
                    </View>
                  )}
                  ListFooterComponent={
                    members.length < 2 ? (
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: theme.subText,
                          textAlign: 'center',
                          marginTop: 10,
                        }}
                      >
                        Ajoute encore {2 - members.length} membre
                        {2 - members.length > 1 ? 's' : ''} pour créer la
                        Daret
                      </Text>
                    ) : null
                  }
                />
              </View>
            )}

            {/* Boutons bas */}
            <View style={styles.stepButtonsRow}>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={[
                  styles.secondaryBtn,
                  { borderColor: theme.track || '#e5e7eb' },
                ]}
                activeOpacity={0.7}
              >
                <ArrowLeft size={16} color={theme.text} strokeWidth={2.6} />
                <Text
                  style={[styles.secondaryBtnText, { color: theme.text }]}
                >
                  Retour
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateDaret}
                disabled={members.length < 2}
                activeOpacity={0.85}
                style={[
                  styles.primaryBtnWrapper,
                  styles.primaryBtnFlex,
                  members.length < 2 && { opacity: 0.5 },
                ]}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryBtn}
                >
                  <CheckCircle2 size={18} color="#fff" strokeWidth={2.8} />
                  <Text style={styles.primaryBtnText}>Créer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

/* ============================================================
   STYLES
   ============================================================ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingBox: { padding: 20, borderRadius: 14 },
  loadingText: { fontSize: 14, fontWeight: '600' },

  /* HEADER */
  header: {
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  addBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* FILTRES */
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 12, fontWeight: '800', letterSpacing: -0.2 },
  filterCount: {
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 7,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '900' },

  /* LISTE */
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },

  /* CARTE */
  card: {
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  statusLine: { width: 5, height: '100%' },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  overduePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overduePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 0.3,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  amountBadgeValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  amountBadgeUnit: { fontSize: 10, fontWeight: '800', opacity: 0.8 },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  statValue: { fontSize: 14, fontWeight: '900', letterSpacing: -0.3 },
  nextSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  nextLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  nextText: { fontSize: 12, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 6 },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* EMPTY */
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  /* CREATE SCREEN */
  createHeader: {
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createHeaderCenter: { flex: 1, alignItems: 'center' },
  createHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  createHeaderStep: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* PROGRESS */
  progressWrapper: { paddingHorizontal: 20, marginBottom: 22 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepLabel: { fontSize: 11, letterSpacing: -0.2 },

  /* FORM */
  formContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  stepHeader: { marginBottom: 24 },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSubtitle: { fontSize: 12, fontWeight: '500', lineHeight: 18 },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 7,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },

  /* INPUT SIMPLE MEMBRES */
  simpleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  simpleInput: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
  },
  simpleAddBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  simpleAddBtnInner: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memberCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  memberCountText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  memberPotPreview: { fontSize: 11, fontWeight: '700' },

  /* LISTE MEMBRES */
  membersListWrapper: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  memberItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  memberItemText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* BOUTONS */
  primaryBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  primaryBtnFlex: { flex: 1.4 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    minHeight: 52,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  stepButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});