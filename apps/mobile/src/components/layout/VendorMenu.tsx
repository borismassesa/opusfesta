import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { shadowSoft } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

type IonIcon = keyof typeof Ionicons.glyphMap;

const MENU_ITEMS: {
  key: string;
  label: string;
  icon: IonIcon;
  route: string;
}[] = [
  { key: 'bookings', label: 'Bookings', icon: 'briefcase-outline', route: '/(vendor-tabs)/bookings' },
  { key: 'team', label: 'Team', icon: 'people-outline', route: '/(vendor-tabs)/team' },
  { key: 'storefront', label: 'Storefront', icon: 'storefront-outline', route: '/(vendor-tabs)/storefront' },
];

const RADIUS = 110;
const ITEM_COUNT = MENU_ITEMS.length;
const START_ANGLE = 130;
const END_ANGLE = 50;
const ANGLE_STEP = (START_ANGLE - END_ANGLE) / (ITEM_COUNT - 1);
const ARC_ANGLES = Array.from({ length: ITEM_COUNT }, (_, i) => START_ANGLE - i * ANGLE_STEP);

const POSITIONS = ARC_ANGLES.map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: Math.cos(rad) * RADIUS,
    y: -Math.sin(rad) * RADIUS,
  };
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VendorMenuProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Radial overlay for less-frequently-used vendor tools, mirroring
 * PlanningMenu's pattern on the couple side (Home/Leads/Calendar/Messages
 * get direct tabs; Bookings/Storefront sit behind the center button).
 */
export function VendorMenu({ visible, onClose }: VendorMenuProps) {
  const router = useRouter();
  const { editorial } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(30,27,23,0.5)', opacity: backdropOpacity },
          ]}
        />
      </Pressable>

      {MENU_ITEMS.map((item, index) => {
        const pos = POSITIONS[index];

        const itemScale = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
        const itemOpacity = animValue.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0, 1] });
        const translateX = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, pos.x] });
        const translateY = animValue.interpolate({ inputRange: [0, 1], outputRange: [40, pos.y] });

        return (
          <Animated.View
            key={item.key}
            style={{
              position: 'absolute',
              bottom: 56,
              left: SCREEN_WIDTH / 2 - 36,
              transform: [{ translateX }, { translateY }, { scale: itemScale }],
              opacity: itemOpacity,
              alignItems: 'center',
              width: 72,
            }}
            pointerEvents="auto"
          >
            <Pressable
              onPress={() => {
                onClose();
                router.push(item.route as any);
              }}
              style={{ alignItems: 'center' }}
            >
              <View
                style={[
                  {
                    width: 60,
                    height: 60,
                    borderRadius: 12,
                    backgroundColor: editorial.primaryContainer,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  shadowSoft,
                ]}
              >
                <Ionicons name={item.icon} size={26} color="#fff" />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'WorkSans-Bold',
                  color: '#fff',
                  textAlign: 'center',
                  marginTop: 8,
                }}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
