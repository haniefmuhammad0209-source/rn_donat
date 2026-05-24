import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const authService = {
  loginWithGoogle: () => signInWithPopup(auth, googleProvider),

  logout: () => signOut(auth),

  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
};
