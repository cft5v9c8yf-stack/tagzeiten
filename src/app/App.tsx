import { RouterProvider } from 'react-router';
import { DemoSetup } from '../demo/DemoSetup';
import { StoreProvider } from '../data/StoreContext';
import { router } from './router';
import { ThemeSync } from './ThemeContext';
import { ToastProvider } from './Toast';

export function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <ThemeSync />
        {import.meta.env.MODE === 'demo' && <DemoSetup />}
        <RouterProvider router={router} />
      </StoreProvider>
    </ToastProvider>
  );
}
