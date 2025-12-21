import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Easing } from 'react-native';

const { width } = Dimensions.get('window');

type AppLanguage = 'en' | 'sw';

interface Slide {
  id: string;
  title: Record<AppLanguage, string>;
  description?: Record<AppLanguage, string>;
  backgroundImage: ImageSourcePropType;
}

const slides: Slide[] = [
  {
    id: 'planning',
    title: {
      en: 'Plan Your Perfect Wedding',
      sw: 'Panga Harusi Yako Kamili',
    },
    description: {
      en: 'Create detailed budgets, manage timelines, and track your wedding planning progress with ease.',
      sw: 'Unda bajeti za kina, dhibiti ratiba, na fuatilia maendeleo ya upangaji wa harusi yako kwa urahisi.',
    },
    backgroundImage: require('../../assets/table.jpg'),
  },
  {
    id: 'vendors',
    title: {
      en: 'Connect With Top Vendors',
      sw: 'Unganisha Na Wauzaji Bora',
    },
    description: {
      en: 'Find and collaborate with photographers, caterers, venues, and other wedding professionals.',
      sw: 'Tafuta na shirikiana na wapiga picha, wapishi, kumbi, na wataalamu wengine wa harusi.',
    },
    backgroundImage: require('../../assets/venue.jpg'),
  },
  {
    id: 'style',
    title: {
      en: 'Create Your Dream Style',
      sw: 'Unda Mtindo Wa Ndoto Zako',
    },
    description: {
      en: 'Discover inspiration for dresses, rings, decor, and create the wedding aesthetic you\'ve always wanted.',
      sw: 'Gundua msukumo wa gauni, pete, mapambo, na unda mtindo wa harusi ambao umekuwa ukitaka.',
    },
    backgroundImage: require('../../assets/ring_attire.jpg'),
  },
  {
    id: 'guests',
    title: {
      en: 'Celebrate With Loved Ones',
      sw: 'Sherehekea Na Wapenzi',
    },
    description: {
      en: 'Manage guest lists, send beautiful invitations, and create unforgettable memories with family and friends.',
      sw: 'Dhibiti orodha za wageni, tuma mialiko mizuri, na unda kumbukumbu zisizosahaulika na familia na marafiki.',
    },
    backgroundImage: require('../../assets/flowers_cards.jpg'),
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('en');
  const scrollViewRef = useRef<ScrollView | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    contentAnim.setValue(0);
    Animated.timing(contentAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [contentAnim, currentSlide]);

  const translateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [26, 0],
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const handleSkip = () => {
    // Go to last slide
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (slides.length - 1) * width,
        animated: true,
      });
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: (currentSlide + 1) * width,
          animated: true,
        });
      }
    }
  };

  const handleSignUp = () => {
    (navigation as any).navigate('CreateAccount');
  };

  const handleSignIn = () => {
    (navigation as any).navigate('Login');
  };

  const toggleLanguage = () => {
    setSelectedLanguage((prev) => (prev === 'en' ? 'sw' : 'en'));
  };

  const handlePaginationPress = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * width,
        animated: true,
      });
      setCurrentSlide(index);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
        ref={(ref) => {
          scrollViewRef.current = (ref as unknown as ScrollView) ?? null;
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ opacity: fadeAnim }}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const title = slide.title[selectedLanguage];
          const description = slide.description?.[selectedLanguage];

          const animatedStyles = isActive
            ? { opacity: contentAnim, transform: [{ translateY }] }
            : { opacity: 0.25, transform: [{ translateY: 18 }] };

          return (
            <View key={slide.id} style={styles.slide}>
              <ImageBackground
                source={slide.backgroundImage}
                style={styles.slideBackground}
                imageStyle={styles.slideBackgroundImage}
              >
                <LinearGradient
                  colors={['rgba(250, 249, 246, 0.3)', 'rgba(250, 249, 246, 0.6)', 'rgba(250, 249, 246, 0.85)']}
                  style={styles.overlay}
                />
                
                <View style={styles.slideInner}>
                  {/* Header with language toggle */}
                  <View style={styles.header}>
                    <TouchableOpacity
                      onPress={toggleLanguage}
                      activeOpacity={0.85}
                      style={styles.languageToggle}
                    >
                      <Text style={styles.languageText}>
                        {selectedLanguage === 'en' ? '🇺🇸 EN' : '🇹🇿 SW'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Main content */}
                  <Animated.View style={[styles.contentContainer, animatedStyles]}>
                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Description */}
                    {description && (
                      <Text style={styles.description}>{description}</Text>
                    )}
                  </Animated.View>

                  {/* Bottom navigation */}
                  <View style={styles.bottomSection}>
                    {/* Pagination dots */}
                    <View style={styles.pagination}>
                      {slides.map((_, paginationIndex) => (
                        <TouchableOpacity
                          key={paginationIndex}
                          onPress={() => handlePaginationPress(paginationIndex)}
                          style={[
                            styles.paginationDot,
                            paginationIndex === currentSlide && styles.paginationDotActive,
                          ]}
                        />
                      ))}
                    </View>

                    {index === slides.length - 1 ? (
                      // Last slide - Show Sign In/Sign Up buttons
                      <View style={styles.authButtonsContainer}>
                        <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
                          <Text style={styles.signUpButtonText}>
                            {selectedLanguage === 'sw' ? 'Anza' : 'Get Started'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleSignIn} style={styles.signInButton}>
                          <Text style={styles.signInButtonText}>
                            {selectedLanguage === 'sw' ? 'Ingia' : 'Log In'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      // Other slides - Show Skip/Next navigation
                      <View style={styles.navigationRow}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                          <Text style={styles.skipText}>
                            {selectedLanguage === 'sw' ? 'Ruka' : 'Skip'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                          <Ionicons name="arrow-forward" size={24} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  slide: {
    width,
    flex: 1,
  },
  slideBackground: {
    flex: 1,
  },
  slideBackgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(106, 27, 154, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(106, 27, 154, 0.3)',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a1b9a',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: '#2e2e2e',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(250, 249, 246, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#7a7a7a',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(250, 249, 246, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSection: {
    paddingTop: 10,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(106, 27, 154, 0.1)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6a1b9a',
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6a1b9a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6a1b9a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(106, 27, 154, 0.3)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6a1b9a',
    marginHorizontal: 4,
  },
  // Authentication buttons styles
  authButtonsContainer: {
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: '#6a1b9a',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  signInButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(106, 27, 154, 0.1)',
    borderWidth: 2,
    borderColor: '#6a1b9a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a1b9a',
  },
});
