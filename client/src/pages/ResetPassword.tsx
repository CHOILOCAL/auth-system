// ============================================================
// Design Philosophy: Precision Engineering
// - 비밀번호 재설정 페이지 (이메일 링크 클릭 후)
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUpdatePassword } from '@/hooks/useAuthActions';
import { checkPasswordStrength } from '@/lib/utils/password';
import { ROUTES } from '@/lib/routes';
import styles from '@/styles/modules/auth.module.scss';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const updatePassword = useUpdatePassword();

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch || password.length < 8) return;
    updatePassword.reset();
    await updatePassword.execute(password);
  };

  if (updatePassword.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            비밀번호 변경 완료!
          </h2>
          <p className="text-sm text-slate-500 mb-6">새 비밀번호로 로그인하세요.</p>
          <Link href={ROUTES.LOGIN} className={styles.submitButton} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SecureAuth</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              새 비밀번호 설정
            </h2>
            <p className="text-sm text-slate-500">강력한 비밀번호를 설정하세요.</p>
          </div>

          {updatePassword.error && (
            <div className={styles.errorBanner}>
              <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
              <p className={styles.errorBannerText}>{updatePassword.error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="new-password">새 비밀번호</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.fieldInput}
                  placeholder="8자 이상 입력하세요"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={updatePassword.loading}
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
              {password.length > 0 && (
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
                  </p>
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="confirm-new-password">비밀번호 확인</label>
              <input
                id="confirm-new-password"
                type="password"
                className={`${styles.fieldInput} ${passwordMismatch ? styles.fieldInputError : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={updatePassword.loading}
              />
              {passwordMismatch && (
                <p className={styles.fieldError}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={updatePassword.loading || !password || passwordMismatch || password.length < 8}
            >
              {updatePassword.loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} />
                  변경 중...
                </span>
              ) : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
