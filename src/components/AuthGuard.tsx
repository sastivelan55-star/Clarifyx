import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../services/api/authApi';
import LoginPage from '../pages/LoginPage';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setUser, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAuth();
  }, [setUser, logout]);

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  // if (!isAuthenticated) {
  //   return <LoginPage />;
  // }

  return <>{children}</>;
}
