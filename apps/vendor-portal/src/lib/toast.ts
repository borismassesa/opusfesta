// Toast utility that uses the ToastProvider
// This is a singleton pattern to access toast from anywhere
let toastInstance: {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
} | null = null;

export function setToastInstance(instance: typeof toastInstance) {
  toastInstance = instance;
}

export const toast = {
  success: (message: string) => {
    if (toastInstance) {
      toastInstance.success(message);
    } else if (typeof window !== 'undefined') {
      // Fallback to console if toast provider not initialized
      console.log('Success:', message);
    }
  },
  error: (message: string) => {
    if (toastInstance) {
      toastInstance.error(message);
    } else if (typeof window !== 'undefined') {
      console.error('Error:', message);
    }
  },
  info: (message: string) => {
    if (toastInstance) {
      toastInstance.info(message);
    } else if (typeof window !== 'undefined') {
      console.log('Info:', message);
    }
  },
};
