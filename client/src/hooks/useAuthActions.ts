// ============================================================
// Design Philosophy: Precision Engineering
// - 인증 액션을 캡슐화한 커스텀 훅
// - 로딩 상태와 에러 처리를 자동으로 관리
// - 각 액션의 결과를 타입 안전하게 반환
// ============================================================

import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithKakao,
  sendPasswordResetEmail,
  updatePassword,
} from '@/lib/supabase/auth';
import type { LoginFormData, RegisterFormData, AuthError } from '@/types';
import { ROUTES } from '@/lib/routes';

interface ActionState {
  loading: boolean;
  error: AuthError | null;
  success: boolean;
}

const initialState: ActionState = {
  loading: false,
  error: null,
  success: false,
};

// ── 이메일 로그인 Hook ────────────────────────────────────────

export const useSignIn = () => {
  const [state, setState] = useState<ActionState>(initialState);
  const [, navigate] = useLocation();

  const execute = useCallback(async (data: LoginFormData) => {
    setState({ loading: true, error: null, success: false });
    try {
      await signInWithEmail(data);
      setState({ loading: false, error: null, success: true });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
    }
  }, [navigate]);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};

// ── 이메일 회원가입 Hook ──────────────────────────────────────

export const useSignUp = () => {
  const [state, setState] = useState<ActionState>(initialState);

  const execute = useCallback(async (data: RegisterFormData) => {
    setState({ loading: true, error: null, success: false });
    try {
      const result = await signUpWithEmail(data);
      // 이메일 인증이 필요한 경우 (identities가 비어있으면 이미 가입된 계정)
      const needsConfirmation = !result.session;
      setState({ loading: false, error: null, success: true });
      return { needsConfirmation };
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
      return { needsConfirmation: false };
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};

// ── Google OAuth Hook ─────────────────────────────────────────

export const useSignInWithGoogle = () => {
  const [state, setState] = useState<ActionState>(initialState);

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, success: false });
    try {
      await signInWithGoogle();
      // OAuth는 리다이렉트 방식이므로 성공 상태 설정 후 페이지 이동
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};

// ── Kakao OAuth Hook ──────────────────────────────────────────

export const useSignInWithKakao = () => {
  const [state, setState] = useState<ActionState>(initialState);

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, success: false });
    try {
      await signInWithKakao();
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};

// ── 비밀번호 재설정 Hook ──────────────────────────────────────

export const useForgotPassword = () => {
  const [state, setState] = useState<ActionState>(initialState);

  const execute = useCallback(async (email: string) => {
    setState({ loading: true, error: null, success: false });
    try {
      await sendPasswordResetEmail(email);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};

// ── 비밀번호 업데이트 Hook ────────────────────────────────────

export const useUpdatePassword = () => {
  const [state, setState] = useState<ActionState>(initialState);

  const execute = useCallback(async (newPassword: string) => {
    setState({ loading: true, error: null, success: false });
    try {
      await updatePassword(newPassword);
      setState({ loading: false, error: null, success: true });
    } catch (err) {
      setState({ loading: false, error: err as AuthError, success: false });
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { ...state, execute, reset };
};
