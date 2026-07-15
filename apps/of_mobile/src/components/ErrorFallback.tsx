import { Pressable, Text, View } from 'react-native';

export function ErrorFallback({
  error,
  retry,
  title = 'Something went wrong',
}: {
  error: Error;
  retry: () => void;
  title?: string;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-5">
        <Text className="font-work-sans-bold text-base text-red-900">{title}</Text>
        <Text className="mt-2 font-work-sans text-sm leading-5 text-red-800">{error.message}</Text>
        <Pressable
          onPress={retry}
          className="mt-4 self-start rounded-button bg-of-primary px-4 py-2.5"
        >
          <Text className="font-work-sans-bold text-xs text-white">Try again</Text>
        </Pressable>
      </View>
    </View>
  );
}
