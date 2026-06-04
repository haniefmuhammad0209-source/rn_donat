import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load Cart component (only loads when needed)
const Cart = lazy(() => import('./components/Cart'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              <ToastProvider>
              <BrowserRouter>
                <Suspense fallback={null}>
                  <Cart />
                </Suspense>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
                    <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
              </ToastProvider>
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
