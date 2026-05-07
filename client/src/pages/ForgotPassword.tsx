// ============================================================
// Design Philosophy: Precision Engineering
// - 비밀번호 재설정 이메일 발송 페이지
// - 성공/실패 상태 명확한 피드백
// ============================================================

import React, { useState } from 'react';
import { Link } from 'wouter';
import { ShieldCheck, Mail, ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useAuthActions';
import { ROUTES } from '@/lib/routes';
import styles from '@/styles/modules/auth.module.scss';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.reset();
    await forgotPassword.execute(email);
  };

  if (forgotPassword.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            이메일을 확인해주세요
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            <strong className="text-slate-700">{email}</strong>으로<br />
            비밀번호 재설정 링크를 발송했습니다.
          </p>
          <div className="bg-amber-50 rounded-lg p-4 text-left mb-6">
            <p className="text-xs text-amber-700 font-semibold mb-1">이메일이 오지 않나요?</p>
            <p className="text-xs text-amber-600">스팸 폴더를 확인하거나, 5분 후 다시 시도해주세요.</p>
          </div>
          <Link href={ROUTES.LOGIN} className="text-sm text-sky-500 font-semibold hover:text-sky-600 flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SecureAuth</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              비밀번호 재설정
            </h2>
            <p className="text-sm text-slate-500">
              가입한 이메일 주소를 입력하면<br />재설정 링크를 보내드립니다.
            </p>
          </div>

          {forgotPassword.error && (
            <div className={styles.errorBanner}>
              <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
              <p className={styles.errorBannerText}>{forgotPassword.error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reset-email">이메일 주소</label>
              <input
                id="reset-email"
                type="email"
                className={styles.fieldInput}
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={forgotPassword.loading}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={forgotPassword.loading || !email}
            >
              {forgotPassword.loading ? (
                <span className={styles.loadingRow}>
                  <span className={styles.spinner} />
                  발송 중...
                </span>
              ) : '재설정 링크 발송'}
            </button>
          </form>

          <div className={styles.authLinkRow}>
            <Link href={ROUTES.LOGIN} className={`${styles.authLink} flex items-center justify-center gap-1.5`}>
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
