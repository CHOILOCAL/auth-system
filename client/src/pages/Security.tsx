// ============================================================
// Design Philosophy: Precision Engineering
// - 보안 설정 페이지: 비밀번호 변경, 세션 관리
// ============================================================

import React, { useState, useMemo } from 'react';
import { Shield, Eye, EyeOff, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdatePassword } from '@/hooks/useAuthActions';
import { checkPasswordStrength } from '@/lib/utils/password';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import styles from '@/styles/modules/auth.module.scss';

const Security: React.FC = () => {
  const { user, signOut } = useAuth();
  const [, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const updatePassword = useUpdatePassword();

  const passwordStrength = useMemo(() => checkPasswordStrength(newPassword), [newPassword]);
  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isEmailProvider = !user?.app_metadata?.provider || user.app_metadata.provider === 'email';

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch || newPassword.length < 8) return;
    updatePassword.reset();
    await updatePassword.execute(newPassword);
    if (!updatePassword.error) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl space-y-4">
          {/* 보안 개요 */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                보안 점수
              </h3>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-3xl font-black text-sky-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user?.email_confirmed_at ? '85' : '60'}
              </span>
              <span className="text-slate-400 text-sm mb-1">/ 100</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${user?.email_confirmed_at ? 85 : 60}%`,
                  background: 'linear-gradient(90deg, #0EA5E9, #6366F1)'
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {user?.email_confirmed_at
                ? '이메일 인증이 완료되어 계정이 안전하게 보호됩니다.'
                : '이메일 인증을 완료하면 보안 점수가 향상됩니다.'}
            </p>
          </div>

          {/* 비밀번호 변경 */}
          {isEmailProvider && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                비밀번호 변경
              </h3>

              {updatePassword.success && (
                <div className={styles.successBanner}>
                  <CheckCircle2 className={`w-4 h-4 ${styles.successBannerIcon}`} />
                  <p className={styles.successBannerText}>비밀번호가 성공적으로 변경되었습니다.</p>
                </div>
              )}

              {updatePassword.error && (
                <div className={styles.errorBanner}>
                  <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
                  <p className={styles.errorBannerText}>{updatePassword.error.message}</p>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="new-pw">새 비밀번호</label>
                  <div className="relative">
                    <input
                      id="new-pw"
                      type={showNew ? 'text' : 'password'}
                      className={styles.fieldInput}
                      placeholder="새 비밀번호 (8자 이상)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      disabled={updatePassword.loading}
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
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
                  <label className={styles.fieldLabel} htmlFor="confirm-pw">새 비밀번호 확인</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    className={`${styles.fieldInput} ${passwordMismatch ? styles.fieldInputError : ''}`}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                  disabled={updatePassword.loading || !newPassword || passwordMismatch || newPassword.length < 8}
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
          )}

          {/* 소셜 로그인 사용자 안내 */}
          {!isEmailProvider && (
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg">
                <Shield className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-sky-700">소셜 로그인 계정</p>
                  <p className="text-xs text-sky-600 mt-0.5">
                    {user?.app_metadata?.provider === 'google' ? 'Google' : '카카오'} 계정으로 로그인 중입니다.
                    비밀번호는 해당 서비스에서 관리됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 세션 관리 */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              세션 관리
            </h3>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-700">현재 세션</p>
                <p className="text-xs text-slate-400 mt-0.5">현재 브라우저 세션</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                활성
              </span>
            </div>
            <button
              onClick={signOut}
              className="mt-3 flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              모든 세션에서 로그아웃
            </button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Security;
