// Backward-compatible re-exports — jangan hapus file ini
// Komponen lama masih import dari sini
export { auth, db, storage, googleProvider, analytics } from './firebase/config';
export { authService } from './services/authService';
export { analyticsService as trackEvent } from './services/analyticsService';

// Legacy helpers — gunakan authService langsung di kode baru
import { authService } from './services/authService';
export const loginWithGoogle = () => authService.loginWithGoogle();
export const logout = () => authService.logout();
