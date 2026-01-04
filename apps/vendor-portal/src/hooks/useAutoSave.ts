import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseAutoSaveOptions {
  form: UseFormReturn<any>;
  onSave: (data: any) => void | Promise<void>;
  enabled?: boolean;
  delay?: number; // Delay in milliseconds before saving
}

export function useAutoSave<T extends Record<string, any>>({
  form,
  onSave,
  enabled = true,
  delay = 2000, // 2 seconds default
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((value) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Create a string representation of the form data for comparison
      const currentData = JSON.stringify(value);

      // Only save if data has changed
      if (currentData !== lastSavedRef.current) {
      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        try {
          // Validate form before saving
          const isValid = await form.trigger();
          if (isValid) {
            await onSave(value);
            lastSavedRef.current = currentData;
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, delay) as unknown as NodeJS.Timeout;
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, onSave, enabled, delay]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}
