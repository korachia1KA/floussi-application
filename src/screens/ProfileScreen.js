import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Image,
  Animated,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, updatePassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useTheme } from '../context/ThemeContext';
import { useBudget } from '../context/BudgetContext';
import { COLORS } from '../constants/theme';
import {
  User,
  Lock,
  LogOut,
  Trash2,
  Check,
  Camera,
  Mail,
  Shield,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, resetAllData } = useBudget();

  const [newName, setNewName] = useState(user?.displayName || '');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [imageMenuVisible, setImageMenuVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;

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
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Charger l'image
  useEffect(() => {
    const loadImage = async () => {
      if (user) {
        const savedImage = await AsyncStorage.getItem(
          `profile_pic_${user.uid}`
        );
        if (savedImage) setProfileImage(savedImage);
      }
    };
    loadImage();
  }, [user]);

  const pickImage = async () => {
    setImageMenuVisible(false);
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Oups',
        "Il faut la permission pour accéder à tes photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setProfileImage(newUri);
      if (user) {
        await AsyncStorage.setItem(`profile_pic_${user.uid}`, newUri);
      }
    }
  };

  const removeImage = async () => {
    setImageMenuVisible(false);
    setProfileImage(null);
    if (user) {
      await AsyncStorage.removeItem(`profile_pic_${user.uid}`);
    }
  };

  const handleImageAction = () => {
    if (!profileImage) {
      pickImage();
    } else {
      setImageMenuVisible(true);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === user?.displayName) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setSavingName(false);
      Alert.alert('Succès', 'Nom mis à jour avec succès.');
    } catch (e) {
      setSavingName(false);
      Alert.alert('Erreur', e.message);
    }
  };

  const handleUpdatePass = async () => {
    if (newPass.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères.'
      );
      return;
    }
    setSavingPass(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setNewPass('');
      setSavingPass(false);
      Alert.alert('Succès', 'Mot de passe mis à jour.');
    } catch (e) {
      setSavingPass(false);
      Alert.alert(
        'Erreur',
        'Reconnecte-toi pour changer le mot de passe par sécurité.'
      );
    }
  };

  const handleReset = () => {
    setResetModalVisible(true);
  };

  const confirmReset = () => {
    setResetModalVisible(false);
    resetAllData();
    Alert.alert('Succès', 'Toutes tes données ont été effacées.');
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    signOut(auth);
  };

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'MO';

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
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
          {/* ============ HEADER PROFIL ============ */}
          <View style={styles.headerSection}>
            {/* Avatar */}
            <Animated.View
              style={{ transform: [{ scale: avatarScale }] }}
            >
              <TouchableOpacity
                onPress={handleImageAction}
                activeOpacity={0.85}
                style={styles.imageWrapper}
              >
                {/* Bordure gradient */}
                <LinearGradient
                  colors={['#006233', '#10b981', '#c1272d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarRing}
                >
                  <View
                    style={[
                      styles.avatarInner,
                      { backgroundColor: theme.bg },
                    ]}
                  >
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.profileImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarContainer,
                          { backgroundColor: COLORS.primary },
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {initials}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>

                {/* Camera badge */}
                <View style={styles.cameraBadge}>
                  <Camera size={14} color="#fff" strokeWidth={2.8} />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Nom + email */}
            <Text
              style={[styles.nameTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {user?.displayName || 'Utilisateur'}
            </Text>

            <View style={styles.emailRow}>
              <Mail size={12} color={theme.subText} strokeWidth={2.4} />
              <Text style={[styles.emailText, { color: theme.subText }]}>
                {user?.email}
              </Text>
            </View>

            {/* Badge Premium/Actif */}
            <View style={styles.premiumBadge}>
              <Sparkles size={11} color={COLORS.primary} strokeWidth={2.6} />
              <Text
                style={[
                  styles.premiumText,
                  { color: COLORS.primary },
                ]}
              >
                Compte actif
              </Text>
            </View>
          </View>

          {/* ============ SECTION INFORMATIONS ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconBox,
                  { backgroundColor: COLORS.primary + '15' },
                ]}
              >
                <User size={16} color={COLORS.primary} strokeWidth={2.4} />
              </View>
              <Text
                style={[styles.sectionTitle, { color: theme.text }]}
              >
                Informations personnelles
              </Text>
            </View>

            <View
              style={[styles.card, { backgroundColor: theme.card }]}
            >
              <Text
                style={[styles.inputLabel, { color: theme.subText }]}
              >
                NOM COMPLET
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: theme.bg,
                    borderColor:
                      focusedInput === 'name'
                        ? COLORS.primary
                        : theme.track || '#e5e7eb',
                  },
                ]}
              >
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Ton nom complet"
                  placeholderTextColor={theme.subText + '80'}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  style={[styles.input, { color: theme.text }]}
                />
                <TouchableOpacity
                  onPress={handleUpdateName}
                  disabled={
                    !newName.trim() ||
                    newName === user?.displayName ||
                    savingName
                  }
                  style={[
                    styles.saveBtn,
                    (!newName.trim() ||
                      newName === user?.displayName ||
                      savingName) && { opacity: 0.4 },
                  ]}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ============ SECTION SÉCURITÉ ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconBox,
                  { backgroundColor: '#3b82f615' },
                ]}
              >
                <Shield size={16} color="#3b82f6" strokeWidth={2.4} />
              </View>
              <Text
                style={[styles.sectionTitle, { color: theme.text }]}
              >
                Sécurité
              </Text>
            </View>

            <View
              style={[styles.card, { backgroundColor: theme.card }]}
            >
              <Text
                style={[styles.inputLabel, { color: theme.subText }]}
              >
                NOUVEAU MOT DE PASSE
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: theme.bg,
                    borderColor:
                      focusedInput === 'pass'
                        ? '#3b82f6'
                        : theme.track || '#e5e7eb',
                  },
                ]}
              >
                <Lock size={16} color={theme.subText} strokeWidth={2.4} />
                <TextInput
                  value={newPass}
                  onChangeText={setNewPass}
                  placeholder="6 caractères minimum"
                  secureTextEntry={!showPass}
                  placeholderTextColor={theme.subText + '80'}
                  onFocus={() => setFocusedInput('pass')}
                  onBlur={() => setFocusedInput(null)}
                  style={[styles.input, { color: theme.text }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPass(!showPass)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPass ? (
                    <EyeOff size={16} color={theme.subText} strokeWidth={2.4} />
                  ) : (
                    <Eye size={16} color={theme.subText} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdatePass}
                  disabled={newPass.length < 6 || savingPass}
                  style={[
                    styles.saveBtn,
                    { backgroundColor: '#3b82f6' },
                    (newPass.length < 6 || savingPass) && {
                      opacity: 0.4,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ============ ZONE DANGER ============ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconBox,
                  { backgroundColor: '#ef444418' },
                ]}
              >
                <AlertTriangle
                  size={16}
                  color="#ef4444"
                  strokeWidth={2.4}
                />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: '#ef4444' },
                ]}
              >
                Zone de danger
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.8}
              style={[
                styles.dangerRow,
                {
                  backgroundColor: theme.card,
                  borderColor: '#ef444430',
                },
              ]}
            >
              <View
                style={[
                  styles.dangerIconBox,
                  { backgroundColor: '#ef444418' },
                ]}
              >
                <Trash2 size={18} color="#ef4444" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.dangerTitle, { color: theme.text }]}
                >
                  Réinitialiser mes données
                </Text>
                <Text
                  style={[
                    styles.dangerSubtitle,
                    { color: theme.subText },
                  ]}
                >
                  Efface toutes tes dépenses et recommence à zéro
                </Text>
              </View>
              <X size={16} color="#ef4444" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* ============ DÉCONNEXION ============ */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            style={styles.logoutBtnWrapper}
          >
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutBtn}
            >
              <LogOut size={18} color="#fff" strokeWidth={2.6} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Version app */}
          <Text style={[styles.versionText, { color: theme.subText }]}>
            Floussi · v1.0.0
          </Text>

          <View style={{ height: 60 }} />
        </Animated.View>
      </ScrollView>

      {/* ============ MODAL PHOTO ============ */}
      <Modal
        visible={imageMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setImageMenuVisible(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.bottomSheet, { backgroundColor: theme.card }]}
          >
            <View style={styles.handle} />

            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              Photo de profil
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: theme.subText }]}
            >
              Que veux-tu faire ?
            </Text>

            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.8}
              style={[
                styles.sheetAction,
                { backgroundColor: COLORS.primary + '15' },
              ]}
            >
              <Camera size={18} color={COLORS.primary} strokeWidth={2.4} />
              <Text
                style={[
                  styles.sheetActionText,
                  { color: COLORS.primary },
                ]}
              >
                Changer la photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={removeImage}
              activeOpacity={0.8}
              style={[
                styles.sheetAction,
                { backgroundColor: '#ef444415' },
              ]}
            >
              <Trash2 size={18} color="#ef4444" strokeWidth={2.4} />
              <Text
                style={[
                  styles.sheetActionText,
                  { color: '#ef4444' },
                ]}
              >
                Supprimer la photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setImageMenuVisible(false)}
              activeOpacity={0.7}
              style={styles.sheetCancel}
            >
              <Text
                style={[
                  styles.sheetCancelText,
                  { color: theme.subText },
                ]}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============ MODAL RESET ============ */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.alertBox, { backgroundColor: theme.card }]}
          >
            <View
              style={[
                styles.alertIconBox,
                { backgroundColor: '#ef444418' },
              ]}
            >
              <AlertTriangle size={26} color="#ef4444" strokeWidth={2.4} />
            </View>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              Tout effacer ?
            </Text>
            <Text
              style={[styles.alertSubtitle, { color: theme.subText }]}
            >
              Toutes tes dépenses, revenus et Darets seront définitivement
              supprimés. Cette action est irréversible.
            </Text>

            <View style={styles.alertActions}>
              <TouchableOpacity
                onPress={() => setResetModalVisible(false)}
                style={[
                  styles.alertCancelBtn,
                  { borderColor: theme.track || '#e5e7eb' },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.alertCancelText,
                    { color: theme.text },
                  ]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmReset}
                style={[
                  styles.alertConfirmBtn,
                  { backgroundColor: '#ef4444' },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.alertConfirmText}>
                  Tout effacer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============ MODAL LOGOUT ============ */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.alertBox, { backgroundColor: theme.card }]}
          >
            <View
              style={[
                styles.alertIconBox,
                { backgroundColor: '#ef444418' },
              ]}
            >
              <LogOut size={26} color="#ef4444" strokeWidth={2.4} />
            </View>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              Se déconnecter ?
            </Text>
            <Text
              style={[styles.alertSubtitle, { color: theme.subText }]}
            >
              Tu devras te reconnecter pour accéder à ton compte.
            </Text>

            <View style={styles.alertActions}>
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                style={[
                  styles.alertCancelBtn,
                  { borderColor: theme.track || '#e5e7eb' },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.alertCancelText,
                    { color: theme.text },
                  ]}
                >
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                style={[
                  styles.alertConfirmBtn,
                  { backgroundColor: '#ef4444' },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.alertConfirmText}>
                  Déconnexion
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 40,
  },

  /* ============ HEADER PROFIL ============ */
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#006233',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  nameTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#00623315',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00623330',
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /* ============ SECTIONS ============ */
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  /* ============ CARD ============ */
  card: {
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 12,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  /* ============ DANGER ============ */
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dangerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  dangerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 15,
  },

  /* ============ LOGOUT ============ */
  logoutBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    minHeight: 54,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  versionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 20,
    letterSpacing: 0.3,
  },

  /* ============ MODALS ============ */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 34,
    gap: 10,
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
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 14,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
  },
  sheetActionText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sheetCancel: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* ============ ALERT BOX ============ */
  alertBox: {
    margin: 24,
    marginBottom: 40,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  alertIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCancelText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  alertConfirmBtn: {
    flex: 1.2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  alertConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});