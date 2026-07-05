import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  token: string;
  role: 'student' | 'teacher' | 'admin';
  profile?: any;
  settings?: {
    theme: 'light' | 'dark' | 'cosmic';
    language: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  theme: 'light' | 'dark' | 'cosmic';
  setTheme: (theme: 'light' | 'dark' | 'cosmic') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: 'student' | 'teacher' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'cosmic'>(() => {
    const saved = localStorage.getItem('englishup-theme') as 'light' | 'dark' | 'cosmic';
    if (saved && ['light', 'dark', 'cosmic'].includes(saved)) {
      return saved;
    }
    const systemIsDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemIsDark ? 'dark' : 'light';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'cosmic');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'cosmic') {
      root.classList.add('cosmic');
    }
    localStorage.setItem('englishup-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Sync with database profile
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (syncRes.ok) {
            const dbData = await syncRes.json();
            const dbTheme = dbData.settings?.theme;
            if (dbTheme && ['light', 'dark', 'cosmic'].includes(dbTheme)) {
              setThemeState(dbTheme);
            }
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              token,
              role: dbData.role || 'student',
              profile: dbData.profile,
              settings: dbData.settings,
            });
          } else {
            console.error('Failed to sync profile with backend database');
          }
        } catch (err) {
          console.error('Error during token/sync retrieval:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setTheme = async (newTheme: 'light' | 'dark' | 'cosmic') => {
    setThemeState(newTheme);
    if (user && user.token) {
      try {
        await fetch('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ theme: newTheme }),
        });
        setUser((prev) => prev ? { ...prev, settings: { ...prev.settings, theme: newTheme } } : null);
      } catch (err) {
        console.error('Error saving theme preference:', err);
      }
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('Google sign in error:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setRole = (newRole: 'student' | 'teacher' | 'admin') => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, theme, setTheme, loginWithGoogle, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
