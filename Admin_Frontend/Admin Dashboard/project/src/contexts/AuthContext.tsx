import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials } from '../types/auth';
import { authApi } from '../api/auth';

/**
 * 🔧 DEV MODE FLAG
 * Set to false when backend auth is ready
 */
const DEV_AUTH_MODE = false;

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      /**
       * ✅ DEV MODE: auto-login admin
       */
      if (DEV_AUTH_MODE) {
        const devUser: AuthUser = {
          id: 1,
          name: 'Admin',
          email: 'admin@local.dev',
          role: 'ADMIN',
        };

        localStorage.setItem('authToken', 'dev-token');
        localStorage.setItem('authUser', JSON.stringify(devUser));
        setUser(devUser);
        setIsLoading(false);
        return;
      }

      /**
       * 🔐 REAL AUTH MODE (future)
       */
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (token && storedUser) {
        try {
          const isValid = await authApi.validateToken();
          if (isValid) {
            setUser(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
        } catch {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    /**
     * ✅ DEV LOGIN (any credentials allowed)
     */
    if (DEV_AUTH_MODE) {
      const devUser: AuthUser = {
        id: 1,
        name: 'Admin',
        email: credentials.email,
        role: 'ADMIN',
      };

      localStorage.setItem('authToken', 'dev-token');
      localStorage.setItem('authUser', JSON.stringify(devUser));
      setUser(devUser);
      return;
    }

    /**
     * 🔐 REAL LOGIN (future backend)
     */
    const response = await authApi.login(credentials);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('authUser', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = async () => {
    try {
      if (!DEV_AUTH_MODE) {
        await authApi.logout();
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
