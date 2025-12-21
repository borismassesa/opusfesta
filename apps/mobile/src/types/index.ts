// Re-export types from shared lib package
export * from '@thefesta/lib';

// Additional mobile-specific types
export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export interface FormFieldProps {
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
}

export interface FilterState {
  search: string;
  category?: string;
  city?: string;
  minRating?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

// App-specific types
export interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'sw';
}

export interface NotificationData {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'reminder';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface QRCodeData {
  eventId: string;
  guestId: string;
  timestamp: number;
}

export interface CameraPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

// Component prop types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface InputProps extends FormFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
}

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  margin?: 'none' | 'sm' | 'md' | 'lg';
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onPress?: () => void;
  disabled?: boolean;
  badge?: string | number;
}

export interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded' | 'square';
}

export interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  disabled?: boolean;
}

export interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export interface PickerProps {
  items: Array<{ label: string; value: any }>;
  selectedValue: any;
  onValueChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}
