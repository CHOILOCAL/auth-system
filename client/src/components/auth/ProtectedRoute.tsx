// ============================================================
// Design Philosophy: Precision Engineering
// - 인증 상태에 따른 정밀한 라우트 보호
// - 로딩 중 스켈레톤 UI로 UX 향상
// ============================================================

import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// 전체 화면 로딩 스피너
const FullScreenLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-sky-100" />
        <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">인증 확인 중</p>
        <p className="text-xs text-slate-400 mt-1">잠시만 기다려주세요...</p>
      </div>
    </div>
  </div>
);

// 보호된 라우트 컴포넌트
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = ROUTES.LOGIN,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
};

// 이미 인증된 사용자를 리다이렉트하는 컴포넌트 (로그인 페이지 등)
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = ROUTES.DASHBOARD,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
