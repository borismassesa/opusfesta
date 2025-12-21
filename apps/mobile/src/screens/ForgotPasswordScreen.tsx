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
import { useLanguage } from '@/contexts/LanguageContext';

type AppLanguage = 'en' | 'sw';

const translations: Record<AppLanguage, any> = {
  en: {
    headerTitle: 'Forgot Password',
    brandTagline: 'Your day, delivered beautifully',
    instructions: 'Enter your email address and we\'ll send you instructions to reset your password.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'Enter your email',
    sendResetButton: 'Send Reset Instructions',
    backToLogin: 'Back to Log In',
    // Validation Errors
    emailRequired: 'Please enter your email address',
    emailInvalid: 'Please enter a valid email address',
    // Success/Error Messages
    resetSent: 'Password reset instructions sent!',
    resetSentMessage: 'Check your email for instructions to reset your password.',
    resetError: 'Failed to send reset instructions. Please try again.',
  },
  sw: {
    headerTitle: 'Umesahau Nywila',
    brandTagline: 'Siku yako, imefikishwa kwa uzuri',
    instructions: 'Weka anwani yako ya barua pepe na tutakutumia maagizo ya kuweka upya nywila yako.',
    emailLabel: 'Anwani ya Barua Pepe',
    emailPlaceholder: 'Weka barua pepe yako',
    sendResetButton: 'Tuma Maagizo ya Kuweka Upya',
    backToLogin: 'Rudi Kuingia',
    // Validation Errors
    emailRequired: 'Tafadhali weka anwani yako ya barua pepe',
    emailInvalid: 'Tafadhali weka anwani halali ya barua pepe',
    // Success/Error Messages
    resetSent: 'Maagizo ya kuweka upya nywila yametumwa!',
    resetSentMessage: 'Angalia barua pepe yako kwa maagizo ya kuweka upya nywila yako.',
    resetError: 'Imeshindwa kutuma maagizo. Tafadhali jaribu tena.',
  },
};

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();
  
  const t = translations[language as AppLanguage];
  
  // Form inputs
  const [email, setEmail] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState('');

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

  const handleSendReset = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError(t.emailRequired);
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(t.emailInvalid);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement password reset API call
      // await sendPasswordResetEmail(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        t.resetSent,
        t.resetSentMessage,
        [
          {
            text: 'OK',
            onPress: () => (navigation as any).navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', t.resetError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    (navigation as any).navigate('Login');
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={24} color="#6a1b9a" />
            </TouchableOpacity>
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
            {/* Branding */}
            <View style={styles.brandingContainer}>
              <Text style={styles.brandTitle}>The Festa</Text>
              <Text style={styles.brandTagline}>{t.brandTagline}</Text>
            </View>

            {/* Form Title */}
            <Text style={styles.formTitle}>{t.headerTitle}</Text>
            
            {/* Instructions */}
            <Text style={styles.instructions}>{t.instructions}</Text>

            {/* Forgot Password Form */}
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

              <TouchableOpacity
                style={[styles.button, (!email.trim() || isLoading) && styles.buttonDisabled]}
                onPress={handleSendReset}
                disabled={!email.trim() || isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? '...' : t.sendResetButton}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <Ionicons name="arrow-back" size={16} color="#6a1b9a" />
                <Text style={styles.backToLoginText}>{t.backToLogin}</Text>
              </TouchableOpacity>
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
  backButton: {
    padding: 8,
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
    paddingHorizontal: 32,
    paddingTop: 20,
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
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#7a7a7a',
    lineHeight: 20,
    marginBottom: 32,
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
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2e2e2e',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6a1b9a',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6a1b9a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  backToLoginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '600',
  },
});

