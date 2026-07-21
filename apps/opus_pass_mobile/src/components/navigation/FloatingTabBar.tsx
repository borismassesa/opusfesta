import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/useTheme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: IoniconName }> = {
  index: { label: 'Home', icon: 'home' },
  cards: { label: 'Cards', icon: 'mail' },
  guests: { label: 'Guests', icon: 'people' },
  registry: { label: 'Registry', icon: 'cart' },
  chat: { label: 'Chat', icon: 'chatbubbles' },
};

const BAR_HEIGHT = 52;

const FLOATING_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

/**
 * Floating pill tab bar, replacing React Navigation's default edge-to-edge
 * bar (set via `tabBar` on <Tabs>). Tapping the circular search button
 * doesn't navigate — it expands in place into a search input, mirroring the
 * Home icon swapping in as the "close search" affordance (Zola-style).
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { editorial } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hideEvent = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      showEvent.remove();
      hideEvent.remove();
    };
  }, []);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    Keyboard.dismiss();
    if (!state.routes[state.index] || state.routes[state.index].name !== 'index') {
      navigation.navigate('index');
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: (keyboardOffset > 0 ? keyboardOffset : insets.bottom) + 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
      }}
    >
      {searchOpen ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close search"
            onPress={closeSearch}
            style={[
              {
                width: BAR_HEIGHT,
                height: BAR_HEIGHT,
                borderRadius: BAR_HEIGHT / 2,
                backgroundColor: 'rgba(255,255,255,0.94)',
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                alignItems: 'center',
                justifyContent: 'center',
              },
              FLOATING_SHADOW,
            ]}
          >
            <Ionicons name="home" size={20} color={editorial.onSurface} />
          </Pressable>

          <View
            style={[
              {
                flex: 1,
                height: BAR_HEIGHT,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.94)',
                borderRadius: BAR_HEIGHT / 2,
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                paddingHorizontal: 18,
              },
              FLOATING_SHADOW,
            ]}
          >
            <Ionicons name="search" size={18} color={editorial.onSurfaceVariant} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search OpusPass"
              placeholderTextColor={editorial.onSurfaceVariant}
              returnKeyType="search"
              style={{
                flex: 1,
                marginLeft: 10,
                fontFamily: 'WorkSans-Regular',
                fontSize: 15,
                color: editorial.onSurface,
              }}
            />
          </View>
        </>
      ) : (
        <>
          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                backgroundColor: 'rgba(255,255,255,0.94)',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                paddingVertical: 6,
                paddingHorizontal: 6,
              },
              FLOATING_SHADOW,
            ]}
          >
            {state.routes.map((route, index) => {
              const config = TAB_CONFIG[route.name];
              if (!config) return null;
              const focused = state.index === index;
              const color = focused ? editorial.secondary : editorial.onSurface;

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityLabel={config.label}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  }}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: focused ? editorial.surfaceContainer : 'transparent',
                  }}
                >
                  <Ionicons name={config.icon} size={22} color={color} />
                  <Text
                    numberOfLines={1}
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontFamily: 'WorkSans-SemiBold',
                      color,
                    }}
                  >
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            onPress={() => setSearchOpen(true)}
            style={[
              {
                width: BAR_HEIGHT,
                height: BAR_HEIGHT,
                borderRadius: BAR_HEIGHT / 2,
                backgroundColor: 'rgba(255,255,255,0.94)',
                borderWidth: 1,
                borderColor: editorial.outlineVariant,
                alignItems: 'center',
                justifyContent: 'center',
              },
              FLOATING_SHADOW,
            ]}
          >
            <Ionicons name="search" size={20} color={editorial.onSurface} />
          </Pressable>
        </>
      )}
    </View>
  );
}
