import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { useBudget } from '../context/BudgetContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.42;

export default function AuthScreen() {
  const { refreshUser } = useBudget();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const sheetSlide = useRef(new Animated.Value(80)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrée de la feuille
    Animated.parallel([
      Animated.spring(sheetSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Flottement infini du logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await refreshUser();
      }
    } catch (e) {
      let msg = e.message;
      if (msg.includes('auth/invalid-email')) msg = "L'email est invalide.";
      if (
        msg.includes('auth/user-not-found') ||
        msg.includes('auth/wrong-password') ||
        msg.includes('auth/invalid-credential')
      ) msg = 'Email ou mot de passe incorrect.';
      if (msg.includes('auth/email-already-in-use')) msg = 'Cet email est déjà utilisé.';
      if (msg.includes('auth/weak-password')) msg = 'Mot de passe : 6 caractères minimum.';
      Alert.alert('Oups', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Info', "Saisis d'abord ton email puis réessaie.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email envoyé ! 🚀', 'Vérifie ta boîte mail.');
    } catch (e) {
      let msg = "Impossible d'envoyer l'email.";
      if (e.message.includes('auth/user-not-found')) msg = 'Aucun compte avec cet email.';
      Alert.alert('Erreur', msg);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#006233" />

      {/* ============================================
          HEADER DÉGRADÉ (zone colorée en haut)
          ============================================ */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        {/* Motif décoratif */}
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerCircle3} />
        <View style={styles.headerStripe} />

        {/* Logo flottant */}
        <Animated.View
          style={[styles.logoWrapper, { transform: [{ translateY: logoFloat }] }]}
        >
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </Animated.View>

        {/* Texte */}
        <Text style={styles.brandName}>Floussi</Text>
        <Text style={styles.brandTagline}>
          {isLogin ? 'Ravi de te revoir 🇲🇦' : 'Bienvenue au club 🇲🇦'}
        </Text>

        {/* Badge discret */}
        <View style={styles.headerBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            {isLogin ? 'Connexion sécurisée' : 'Nouveau compte'}
          </Text>
        </View>
      </Animated.View>

      {/* ============================================
          FEUILLE BLANCHE ARRONDIE (formulaire)
          ============================================ */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              opacity: sheetOpacity,
              transform: [{ translateY: sheetSlide }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Poignée */}
            <View style={styles.handle} />

            {/* Tabs Connexion / Inscription */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nom (inscription) */}
            {!isLogin && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nom complet</Text>
                <TextInput
                  placeholder="Ex : Amine Tazi"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  style={[
                    styles.input,
                    focusedInput === 'name' && styles.inputActive,
                  ]}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                placeholder="exemple@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputActive,
                ]}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Mot de passe */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Mot de passe</Text>
              <View
                style={[
                  styles.input,
                  styles.inputRow,
                  focusedInput === 'password' && styles.inputActive,
                ]}
              >
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.inputInner}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mot de passe oublié */}
            {isLogin && (
              <TouchableOpacity
                onPress={handleResetPassword}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}

            {/* Bouton principal */}
            <TouchableOpacity
              onPress={handleAuth}
              activeOpacity={0.85}
              disabled={loading}
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {isLogin ? 'Se connecter' : 'Créer mon compte'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Aide discrète */}
            <Text style={styles.helpText}>
              {isLogin
                ? 'Astuce : utilise ton email professionnel ou personnel.'
                : 'Choisis un mot de passe d’au moins 6 caractères.'}
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#006233',
  },

  // ============ HEADER DÉGRADÉ ============
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#006233',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#c1272d',
    opacity: 0.25,
  },
  headerCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    opacity: 0.06,
  },
  headerCircle3: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c1272d',
    opacity: 0.15,
  },
  headerStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#c1272d',
  },

  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ============ FEUILLE BLANCHE ============
  sheetWrapper: {
    flex: 1,
    marginTop: -28,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetContent: {
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // ============ TABS ============
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#006233',
  },

  // ============ CHAMPS ============
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f9fafb',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  inputActive: {
    borderColor: '#006233',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  eyeIcon: {
    fontSize: 18,
    paddingHorizontal: 8,
  },

  // ============ FORGOT ============
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -6,
  },
  forgotText: {
    color: '#006233',
    fontSize: 13,
    fontWeight: '700',
  },

  // ============ BOUTON PRINCIPAL ============
  primaryBtn: {
    backgroundColor: '#006233',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 4,
    shadowColor: '#006233',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ============ AIDE ============
  helpText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 16,
    fontWeight: '500',
    lineHeight: 16,
  },
});