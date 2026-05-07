// ============================================================
// Design Philosophy: Precision Engineering
// - 전역 인증 상태를 Context로 중앙 집중 관리
// - Supabase Auth 이벤트 구독으로 실시간 세션 동기화
// - 메모이제이션으로 불필요한 리렌더링 방지
// ============================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getProfile, signOut as authSignOut } from '@/lib/supabase/auth';
import type { UserProfile, AuthError } from '@/types';

// ── Context 타입 정의 ─────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// ── Context 생성 ──────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Provider 컴포넌트 ─────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // 프로필 로드 함수
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData as UserProfile);
    } catch (err) {
      // 프로필이 없는 경우 (신규 가입 직후) 에러 무시
      console.warn('[AuthContext] 프로필 로드 실패:', err);
    }
  }, []);

  // 프로필 새로고침 (외부에서 호출 가능)
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await loadProfile(user.id);
    }
  }, [user?.id, loadProfile]);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await authSignOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => setError(null), []);

  // Supabase Auth 상태 변화 구독
  useEffect(() => {
    let mounted = true;

    // 초기 세션 로드
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('[AuthContext] 초기 세션 로드 실패:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Auth 상태 변화 이벤트 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('[AuthContext] Auth 이벤트:', event);

        setSession(newSession);
        setUser(newSession?.user ?? null);

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (newSession?.user) {
              await loadProfile(newSession.user.id);
            }
            setLoading(false);
            break;

          case 'SIGNED_OUT':
            setProfile(null);
            setLoading(false);
            break;

          case 'USER_UPDATED':
            if (newSession?.user) {
              await loadProfile(newSession.user.id);
            }
            break;

          case 'PASSWORD_RECOVERY':
            // 비밀번호 재설정 플로우 처리
            setLoading(false);
            break;

          default:
            setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Context 값 메모이제이션
  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    session,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    signOut,
    refreshProfile,
    clearError,
  }), [user, profile, session, loading, error, signOut, refreshProfile, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ── useAuth Hook ──────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('[useAuth] AuthProvider 내부에서만 사용 가능합니다.');
  }
  return context;
};

export default AuthContext;
