'use client';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './AuthContext';
import { FarmProvider } from './FarmContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <FarmProvider>
          {children}
        </FarmProvider>
      </AuthProvider>
    </SessionProvider>
  );
}