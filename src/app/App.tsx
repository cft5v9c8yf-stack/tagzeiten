import { RouterProvider } from 'react-router';
import { router } from './router';
import { ThemeProvider } from './ThemeContext';

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
