'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  /** True while password reset OTP verification is in progress.
   *  Guards onAuthStateChange from prematurely redirecting to home
   *  when Supabase emits SIGNED_IN during OTP recovery verification. */
  isPasswordResetInProgress: boolean;
  initialize: () => Promise<(() => void) | void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyPasswordResetOTP: (email: string, code: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isPasswordResetInProgress: false,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip user injection while password reset OTP verification is mid-execution.
      // supabase.auth.verifyOtp(type: 'recovery') emits SIGNED_IN internally,
      // which would otherwise switch the root router to home before updateUser completes.
      if (get().isPasswordResetInProgress) return;
      set({ user: session?.user ?? null });
    });

    // Return unsubscribe for cleanup
    return () => subscription.unsubscribe();
  },

  signInWithEmail: async (email, password) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithEmail: async (email, password) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },

  signInWithApple: async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });

    // Clear service worker caches on sign-out
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  },

  /** Request a password reset OTP email.
   *  Supabase responds identically for existing and non-existing emails
   *  (account enumeration protection). */
  requestPasswordReset: async (email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate') || msg.includes('too many')) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error('비밀번호 재설정 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  },

  /** Verify the OTP code received via email and set a new password.
   *
   *  Flow:
   *  1. verifyOtp(type: 'recovery') — establishes a temporary session.
   *  2. updateUser({ password }) — sets the new password on that session.
   *
   *  isPasswordResetInProgress flag prevents onAuthStateChange from
   *  switching the UI to home mid-flow. */
  verifyPasswordResetOTP: async (email: string, code: string, newPassword: string) => {
    const supabase = createClient();
    set({ isPasswordResetInProgress: true });
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });
      if (otpError) {
        const msg = otpError.message.toLowerCase();
        if (msg.includes('otp') || msg.includes('token') || msg.includes('invalid') || msg.includes('expired')) {
          throw new Error('코드가 일치하지 않거나 만료되었습니다. 새 코드를 요청해주세요.');
        }
        throw new Error('인증 코드 확인에 실패했습니다. 다시 시도해주세요.');
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        const msg = updateError.message.toLowerCase();
        if (msg.includes('password') && (msg.includes('short') || msg.includes('weak'))) {
          throw new Error('비밀번호가 너무 짧습니다. 6자 이상 입력해주세요.');
        }
        throw new Error('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
      }

      // Reflect the newly authenticated session AFTER updateUser completes
      // (bypasses the listener guard set above).
      const { data: { user } } = await supabase.auth.getUser();
      set({ user });
    } finally {
      set({ isPasswordResetInProgress: false });
    }
  },
}));
