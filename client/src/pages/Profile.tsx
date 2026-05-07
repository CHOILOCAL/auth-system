// ============================================================
// Design Philosophy: Precision Engineering
// - 프로필 편집 페이지
// - 실시간 저장 피드백
// ============================================================

import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/supabase/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import styles from '@/styles/modules/auth.module.scss';

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updateProfile(user.id, { full_name: fullName });
      await refreshProfile();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg((err as Error).message || '저장 중 오류가 발생했습니다.');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl">
          {/* 프로필 헤더 */}
          <div className="bg-white rounded-xl border border-slate-100 p-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
                {avatarLetter}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {profile?.full_name || '이름 미설정'}
                </h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {user?.email_confirmed_at ? '이메일 인증 완료' : '이메일 미인증'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 프로필 편집 폼 */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                프로필 편집
              </h3>
            </div>

            {saveStatus === 'success' && (
              <div className={styles.successBanner}>
                <CheckCircle2 className={`w-4 h-4 ${styles.successBannerIcon}`} />
                <p className={styles.successBannerText}>프로필이 성공적으로 저장되었습니다.</p>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className={styles.errorBanner}>
                <AlertCircle className={`w-4 h-4 ${styles.errorBannerIcon}`} />
                <p className={styles.errorBannerText}>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-name">이름</label>
                <input
                  id="profile-name"
                  type="text"
                  className={styles.fieldInput}
                  placeholder="홍길동"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-email">이메일 (변경 불가)</label>
                <input
                  id="profile-email"
                  type="email"
                  className={styles.fieldInput}
                  value={user?.email || ''}
                  disabled
                  style={{ background: '#F8FAFC', color: '#94A3B8' }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>로그인 방식</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={profile?.provider === 'google' ? 'Google OAuth' : profile?.provider === 'kakao' ? '카카오 OAuth' : '이메일/비밀번호'}
                  disabled
                  style={{ background: '#F8FAFC', color: '#94A3B8' }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>가입일</label>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  disabled
                  style={{ background: '#F8FAFC', color: '#94A3B8' }}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={saving || !fullName.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {saving ? (
                  <>
                    <span className={styles.spinner} />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    변경사항 저장
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;
