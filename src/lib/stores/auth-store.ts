// src/lib/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

const DEMO_USERS = [
  { email: 'demo@example.com', password: 'demo123', name: 'Demo User', id: '1' },
  { email: 'test@example.com', password: 'test123', name: 'Test User', id: '2' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const user = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          const { password: _, ...userInfo } = user;
          set({ user: userInfo, isAuthenticated: true });
          return userInfo;
        } else {
          throw new Error('Invalid credentials');
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);