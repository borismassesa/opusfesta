import { Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
  /** Slightly darker border, used for the first ("Guests") tile — mirrors the web dashboard. */
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <View
      className={`flex-1 rounded-2xl border bg-ed-surface p-4 ${
        accent ? 'border-ed-outline' : 'border-ed-outline-variant'
      }`}
    >
      <Text className="font-work-sans-medium text-xs uppercase tracking-wide text-ed-on-surface-variant">
        {label}
      </Text>
      <Text className="mt-1 font-space-grotesk-bold text-3xl text-ed-on-surface">{value}</Text>
      {hint ? (
        <Text className="mt-1 font-work-sans text-xs text-ed-on-surface-variant" numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
