// ============================================================
// Design Philosophy: Precision Engineering
// - 중앙 집중식 라우트 관리로 일관성 보장
// - 보호된 라우트와 공개 라우트 명확히 분리
// ============================================================

export const ROUTES = {
  // 공개 라우트
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  AUTH_CALLBACK: '/auth/callback',

  // 보호된 라우트
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
  SECURITY: '/dashboard/security',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

export const PUBLIC_ROUTES: AppRoute[] = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.AUTH_CALLBACK,
];

export const PROTECTED_ROUTES: AppRoute[] = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.SECURITY,
];

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
};

export const isProtectedRoute = (path: string): boolean => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};
