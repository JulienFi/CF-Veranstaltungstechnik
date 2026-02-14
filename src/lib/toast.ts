export type ToastType = 'success' | 'error' | 'info';

export const TOAST_EVENT_NAME = 'show-toast';

interface ToastEventDetail {
  type: ToastType;
  message: string;
}

export function showToast(type: ToastType, message: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const event = new CustomEvent<ToastEventDetail>(TOAST_EVENT_NAME, {
    detail: { type, message },
  });
  window.dispatchEvent(event);
}
