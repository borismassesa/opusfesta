import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ScrollViewProps {
  scrollable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ScreenWrapper({
  scrollable = true,
  className = '',
  children,
  ...props
}: ScreenWrapperProps) {
  const content = (
    <View className={`flex-1 px-5 pt-2 pb-4 ${className}`}>{children}</View>
  );

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1 bg-br-bg">{content}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-br-bg">
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
