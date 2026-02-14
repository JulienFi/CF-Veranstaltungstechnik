import { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';
import { TOAST_EVENT_NAME, type ToastType } from '../lib/toast';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [message.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/50 text-green-400',
    error: 'bg-red-500/10 border-red-500/50 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400'
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
        colors[message.type]
      } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      {icons[message.type]}
      <span className="flex-1 text-sm font-medium">{message.message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast: EventListener = (event) => {
      const customEvent = event as CustomEvent<Omit<ToastMessage, 'id'>>;
      const newToast: ToastMessage = {
        ...customEvent.detail,
        id: Date.now().toString()
      };
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);
    return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
