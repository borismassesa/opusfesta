// Toast utility that uses the ToastProvider
// This is a singleton pattern to access toast from anywhere
let toastInstance: {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  loading: (message: string) => void;
} | null = null;

export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance;
}

export const toast = {
  success: (message: string, duration?: number) => {
    if (toastInstance) {
      toastInstance.success(message, duration);
    } else if (typeof window !== 'undefined') {
      // Fallback to console if toast provider not initialized
      console.log('Success:', message);
    }
  },
  error: (message: string, duration?: number) => {
    if (toastInstance) {
      toastInstance.error(message, duration);
    } else if (typeof window !== 'undefined') {
      console.error('Error:', message);
    }
  },
  info: (message: string, duration?: number) => {
    if (toastInstance) {
      toastInstance.info(message, duration);
    } else if (typeof window !== 'undefined') {
      console.log('Info:', message);
    }
  },
  loading: (message: string) => {
    if (toastInstance) {
      toastInstance.loading(message);
    } else if (typeof window !== 'undefined') {
      console.log('Loading:', message);
    }
  },
};
