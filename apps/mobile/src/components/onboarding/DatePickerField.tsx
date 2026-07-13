import { useState } from 'react';
import { View, Text, Pressable, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { shadowSoftSm } from '@/constants/theme';
import { useTheme } from '@/theme/useTheme';

interface DatePickerFieldProps {
  /** Currently selected date, or null when nothing has been picked yet. */
  value: Date | null;
  /** Called with the newly selected date once the user confirms. */
  onChange: (date: Date) => void;
  /** Text shown when no date is selected. */
  placeholder: string;
  /** Formats the selected date for display inside the field. */
  formatValue: (date: Date) => string;
  /** iOS wheel/Android calendar mode. Defaults to 'date'. */
  mode?: 'date';
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePickerField({
  value,
  onChange,
  placeholder,
  formatValue,
  mode = 'date',
  minimumDate,
  maximumDate,
}: DatePickerFieldProps) {
  const { editorial, effective } = useTheme();
  const [show, setShow] = useState(false);
  // Draft holds the wheel selection on iOS until the user taps "Done".
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const openPicker = () => {
    setDraft(value ?? new Date());
    setShow(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShow(false);
    if (event.type === 'set' && date) {
      onChange(date);
    }
  };

  const handleIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setDraft(date);
  };

  const confirmIos = () => {
    setShow(false);
    onChange(draft);
  };

  return (
    <View>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={value ? formatValue(value) : placeholder}
        className="flex-row items-center gap-2.5 bg-ed-surface-container-lowest rounded-input px-3.5 py-3.5"
        style={shadowSoftSm}
      >
        <Ionicons name="calendar-outline" size={18} color={editorial.onSurfaceVariant} />
        <Text className={`font-work-sans text-base flex-1 ${value ? 'text-ed-on-surface' : 'text-ed-on-surface-variant'}`}>
          {value ? formatValue(value) : placeholder}
        </Text>
      </Pressable>

      {/* Android: native dialog, mounted only while open */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: spinner inside a bottom sheet with an explicit confirm */}
      {Platform.OS === 'ios' && (
        <Modal visible={show} transparent animationType="slide" onRequestClose={() => setShow(false)}>
          {/* Anchor the sheet to the bottom; scrim fills the space above it. */}
          <View className="flex-1 justify-end">
            {/* Scrim tinted with purpleTints[900] (#2A1245) at 40% rather than raw black */}
            <Pressable
              style={StyleSheet.absoluteFill}
              className="bg-[rgba(42,18,69,0.4)]"
              onPress={() => setShow(false)}
            />
            <View className="bg-ed-surface-container-lowest rounded-t-card pb-6">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-ed-outline-variant">
                <Pressable onPress={() => setShow(false)} accessibilityRole="button">
                  <Text className="font-work-sans text-base text-ed-on-surface-variant">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable onPress={confirmIos} accessibilityRole="button">
                  <Text className="font-space-grotesk-bold text-base text-ed-primary-container">
                    Done
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                onChange={handleIosChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant={effective}
                style={{ height: 216, alignSelf: 'stretch' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
