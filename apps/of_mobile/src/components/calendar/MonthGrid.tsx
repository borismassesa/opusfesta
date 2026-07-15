import { View, Text, Pressable } from 'react-native';
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

const STATUS_CLASSES: Record<DayStatus, { bg: string; fg: string }> = {
  open: { bg: 'bg-transparent', fg: 'text-ed-on-surface' },
  'manually-blocked': { bg: 'bg-[#FCE8E6]', fg: 'text-ed-error' },
  booked: { bg: 'bg-ed-primary-container', fg: 'text-white' },
};

export function MonthGrid({ year, monthIndex, statusByDate, onSelectDate, selectedDate }: MonthGridProps) {
  const cells = getMonthGridDates(year, monthIndex);

  return (
    <View>
      <View className="flex-row mb-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="font-work-sans-bold text-[11px] text-ed-on-surface-variant">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((cell) => {
          const status = statusByDate[cell.date] ?? 'open';
          const cls = STATUS_CLASSES[status];
          const isSelected = selectedDate === cell.date;

          return (
            <Pressable
              key={cell.date}
              disabled={!cell.inCurrentMonth}
              onPress={() => onSelectDate(cell.date)}
              className="w-[14.2857%] aspect-square items-center justify-center p-0.5"
            >
              <View
                className={`w-[34px] h-[34px] rounded-[10px] items-center justify-center ${cls.bg} ${
                  isSelected ? 'border-2 border-ed-on-surface' : 'border-0'
                } ${cell.inCurrentMonth ? 'opacity-100' : 'opacity-25'}`}
              >
                <Text className={`font-work-sans-medium text-[13px] ${cell.inCurrentMonth ? cls.fg : 'text-ed-on-surface-variant'}`}>
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
