// ============================================================
// Design Philosophy: Precision Engineering
// - 중앙 집중식 라우팅 및 인증 상태 관리
// - AuthProvider로 전역 인증 컨텍스트 제공
// - 보호된 라우트와 공개 라우트 명확히 분리
// ============================================================

import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ROUTES } from './lib/routes';

// ── 동적 임포트 (코드 스플리팅) ──────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Security = lazy(() => import('./pages/Security'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── 페이지 로딩 폴백 ─────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-sky-100" />
      <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* 공개 라우트 */}
        <Route path={ROUTES.HOME} component={Home} />
        <Route path={ROUTES.LOGIN} component={Login} />
        <Route path={ROUTES.REGISTER} component={Register} />
        <Route path={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} />
        <Route path={ROUTES.RESET_PASSWORD} component={ResetPassword} />
        <Route path={ROUTES.AUTH_CALLBACK} component={AuthCallback} />

        {/* 보호된 라우트 (각 페이지 내부에서 ProtectedRoute로 감싸짐) */}
        <Route path={ROUTES.DASHBOARD} component={Dashboard} />
        <Route path={ROUTES.PROFILE} component={Profile} />
        <Route path={ROUTES.SECURITY} component={Security} />
        <Route path={ROUTES.SETTINGS} component={SettingsPage} />

        {/* 404 폴백 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
