import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface EventType {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const eventTypes: EventType[] = [
  { id: 'wedding', name: 'Wedding', icon: 'heart', color: '#6a1b9a' },
  { id: 'kitchen-party', name: 'Kitchen Party', icon: 'restaurant', color: '#bfa2db' },
  { id: 'sendoff', name: 'Sendoff', icon: 'airplane', color: '#d9b53f' },
  { id: 'other', name: 'Other', icon: 'gift', color: '#e6b7a9' },
];

const cities = [
  'Dar es Salaam',
  'Arusha',
  'Dodoma',
  'Mwanza',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Other',
];

export function ProfileSetupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    eventType: '',
    eventDate: '',
    city: '',
  });
  const [animationValue] = useState(new Animated.Value(0));
  
  // Get registration data from navigation params (if new user)
  const params = route.params as { email?: string; password?: string; role?: string; isNewUser?: boolean } | undefined;
  const registrationData = params || {};

  React.useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 4) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      handleNext();
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // TODO: Save profile data and create initial event with backend API
    // await saveProfileData({ ...formData, role: registrationData.role });
    
    // If this is a new user completing registration, login now
    if (registrationData.isNewUser && registrationData.email && registrationData.password) {
      try {
        await login(registrationData.email, registrationData.password);
        // Navigation to home will be handled automatically by AuthContext
      } catch (error) {
        console.error('Auto-login after registration failed:', error);
        // If auto-login fails, navigate to login screen
        (navigation as any).navigate('Login');
      }
    } else {
      // Existing user just updating profile, navigate to home
      navigation.navigate('Home' as never);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="person" size={48} color="#6a1b9a" />
      </View>
      
      <Text style={styles.stepTitle}>What's your name?</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First name"
          value={formData.firstName}
          onChangeText={(text) => updateFormData('firstName', text)}
          placeholderTextColor="#7a7a7a"
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          value={formData.lastName}
          onChangeText={(text) => updateFormData('lastName', text)}
          placeholderTextColor="#7a7a7a"
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={48} color="#6a1b9a" />
      </View>
      
      <Text style={styles.stepTitle}>What are you planning?</Text>
      <Text style={styles.stepSubtitle}>Choose the type of event you're organizing</Text>

      <View style={styles.eventTypesContainer}>
        {eventTypes.map((eventType) => (
          <TouchableOpacity
            key={eventType.id}
            style={[
              styles.eventTypeCard,
              formData.eventType === eventType.id && styles.selectedEventType,
            ]}
            onPress={() => updateFormData('eventType', eventType.id)}
          >
            <View style={[styles.eventTypeIcon, { backgroundColor: eventType.color + '20' }]}>
              <Ionicons name={eventType.icon} size={24} color={eventType.color} />
            </View>
            <Text style={styles.eventTypeName}>{eventType.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="time" size={48} color="#6a1b9a" />
      </View>
      
      <Text style={styles.stepTitle}>When is your event?</Text>
      <Text style={styles.stepSubtitle}>Select your event date</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Event date (e.g., Dec 15, 2024)"
          value={formData.eventDate}
          onChangeText={(text) => updateFormData('eventDate', text)}
          placeholderTextColor="#7a7a7a"
        />
      </View>

      <TouchableOpacity style={styles.skipButton}>
        <Text style={styles.skipButtonText}>I don't know yet</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep4 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="location" size={48} color="#6a1b9a" />
      </View>
      
      <Text style={styles.stepTitle}>Where are you located?</Text>
      <Text style={styles.stepSubtitle}>Help us find vendors near you</Text>

      <ScrollView style={styles.citiesContainer} showsVerticalScrollIndicator={false}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityCard,
              formData.city === city && styles.selectedCity,
            ]}
            onPress={() => updateFormData('city', city)}
          >
            <Text style={[
              styles.cityName,
              formData.city === city && styles.selectedCityName,
            ]}>
              {city}
            </Text>
            {formData.city === city && (
              <Ionicons name="checkmark" size={20} color="#6a1b9a" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.firstName.trim() !== '';
      case 2: return formData.eventType !== '';
      case 3: return true; // Optional step
      case 4: return formData.city !== '';
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#faf9f6', '#f5f3f0']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / 4) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep} of 4
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            {currentStep < 4 && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === 4 ? 'Complete Setup' : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#d6d6d6',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6a1b9a',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#7a7a7a',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6a1b9a20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e2e2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2e2e2e',
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  eventTypesContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  eventTypeCard: {
    width: (width - 88) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEventType: {
    borderColor: '#6a1b9a',
    backgroundColor: '#6a1b9a10',
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e2e2e',
    textAlign: 'center',
  },
  citiesContainer: {
    width: '100%',
    maxHeight: 300,
  },
  cityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  selectedCity: {
    borderColor: '#6a1b9a',
    backgroundColor: '#6a1b9a10',
  },
  cityName: {
    fontSize: 16,
    color: '#2e2e2e',
    fontWeight: '500',
  },
  selectedCityName: {
    color: '#6a1b9a',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#7a7a7a',
    fontWeight: '500',
  },
  skipText: {
    fontSize: 16,
    color: '#7a7a7a',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#6a1b9a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#d6d6d6',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
