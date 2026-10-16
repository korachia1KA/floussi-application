import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';
import {
  Users,
  Calendar,
  Banknote,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  Trophy,
  X,
  Sparkles,
} from 'lucide-react-native';

export default function DaretScreen({ navigation }) {
  const { theme } = useTheme();
  const { darets, addDaret, deleteDaret } = useBudget();

  const [modalVisible, setModalVisible] = useState(false);

  // Formulaire
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [members, setMembers] = useState('');
  const [myTurn, setMyTurn] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const totalPot =
    parseFloat(amount || 0) * parseInt(members || 0) || 0;

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

  const handleCreateDaret = async () => {
    if (!name || !amount || !members || !myTurn) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }

    const totalMembers = parseInt(members);
    const myTurnNum = parseInt(myTurn);

    if (myTurnNum > totalMembers) {
      Alert.alert(
        'Erreur',
        `Ton tour doit être compris entre 1 et ${totalMembers}.`
      );
      return;
    }

    await addDaret({
      name,
      amountPerPerson: parseFloat(amount),
      totalMembers,
      myTurn: myTurnNum,
      totalPot: parseFloat(amount) * totalMembers,
      startDate: new Date().toISOString(),
    });

    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setMembers('');
    setMyTurn('');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Arrêter cette Daret ?',
      'Les données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteDaret(id),
        },
      ]
    );
  };

  /* ============================================================
     CARTE DARET
     ============================================================ */
  const DaretCard = ({ item }) => {
    const currentMonth = 1;
    const isMyTurn = item.myTurn === currentMonth;
    const monthsLeft = item.myTurn - currentMonth;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isMyTurn ? COLORS.primary : 'transparent',
            borderWidth: isMyTurn ? 2 : 0,
          },
        ]}
      >
        {/* Bande colorée si c'est mon tour */}
        {isMyTurn && <View style={styles.cardStripe} />}

        {/* Header de carte */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.cardIconBox,
                { backgroundColor: COLORS.primary + '20' },
              ]}
            >
              <Users size={20} color={COLORS.primary} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.cardTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[styles.cardSubtitle, { color: theme.subText }]}
              >
                {item.totalMembers} membres · tour n°{item.myTurn}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color="#ef4444" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Ligne cotisation → pot */}
        <View style={styles.potRow}>
          <View style={styles.potBox}>
            <Text style={[styles.potBoxLabel, { color: theme.subText }]}>
              Ma part
            </Text>
            <Text style={[styles.potBoxValue, { color: theme.text }]}>
              {item.amountPerPerson}
              <Text style={styles.potBoxUnit}> DH</Text>
            </Text>
          </View>

          <ArrowRight size={16} color={theme.subText} strokeWidth={2.4} />

          <View
            style={[
              styles.potBox,
              styles.potBoxHighlight,
            ]}
          >
            <Text style={[styles.potBoxLabel, { color: '#065f46' }]}>
              Cagnotte
            </Text>
            <Text style={[styles.potBoxValue, { color: '#065f46' }]}>
              {item.totalPot}
              <Text style={styles.potBoxUnit}> DH</Text>
            </Text>
          </View>
        </View>

        {/* Encart info tour */}
        <View
          style={[
            styles.turnInfoBox,
            {
              backgroundColor: isMyTurn
                ? COLORS.primary + '15'
                : theme.bg,
              borderLeftColor: isMyTurn
                ? COLORS.primary
                : theme.track || '#e5e7eb',
            },
          ]}
        >
          <View style={styles.turnInfoHeader}>
            <Trophy
              size={14}
              color={isMyTurn ? COLORS.primary : theme.subText}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.turnInfoTitle,
                {
                  color: isMyTurn ? COLORS.primary : theme.text,
                },
              ]}
            >
              {isMyTurn
                ? '🎉 C’est ton tour ce mois-ci !'
                : `Ton tour dans ${monthsLeft} mois`}
            </Text>
          </View>
          <Text
            style={[styles.turnInfoText, { color: theme.subText }]}
          >
            Tu verses {item.amountPerPerson} DH chaque mois. Au mois{' '}
            {item.myTurn}, tu reçois la cagnotte de {item.totalPot} DH.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* ============ HEADER ============ */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Mes Darets
          </Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            {darets.length} tontine{darets.length > 1 ? 's' : ''} active
            {darets.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
          style={styles.addButtonWrapper}
        >
          <LinearGradient
            colors={['#006233', '#004d25']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Plus size={22} color="#fff" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ============ LISTE ============ */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {darets.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyState,
              {
                backgroundColor: theme.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Users size={32} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Aucune Daret en cours
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.subText }]}
            >
              Crée ta première tontine et gère les cotisations
              mensuelles, les tours et la cagnotte en toute simplicité.
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
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
          </Animated.View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {darets.map((d) => (
              <DaretCard key={d.id} item={d} />
            ))}
            <View style={{ height: 40 }} />
          </Animated.View>
        )}
      </ScrollView>

      {/* ============ MODAL CRÉATION ============ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.card }]}
          >
            {/* Poignée */}
            <View style={styles.handle} />

            {/* Header modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.modalIconBox,
                    { backgroundColor: COLORS.primary + '20' },
                  ]}
                >
                  <Sparkles
                    size={18}
                    color={COLORS.primary}
                    strokeWidth={2.4}
                  />
                </View>
                <View>
                  <Text
                    style={[styles.modalTitle, { color: theme.text }]}
                  >
                    Nouvelle Daret
                  </Text>
                  <Text
                    style={[
                      styles.modalSubtitle,
                      { color: theme.subText },
                    ]}
                  >
                    Configure ta tontine
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={theme.subText} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Nom */}
              <Text style={[styles.inputLabel, { color: theme.subText }]}>
                NOM DE LA DARET
              </Text>
              <TextInput
                placeholder="Ex : Daret Famille"
                placeholderTextColor={theme.subText + '80'}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
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
              />

              {/* Mise + Membres */}
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.subText },
                    ]}
                  >
                    MA PART (DH)
                  </Text>
                  <TextInput
                    placeholder="1000"
                    placeholderTextColor={theme.subText + '80'}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    onFocus={() => setFocusedInput('amount')}
                    onBlur={() => setFocusedInput(null)}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.bg,
                        borderColor:
                          focusedInput === 'amount'
                            ? COLORS.primary
                            : theme.track || '#e5e7eb',
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.subText },
                    ]}
                  >
                    MEMBRES
                  </Text>
                  <TextInput
                    placeholder="10"
                    placeholderTextColor={theme.subText + '80'}
                    keyboardType="numeric"
                    value={members}
                    onChangeText={setMembers}
                    onFocus={() => setFocusedInput('members')}
                    onBlur={() => setFocusedInput(null)}
                    style={[
                      styles.input,
                      {
                        color: theme.text,
                        backgroundColor: theme.bg,
                        borderColor:
                          focusedInput === 'members'
                            ? COLORS.primary
                            : theme.track || '#e5e7eb',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Mon tour */}
              <Text style={[styles.inputLabel, { color: theme.subText }]}>
                MON TOUR (MOIS)
              </Text>
              <TextInput
                placeholder={`Entre 1 et ${
                  members ? parseInt(members) : 'N'
                }`}
                placeholderTextColor={theme.subText + '80'}
                keyboardType="numeric"
                value={myTurn}
                onChangeText={setMyTurn}
                onFocus={() => setFocusedInput('myTurn')}
                onBlur={() => setFocusedInput(null)}
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.bg,
                    borderColor:
                      focusedInput === 'myTurn'
                        ? COLORS.primary
                        : theme.track || '#e5e7eb',
                  },
                ]}
              />

              {/* Aperçu live du pot */}
              {totalPot > 0 && (
                <View
                  style={[
                    styles.previewBox,
                    { backgroundColor: COLORS.primary + '12' },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewLabel,
                      { color: COLORS.primary },
                    ]}
                  >
                    APERÇU
                  </Text>
                  <View style={styles.previewRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.previewItemLabel,
                          { color: theme.subText },
                        ]}
                      >
                        Tu verses
                      </Text>
                      <Text
                        style={[
                          styles.previewItemValue,
                          { color: theme.text },
                        ]}
                      >
                        {amount} DH / mois
                      </Text>
                    </View>
                    <ArrowRight
                      size={16}
                      color={theme.subText}
                      strokeWidth={2.4}
                    />
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.previewItemLabel,
                          { color: theme.subText },
                        ]}
                      >
                        Tu recevras
                      </Text>
                      <Text
                        style={[
                          styles.previewItemValue,
                          { color: COLORS.primary, fontWeight: '900' },
                        ]}
                      >
                        {totalPot} DH
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.cancelBtn,
                  { borderColor: theme.track || '#e5e7eb' },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.cancelBtnText, { color: theme.subText }]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateDaret}
                style={styles.saveBtnWrapper}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#006233', '#004d25']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtn}
                >
                  <CheckCircle size={16} color="#fff" strokeWidth={2.8} />
                  <Text style={styles.saveBtnText}>Créer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* ============ HEADER ============ */
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  addButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  /* ============ CARTE DARET ============ */
  card: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef444418',
  },

  potRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  potBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#00623310',
    alignItems: 'center',
  },
  potBoxHighlight: {
    backgroundColor: '#d1fae5',
  },
  potBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  potBoxValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  potBoxUnit: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.7,
  },

  turnInfoBox: {
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  turnInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  turnInfoTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  turnInfoText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },

  /* ============ EMPTY STATE ============ */
  emptyState: {
    padding: 28,
    borderRadius: 22,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 8,
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
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  /* ============ MODAL ============ */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

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
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  previewBox: {
    padding: 14,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  previewItemValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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