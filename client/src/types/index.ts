// ============================================================
// Design Philosophy: Precision Engineering
// - 정밀한 타입 시스템으로 런타임 에러 방지
// - 모든 인증 관련 타입을 중앙 집중 관리
// ============================================================

export interface UserProfile {
  id: string;
  /** Canonical public display name. */
  nickname: string;
  /** @deprecated Internal only; never display in UI. */
  email?: string | null;
  /** @deprecated Use `nickname`. */
  full_name?: string | null;
  avatar_url: string | null;
  provider: 'email' | 'google' | 'kakao';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
  };
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'USER_ALREADY_EXISTS'
  | 'WEAK_PASSWORD'
  | 'NETWORK_ERROR'
  | 'OAUTH_ERROR'
  | 'SESSION_EXPIRED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  agreeToTerms: boolean;
}

export interface OAuthProvider {
  id: 'google' | 'kakao';
  name: string;
  icon: string;
  color: string;
}

export type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email';

export interface RouteConfig {
  path: string;
  protected: boolean;
  redirectTo?: string;
}
