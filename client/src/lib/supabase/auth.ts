// ============================================================
// Design Philosophy: Precision Engineering
// - 모든 Auth 관련 API 호출을 중앙 집중 관리
// - 에러 정규화로 일관된 에러 처리 보장
// ============================================================

import { supabase, getOAuthRedirectUrl } from './client';
import type { AuthError } from '@/types';
import type { LoginFormData, RegisterFormData } from '@/types';

// ── 에러 정규화 ──────────────────────────────────────────────

export const normalizeAuthError = (error: unknown): AuthError => {
  if (!error) return { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' };

  const msg = (error as { message?: string }).message || '';
  const status = (error as { status?: number }).status;

  // Supabase 에러 코드 매핑
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }
  if (msg.includes('Email not confirmed')) {
    return { code: 'EMAIL_NOT_CONFIRMED', message: '이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.' };
  }
  if (msg.includes('User already registered') || msg.includes('already been registered')) {
    return { code: 'USER_ALREADY_EXISTS', message: '이미 가입된 이메일 주소입니다.' };
  }
  if (msg.includes('Password should be at least')) {
    return { code: 'WEAK_PASSWORD', message: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }
  if (msg.includes('rate limit') || status === 429) {
    return { code: 'RATE_LIMIT_EXCEEDED', message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' };
  }
  if (msg.includes('JWT expired') || msg.includes('session_not_found')) {
    return { code: 'SESSION_EXPIRED', message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
    return { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.' };
  }
  if (msg.includes('OAuth') || msg.includes('provider')) {
    return { code: 'OAUTH_ERROR', message: '소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.' };
  }

  return { code: 'UNKNOWN_ERROR', message: msg || '오류가 발생했습니다. 다시 시도해주세요.', details: msg };
};

// ── 이메일 로그인 ─────────────────────────────────────────────

export const signInWithEmail = async ({ email, password }: LoginFormData) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw normalizeAuthError(error);
  return data;
};

// ── 이메일 회원가입 ───────────────────────────────────────────

export const signUpWithEmail = async ({ email, password, fullName }: RegisterFormData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        provider: 'email',
      },
      emailRedirectTo: getOAuthRedirectUrl('/auth/verify-email'),
    },
  });
  if (error) throw normalizeAuthError(error);
  return data;
};

// ── Google OAuth ──────────────────────────────────────────────

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl('/auth/callback'),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw normalizeAuthError(error);
  return data;
};

// ── Kakao OAuth ───────────────────────────────────────────────

export const signInWithKakao = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: getOAuthRedirectUrl('/auth/callback'),
    },
  });
  if (error) throw normalizeAuthError(error);
  return data;
};

// ── 로그아웃 ──────────────────────────────────────────────────

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw normalizeAuthError(error);
};

// ── 비밀번호 재설정 이메일 발송 ──────────────────────────────

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getOAuthRedirectUrl('/auth/reset-password'),
  });
  if (error) throw normalizeAuthError(error);
};

// ── 비밀번호 업데이트 ─────────────────────────────────────────

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw normalizeAuthError(error);
};

// ── 현재 세션 조회 ────────────────────────────────────────────

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw normalizeAuthError(error);
  return session;
};

// ── 현재 유저 조회 ────────────────────────────────────────────

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw normalizeAuthError(error);
  return user;
};

// ── 프로필 조회 ───────────────────────────────────────────────

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw normalizeAuthError(error);
  return data;
};

// ── 프로필 업데이트 ───────────────────────────────────────────

export const updateProfile = async (userId: string, updates: { full_name?: string; avatar_url?: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw normalizeAuthError(error);
  return data;
};
