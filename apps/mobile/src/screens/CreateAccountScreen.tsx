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
    headerTitle: 'Get Started',
    brandTagline: 'Your day, delivered beautifully',
    welcomeTitle: "Let's Get Started!",
    welcomeSubtitle: 'Create your account and begin planning your special day',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a strong password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    createAccountButton: 'Create Account',
    alreadyHaveAccount: 'Already have an account? ',
    signInLink: 'Log In',
    passwordRequirements: 'Password Requirements:',
    minChars: 'At least 8 characters',
    uppercase: 'One uppercase letter',
    lowercase: 'One lowercase letter',
    number: 'One number',
    footerText: 'By continuing, you agree to our ',
    termsOfService: 'Terms of Service',
    and: ' and ',
    privacyPolicy: 'Privacy Policy',
    // Validation Errors
    emailRequired: 'Please enter your email address',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Please enter your password',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDontMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    // Success/Error Messages
    accountCreated: 'Account created successfully!',
    accountCreatedMessage: 'Welcome to The Festa!',
    signupError: 'Failed to create account. Please try again.',
  },
  sw: {
    headerTitle: 'Anza',
    brandTagline: 'Siku yako, imefikishwa kwa uzuri',
    welcomeTitle: 'Tuanze!',
    welcomeSubtitle: 'Unda akaunti yako na uanze kupanga siku yako maalum',
    emailLabel: 'Anwani ya Barua Pepe',
    emailPlaceholder: 'Weka barua pepe yako',
    passwordLabel: 'Nywila',
    passwordPlaceholder: 'Unda nywila imara',
    confirmPasswordLabel: 'Thibitisha Nywila',
    confirmPasswordPlaceholder: 'Thibitisha nywila yako',
    createAccountButton: 'Unda Akaunti',
    alreadyHaveAccount: 'Tayari una akaunti? ',
    signInLink: 'Ingia',
    passwordRequirements: 'Mahitaji ya Nywila:',
    minChars: 'Angalau herufi 8',
    uppercase: 'Herufi moja kubwa',
    lowercase: 'Herufi moja ndogo',
    number: 'Nambari moja',
    footerText: 'Kwa kuendelea, unakubali ',
    termsOfService: 'Masharti ya Huduma',
    and: ' na ',
    privacyPolicy: 'Sera ya Faragha',
    // Validation Errors
    emailRequired: 'Tafadhali weka anwani yako ya barua pepe',
    emailInvalid: 'Tafadhali weka anwani halali ya barua pepe',
    passwordRequired: 'Tafadhali weka nywila yako',
    confirmPasswordRequired: 'Tafadhali thibitisha nywila yako',
    passwordsDontMatch: 'Nywila hazifanani',
    passwordTooShort: 'Nywila lazima iwe na herufi 8 au zaidi',
    // Success/Error Messages
    accountCreated: 'Akaunti imeundwa kwa mafanikio!',
    accountCreatedMessage: 'Karibu The Festa!',
    signupError: 'Imeshindwa kuunda akaunti. Tafadhali jaribu tena.',
  },
};

