import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ScrollViewProps {
  scrollable?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Overrides the safe area's default `bg-of-cream` — e.g. to extend a tinted
   * header zone up under the status bar. Leaves the rest of the app untouched. */
  backgroundColor?: string;
  /** Rendered inside the safe area but outside the ScrollView, so it stays
   * pinned in place while the rest of the screen scrolls underneath it. */
  stickyHeader?: React.ReactNode;
}

export function ScreenWrapper({
  scrollable = true,
  className = '',
  children,
  backgroundColor,
  stickyHeader,
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <View className={`flex-1 px-5 pt-2 pb-4 ${className}`}>{children}</View>
  );

  // Tinted-header mode: only the top inset + sticky header get `backgroundColor`.
  // The page base stays cream so the bottom safe-area inset never shows the tint
  // (see the "bottom peach leak" fix). Only used by screens that pass these props.
  if (backgroundColor) {
    return (
      <View className="flex-1 bg-of-cream">
        <SafeAreaView edges={['top']} style={{ backgroundColor }}>
          {stickyHeader}
        </SafeAreaView>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            {...props}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </View>
    );
  }

  if (!scrollable) {
    return <SafeAreaView className="flex-1 bg-of-cream">{content}</SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-of-cream">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}
