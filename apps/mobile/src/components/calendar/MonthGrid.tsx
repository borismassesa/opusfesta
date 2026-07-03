import { View, Text, Pressable } from 'react-native';
import { editorial } from '@/constants/theme';
import { getMonthGridDates } from '@/lib/calendarMonth';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export type DayStatus = 'open' | 'manually-blocked' | 'booked';

interface MonthGridProps {
  year: number;
  monthIndex: number;
  statusByDate: Record<string, DayStatus>;
  onSelectDate: (date: string) => void;
  selectedDate?: string | null;
}

const STATUS_COLOR: Record<DayStatus, { bg: string; fg: string }> = {
  open: { bg: 'transparent', fg: editorial.onSurface },
  'manually-blocked': { bg: '#FCE8E6', fg: '#B3261E' },
  booked: { bg: editorial.primaryContainer, fg: '#ffffff' },
};

export function MonthGrid({ year, monthIndex, statusByDate, onSelectDate, selectedDate }: MonthGridProps) {
  const cells = getMonthGridDates(year, monthIndex);

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'WorkSans-Bold', fontSize: 11, color: editorial.onSurfaceVariant }}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((cell) => {
          const status = statusByDate[cell.date] ?? 'open';
          const colors = STATUS_COLOR[status];
          const isSelected = selectedDate === cell.date;

          return (
            <Pressable
              key={cell.date}
              disabled={!cell.inCurrentMonth}
              onPress={() => onSelectDate(cell.date)}
              style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bg,
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: editorial.onSurface,
                  opacity: cell.inCurrentMonth ? 1 : 0.25,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'WorkSans-Medium',
                    fontSize: 13,
                    color: cell.inCurrentMonth ? colors.fg : editorial.onSurfaceVariant,
                  }}
                >
                  {cell.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
