import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Show = (message: string) => void;

const ToastContext = createContext<Show>(() => {});

/** Short, quiet status messages ("Gespeichert", "Nicht gespeichert"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback<Show>((m) => {
    setMessage(m);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): Show => useContext(ToastContext);
