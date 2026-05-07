// ============================================================
// Design Philosophy: Precision Engineering
// - 비대칭 2단 레이아웃: 좌측 브랜딩 + 우측 폼
// - Sky Blue 강조색, Plus Jakarta Sans 타이포그래피
// - 정밀한 에러 핸들링 및 소셜 로그인 통합
// ============================================================

import React, { useState } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff, ShieldCheck, Lock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSignIn, useSignInWithGoogle, useSignInWithKakao } from '@/hooks/useAuthActions';
import { ROUTES } from '@/lib/routes';
import styles from '@/styles/modules/auth.module.scss';

// ── 구글 아이콘 SVG ───────────────────────────────────────────
const GoogleIcon = () => (
  <svg className={styles.socialButtonIcon} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ── 카카오 아이콘 SVG ─────────────────────────────────────────
const KakaoIcon = () => (
  <svg className={styles.socialButtonIcon} viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.582 2 11c0 2.74 1.618 5.16 4.073 6.673L5.1 21l4.435-2.73C10.3 18.42 11.14 18.5 12 18.5c5.523 0 10-3.582 10-8S17.523 3 12 3z" fill="#3C1E1E"/>
  </svg>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const signIn = useSignIn();
  const googleSignIn = useSignInWithGoogle();
  const kakaoSignIn = useSignInWithKakao();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signIn.reset();
    await signIn.execute({ email, password, rememberMe });
  };

  const isLoading = signIn.loading || googleSignIn.loading || kakaoSignIn.loading;
  const currentError = signIn.error || googleSignIn.error || kakaoSignIn.error;

  return (
    <div className={styles.authLayout}>
      {/* ── 좌측 브랜딩 패널 ── */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <div className={styles.brandLogoIcon}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className={styles.brandLogoText}>SecureAuth</span>
          </div>

          <h1 className={styles.brandHeadline}>
            엔터프라이즈급<br />
            <span>보안 인증</span> 시스템
          </h1>
          <p className={styles.brandDescription}>
            Supabase 기반의 고도화된 인증 아키텍처. RLS 정책, PKCE 플로우,
            소셜 OAuth를 통한 완전한 보안 솔루션을 제공합니다.
          </p>

          <div className={styles.securityBadges}>
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-sky-400" />, text: 'Row Level Security (RLS) 적용' },
              { icon: <Lock className="w-4 h-4 text-sky-400" />, text: 'PKCE 플로우로 OAuth 보안 강화' },
              { icon: <Zap className="w-4 h-4 text-sky-400" />, text: '자동 토큰 갱신 및 세션 관리' },
            ].map((badge, i) => (
              <div key={i} className={styles.securityBadge}>
                <div className={styles.securityBadgeIcon}>{badge.icon}</div>
                <span className={styles.securityBadgeText}>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.brandStats}>
          {[
            { value: 'PKCE', label: '보안 플로우' },
            { value: 'RLS', label: '데이터 격리' },
            { value: '3종', label: '인증 방식' },
          ].map((stat, i) => (
            <div key={i} className={styles.brandStat}>
              <div className={styles.brandStatValue}>{stat.value}</div>
              <div className={styles.brandStatLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측 폼 패널 ── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* 모바일 로고 */}
          <div className={styles.mobileLogo}>
            <div className={styles.mobileLogoIcon}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className={styles.mobileLogoText}>SecureAuth</span>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>다시 오셨군요!</h2>
            <p className={styles.formSubtitle}>
              계정에 로그인하여 대시보드에 접근하세요.
            </p>
          </div>

          {/* 에러 배너 */}
          {currentError && (
            <div className={styles.errorBanner}>
              <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
              <p className={styles.errorBannerText}>{currentError.message}</p>
            </div>
          )}

          {/* 소셜 로그인 버튼 */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => googleSignIn.execute()}
              disabled={isLoading}
            >
              <GoogleIcon />
              {googleSignIn.loading ? '연결 중...' : 'Google로 계속하기'}
            </button>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => kakaoSignIn.execute()}
              disabled={isLoading}
              style={{ background: '#FEE500', borderColor: '#FEE500', color: '#3C1E1E' }}
            >
              <KakaoIcon />
              {kakaoSignIn.loading ? '연결 중...' : '카카오로 계속하기'}
            </button>
          </div>

          <div className={styles.divider}>
            <span>또는 이메일로 로그인</span>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="email">이메일 주소</label>
              <input
                id="email"
                type="email"
                className={styles.fieldInput}
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className="flex items-center justify-between mb-2">
                <label className={styles.fieldLabel} htmlFor="password" style={{ margin: 0 }}>비밀번호</label>
                <Link href={ROUTES.FORGOT_PASSWORD} className={`${styles.authLink} text-xs`}>
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.fieldInput}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                id="rememberMe"
                type="checkbox"
                className={styles.checkboxInput}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                로그인 상태 유지
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !email || !password}
            >
              {signIn.loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} />
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          <div className={styles.authLinkRow}>
            아직 계정이 없으신가요?{' '}
            <Link href={ROUTES.REGISTER} className={styles.authLink}>
              회원가입
            </Link>
          </div>

          {/* 보안 안내 */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit SSL 암호화로 보호됩니다</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
