import { RouterProvider } from 'react-router';
import { StoreProvider } from '../data/StoreContext';
import { router } from './router';
import { ThemeSync } from './ThemeContext';
import { ToastProvider } from './Toast';

export function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <ThemeSync />
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>
  );
}
