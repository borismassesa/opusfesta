import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

type AppLanguage = 'en' | 'sw';

const translations: Record<AppLanguage, any> = {
  en: {
    headerTitle: 'Welcome Back',
    brandTagline: 'Your day, delivered beautifully',
    welcomeBack: 'Welcome Back!',
    welcomeSubtitle: 'Sign in to continue to The Festa',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Log In',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account? ",
    signUpLink: 'Create Account',
    appleLoginButtonIOS: 'Face ID / Biometrics',
    appleLoginButtonAndroid: 'Biometrics / Fingerprint',
    appleLoginHint: 'Available if you registered with Apple ID or enabled device biometrics.',
    biometricLoginUnavailable: 'Biometric login is coming soon. Make sure you previously registered with biometrics on this device.',
    // Validation Errors
    emailRequired: 'Please enter your email address',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Please enter your password',
    // Success/Error Messages
    loginSuccess: 'Login successful!',
    loginError: 'Invalid email or password. Please try again.',
  },
  sw: {
    headerTitle: 'Karibu Tena',
    brandTagline: 'Siku yako, imefikishwa kwa uzuri',
    welcomeBack: 'Karibu Tena!',
    welcomeSubtitle: 'Ingia kuendelea kwa The Festa',
    emailLabel: 'Anwani ya Barua Pepe',
    emailPlaceholder: 'Weka barua pepe yako',
    passwordLabel: 'Nywila',
    passwordPlaceholder: 'Weka nywila yako',
    loginButton: 'Ingia',
    forgotPassword: 'Umesahau Nywila?',
    noAccount: 'Huna akaunti? ',
    signUpLink: 'Unda Akaunti',
    appleLoginButtonIOS: 'Face ID / Biometrics',
    appleLoginButtonAndroid: 'Biometrics / Fingerprint',
    appleLoginHint: 'Inapatikana ikiwa uliandikisha akaunti kwa Apple ID au biometric ya kifaa.',
    biometricLoginUnavailable: 'Kuingia kwa Biometric kunakuja hivi karibuni. Hakikisha uliwahi kujisajili kwa biometrics au umewezeshwa biometrics kwenye kifaa hiki.',
    // Validation Errors
    emailRequired: 'Tafadhali weka anwani yako ya barua pepe',
    emailInvalid: 'Tafadhali weka anwani halali ya barua pepe',
    passwordRequired: 'Tafadhali weka nywila yako',
    // Success/Error Messages
    loginSuccess: 'Umeingia kwa mafanikio!',
    loginError: 'Barua pepe au nywila si sahihi. Tafadhali jaribu tena.',
  },
};

export function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  const t = translations[language as AppLanguage];
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Email change handler with validation
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  // Password change handler
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleLogin = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError(t.emailRequired);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t.emailInvalid);
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError(t.passwordRequired);
      return;
    }

    try {
      // Call login from AuthContext
      await login(email, password);
      
      // Navigation is handled by AuthContext/AppNavigator after successful login
    } catch (error) {
      Alert.alert('Error', t.loginError);
    }
  };

  const handleNavigateToSignUp = () => {
    (navigation as any).navigate('CreateAccount');
  };

  const handleNavigateToForgotPassword = () => {
    (navigation as any).navigate('ForgotPassword');
  };

  const handleBiometricLogin = () => {
    Alert.alert('Biometric Login', t.biometricLoginUnavailable);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <TouchableOpacity
              style={styles.languageToggle}
              onPress={toggleLanguage}
            >
              <Text style={styles.languageText}>
                {language === 'en' ? '🇬🇧 EN' : '🇹🇿 SW'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>{t.welcomeBack}</Text>
              <Text style={styles.welcomeSubtitle}>{t.welcomeSubtitle}</Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.emailLabel}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#6a1b9a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                    placeholderTextColor="rgba(106, 27, 154, 0.5)"
                  />
                </View>
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.passwordLabel}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6a1b9a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="rgba(106, 27, 154, 0.5)"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#6a1b9a" 
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleNavigateToForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>{t.forgotPassword}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, (!email.trim() || !password.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim() || isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? '...' : t.loginButton}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={Platform.OS === 'ios' ? "scan-outline" : "finger-print-outline"} 
                  size={20} 
                  color="#6a1b9a" 
                  style={styles.biometricIcon} 
                />
                <Text style={styles.biometricButtonText}>
                  {Platform.OS === 'ios' ? t.appleLoginButtonIOS : t.appleLoginButtonAndroid}
                </Text>
              </TouchableOpacity>
              <Text style={styles.biometricHintText}>{t.appleLoginHint}</Text>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>{t.noAccount}</Text>
                <TouchableOpacity onPress={handleNavigateToSignUp}>
                  <Text style={styles.switchLink}>{t.signUpLink}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  languageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6a1b9a',
  },
  languageText: {
    color: '#6a1b9a',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2e2e2e',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    fontWeight: '400',
    lineHeight: 24,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 56,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6a1b9a',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: '#7a7a7a',
    fontStyle: 'italic',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e2e2e',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e2e2e',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2e2e2e',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6a1b9a',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6a1b9a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9e9e9e',
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: '#7a7a7a',
  },
  switchLink: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#7a7a7a',
    fontWeight: '500',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 56,
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#6a1b9a',
    shadowColor: '#6a1b9a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricButtonText: {
    color: '#6a1b9a',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  biometricHintText: {
    fontSize: 11,
    color: '#7a7a7a',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
