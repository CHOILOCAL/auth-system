// ============================================================
// Design Philosophy: Precision Engineering
// - 비밀번호 강도 표시기 포함 회원가입 폼
// - 실시간 유효성 검사 및 명확한 에러 메시지
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff, ShieldCheck, Lock, Users, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { useSignUp, useSignInWithGoogle, useSignInWithKakao } from '@/hooks/useAuthActions';
import { checkPasswordStrength } from '@/lib/utils/password';
import { ROUTES } from '@/lib/routes';
import styles from '@/styles/modules/auth.module.scss';

const GoogleIcon = () => (
  <svg className={styles.socialButtonIcon} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const KakaoIcon = () => (
  <svg className={styles.socialButtonIcon} viewBox="0 0 24 24" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 3C6.477 3 2 6.582 2 11c0 2.74 1.618 5.16 4.073 6.673L5.1 21l4.435-2.73C10.3 18.42 11.14 18.5 12 18.5c5.523 0 10-3.582 10-8S17.523 3 12 3z" fill="#3C1E1E"/>
  </svg>
);

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const signUp = useSignUp();
  const googleSignIn = useSignInWithGoogle();
  const kakaoSignIn = useSignInWithKakao();

  const passwordStrength = useMemo(
    () => checkPasswordStrength(formData.password),
    [formData.password]
  );

  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;
  const isLoading = signUp.loading || googleSignIn.loading || kakaoSignIn.loading;
  const currentError = signUp.error || googleSignIn.error || kakaoSignIn.error;

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch || !formData.agreeToTerms) return;
    signUp.reset();
    const result = await signUp.execute({
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      fullName: formData.fullName,
      agreeToTerms: formData.agreeToTerms,
    });
    if (result?.needsConfirmation) {
      setEmailSent(true);
    }
  };

  // 이메일 인증 안내 화면
  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            이메일을 확인해주세요
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            <strong className="text-slate-700">{formData.email}</strong>으로<br />
            인증 링크를 발송했습니다.
          </p>
          <div className="bg-sky-50 rounded-lg p-4 text-left mb-6">
            <p className="text-xs text-sky-700 font-medium mb-2">다음 단계:</p>
            <ol className="text-xs text-sky-600 space-y-1 list-decimal list-inside">
              <li>이메일 받은 편지함을 확인하세요</li>
              <li>인증 링크를 클릭하세요</li>
              <li>자동으로 로그인됩니다</li>
            </ol>
          </div>
          <Link href={ROUTES.LOGIN} className="text-sm text-sky-500 font-semibold hover:text-sky-600">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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
            지금 시작하세요<br />
            <span>무료로 가입</span>하고<br />
            보안을 경험하세요
          </h1>
          <p className={styles.brandDescription}>
            이메일, Google, 카카오 중 편한 방법으로 가입하세요.
            가입 즉시 보안 대시보드에 접근할 수 있습니다.
          </p>

          <div className={styles.securityBadges}>
            {[
              { icon: <Users className="w-4 h-4 text-sky-400" />, text: '소셜 로그인 3종 지원' },
              { icon: <ShieldCheck className="w-4 h-4 text-sky-400" />, text: '이메일 인증으로 계정 보호' },
              { icon: <Lock className="w-4 h-4 text-sky-400" />, text: 'bcrypt 비밀번호 해싱' },
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
            { value: '무료', label: '영구 무료' },
            { value: '즉시', label: '가입 완료' },
            { value: '100%', label: '보안 보장' },
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
          <div className={styles.mobileLogo}>
            <div className={styles.mobileLogoIcon}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className={styles.mobileLogoText}>SecureAuth</span>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>계정 만들기</h2>
            <p className={styles.formSubtitle}>
              몇 가지 정보를 입력하고 시작하세요.
            </p>
          </div>

          {currentError && (
            <div className={styles.errorBanner}>
              <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
              <p className={styles.errorBannerText}>{currentError.message}</p>
            </div>
          )}

          {/* 소셜 가입 버튼 */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => googleSignIn.execute()}
              disabled={isLoading}
            >
              <GoogleIcon />
              {googleSignIn.loading ? '연결 중...' : 'Google로 가입하기'}
            </button>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => kakaoSignIn.execute()}
              disabled={isLoading}
              style={{ background: '#FEE500', borderColor: '#FEE500', color: '#3C1E1E' }}
            >
              <KakaoIcon />
              {kakaoSignIn.loading ? '연결 중...' : '카카오로 가입하기'}
            </button>
          </div>

          <div className={styles.divider}>
            <span>또는 이메일로 가입</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* 이름 */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="fullName">이름</label>
              <input
                id="fullName"
                type="text"
                className={styles.fieldInput}
                placeholder="홍길동"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                autoComplete="name"
                required
                disabled={isLoading}
              />
            </div>

            {/* 이메일 */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-email">이메일 주소</label>
              <input
                id="reg-email"
                type="email"
                className={styles.fieldInput}
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange('email')}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-password">비밀번호</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.fieldInput}
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={handleChange('password')}
                  autoComplete="new-password"
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

              {/* 비밀번호 강도 표시기 */}
              {formData.password.length > 0 && (
                <div className={styles.passwordStrength}>
                  <div className={styles.passwordStrengthBar}>
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`${styles.passwordStrengthSegment} ${i < passwordStrength.score ? `${styles.active} ${styles[passwordStrength.strength]}` : ''}`}
                      />
                    ))}
                  </div>
                  <p className={styles.passwordStrengthLabel} style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                    {passwordStrength.suggestions[0] && ` · ${passwordStrength.suggestions[0]}`}
                  </p>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className={`${styles.fieldInput} ${passwordMismatch ? styles.fieldInputError : ''}`}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordMismatch && (
                <p className={styles.fieldError}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  비밀번호가 일치하지 않습니다
                </p>
              )}
              {!passwordMismatch && formData.confirmPassword.length > 0 && (
                <p className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  비밀번호가 일치합니다
                </p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className={styles.checkboxGroup}>
              <input
                id="agreeToTerms"
                type="checkbox"
                className={styles.checkboxInput}
                checked={formData.agreeToTerms}
                onChange={handleChange('agreeToTerms')}
              />
              <label htmlFor="agreeToTerms" className={styles.checkboxLabel}>
                <a href="#" className={styles.authLink}>이용약관</a> 및{' '}
                <a href="#" className={styles.authLink}>개인정보처리방침</a>에 동의합니다
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !formData.email || !formData.password || passwordMismatch || !formData.agreeToTerms}
            >
              {signUp.loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} />
                  가입 처리 중...
                </span>
              ) : '회원가입'}
            </button>
          </form>

          <div className={styles.authLinkRow}>
            이미 계정이 있으신가요?{' '}
            <Link href={ROUTES.LOGIN} className={styles.authLink}>
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
