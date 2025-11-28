import { useState, useEffect } from 'react';
import { api, User } from '@/services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrent = async (token: string | null) => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getCurrentUser(token);
      setUser(data.user ?? null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchCurrent(token);

    // listen for storage changes (login in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        fetchCurrent(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, signOut };
};