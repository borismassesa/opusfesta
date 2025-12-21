import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export function RoleSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedRole, setSelectedRole] = useState<'COUPLE' | 'VENDOR' | null>(null);
  const [animationValue] = useState(new Animated.Value(0));
  
  // Get registration credentials from navigation params (if coming from CreateAccount)
  const params = route.params as { email?: string; password?: string; isNewUser?: boolean } | undefined;
  const registrationData = params || {};

  React.useEffect(() => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRoleSelect = (role: 'COUPLE' | 'VENDOR') => {
    setSelectedRole(role);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after animation, passing registration data forward
    setTimeout(() => {
      if (role === 'COUPLE') {
        (navigation as any).navigate('ProfileSetup', {
          ...registrationData,
          role: 'COUPLE'
        });
      } else {
        (navigation as any).navigate('VendorProfileSetup', {
          ...registrationData,
          role: 'VENDOR'
        });
      }
    }, 300);
  };

  const renderRoleCard = (
    role: 'COUPLE' | 'VENDOR',
    title: string,
    subtitle: string,
    description: string,
    icon: keyof typeof Ionicons.glyphMap,
    colors: readonly [string, string, ...string[]],
    isSelected: boolean
  ) => (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            {
              scale: animationValue,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.roleCard,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => handleRoleSelect(role)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={48} color="#ffffff" />
            </View>
            
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
            
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#faf9f6', '#f5f3f0']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What brings you to The Festa?</Text>
          <Text style={styles.subtitle}>
            Choose your role to get started with the right experience
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {renderRoleCard(
            'COUPLE',
            'I\'m planning an event',
            'Couple',
            'Create your perfect celebration with trusted vendors, planning tools, and secure payments.',
            'heart',
            ['#6a1b9a', '#8a2be2'],
            selectedRole === 'COUPLE'
          )}

          {renderRoleCard(
            'VENDOR',
            'I\'m a vendor',
            'Vendor',
            'Connect with couples, manage bookings, and grow your business with The Festa.',
            'briefcase',
            ['#d9b53f', '#fbc02d'],
            selectedRole === 'VENDOR'
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can change this later in your profile settings
          </Text>
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
    paddingTop: 80,
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e2e2e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 24,
  },
  cardContainer: {
    flex: 1,
    maxHeight: 280,
  },
  roleCard: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#6a1b9a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 250,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7a7a7a',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