export function CreateAccountScreen() {
  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  const t = translations[language as AppLanguage];
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return { valid: false, message: t.passwordTooShort };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain a number' };
    }
    return { valid: true, message: '' };
  };

  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { 
        strength: 0, 
        color: '#e0e0e0', 
        label: language === 'sw' ? 'Ingiza nywila' : 'Enter password',
        bars: 0 
      };
    }

    let strength = 0;
    let bars = 0;
    
    // Calculate strength based on criteria
    if (password.length >= 6) { strength++; bars = 1; }
    if (password.length >= 8) { strength++; bars = 2; }
    if (password.length >= 10) { strength++; }
    if (/[A-Z]/.test(password)) { strength++; }
    if (/[a-z]/.test(password)) { strength++; }
    if (/[0-9]/.test(password)) { strength++; }
    if (/[^A-Za-z0-9]/.test(password)) { strength++; bars = Math.max(bars, 3); }
    
    // Determine final bars and color based on cumulative strength
    if (strength >= 6) bars = 4;
    else if (strength >= 4) bars = 3;
    else if (strength >= 2) bars = 2;
    else bars = 1;
    
    const strengthLevels = {
      en: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'],
      sw: ['Dhaifu Sana', 'Dhaifu', 'Ya Wastani', 'Imara', 'Imara Sana']
    };
    
    const strengthMap = {
      1: { color: '#f44336', label: strengthLevels[language as AppLanguage][0] },  // Red
      2: { color: '#ff9800', label: strengthLevels[language as AppLanguage][1] },  // Orange
      3: { color: '#ffc107', label: strengthLevels[language as AppLanguage][2] },  // Amber
      4: { color: '#4caf50', label: strengthLevels[language as AppLanguage][3] },  // Green
      5: { color: '#2e7d32', label: strengthLevels[language as AppLanguage][4] }   // Dark Green
    };

    const level = Math.min(bars, 4) || 1;
    return { 
      strength: level, 
      color: strengthMap[level as keyof typeof strengthMap]?.color || strengthMap[1].color,
      label: strengthMap[level as keyof typeof strengthMap]?.label || strengthMap[1].label,
      bars: bars
    };
  };

  const handleSignUp = async () => {
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

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t.confirmPasswordRequired);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t.passwordsDontMatch);
      return;
    }

    try {
      // TODO: Implement signup API call
      // await createAccount(email, password);
      
      // Navigate to Role Selection with credentials
      // User will be logged in after completing full registration (role + profile)
      (navigation as any).navigate('RoleSelection', { 
        email, 
        password,
        isNewUser: true 
      });
    } catch (error) {
      Alert.alert('Error', t.signupError);
    }
  };

  const handleNavigateToLogin = () => {
    (navigation as any).navigate('Login');
  };

  const handleTermsPress = () => {
    (navigation as any).navigate('TermsOfService');
  };

  const handlePrivacyPress = () => {
    (navigation as any).navigate('PrivacyPolicy');
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
              <Text style={styles.welcomeTitle}>{t.welcomeTitle}</Text>
              <Text style={styles.welcomeSubtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{t.welcomeSubtitle}</Text>
            </View>

            {/* Create Account Form */}
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
                    onChangeText={setPassword}
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
                {password && (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthBar}>
                      {[1, 2, 3, 4].map((barIndex) => {
                        const strengthData = getPasswordStrength(password);
                        const isFilled = barIndex <= strengthData.bars;
                        return (
                          <View
                            key={barIndex}
                            style={[
                              styles.strengthSegment,
                              {
                                backgroundColor: isFilled ? strengthData.color : '#e0e0e0',
                                opacity: isFilled ? 1 : 0.3,
                              }
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Text style={[
                      styles.strengthText,
                      { color: getPasswordStrength(password).color }
                    ]}>
                      {getPasswordStrength(password).label}
                    </Text>
                  </View>
                )}
                {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t.confirmPasswordLabel}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6a1b9a" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="rgba(106, 27, 154, 0.5)"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#6a1b9a" 
                    />
                  </TouchableOpacity>
                </View>
                {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, (!email.trim() || !password.trim() || !confirmPassword.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={!email.trim() || !password.trim() || !confirmPassword.trim() || isLoading}
              >
                <Text style={styles.buttonText}>
                  {t.createAccountButton}
                </Text>
              </TouchableOpacity>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>{t.alreadyHaveAccount}</Text>
                <TouchableOpacity onPress={handleNavigateToLogin}>
                  <Text style={styles.switchLink}>{t.signInLink}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText} numberOfLines={1} adjustsFontSizeToFit>
                {t.footerText}
                <Text style={styles.footerLink} onPress={handleTermsPress}>
                  {t.termsOfService}
                </Text>
                {t.and}
                <Text style={styles.footerLink} onPress={handlePrivacyPress}>
                  {t.privacyPolicy}
                </Text>
              </Text>
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
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 14,
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
  passwordStrength: {
    marginTop: 12,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#6a1b9a',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#6a1b9a',
    textDecorationLine: 'underline',
  },
});

