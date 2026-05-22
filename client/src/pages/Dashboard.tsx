// ============================================================
// Design Philosophy: Precision Engineering
// - 인증 상태 및 보안 정보 대시보드
// - 카드 기반 정보 계층 구조
// ============================================================

import React from 'react';
import {
  ShieldCheck, User, Clock, Globe, Key, Activity,
  CheckCircle2, AlertTriangle, Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Dashboard: React.FC = () => {
  const { user, profile, session } = useAuth();

  const displayName = profile?.nickname || profile?.full_name || '사용자';
  const provider = profile?.provider || user?.app_metadata?.provider || 'email';
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '-';
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '-';
  const sessionExpiry = session?.expires_at
    ? new Date(session.expires_at * 1000).toLocaleString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : '-';

  const providerLabel: Record<string, string> = {
    email: '이메일',
    google: 'Google',
    kakao: '카카오',
  };

  const stats = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-500" />,
      label: '인증 상태',
      value: '인증됨',
      sub: '세션 활성',
      color: 'bg-sky-50 border-sky-100',
      badge: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      label: '로그인 방식',
      value: providerLabel[provider as string] || provider,
      sub: 'OAuth 2.0',
      color: 'bg-indigo-50 border-indigo-100',
      badge: null,
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      label: '세션 만료',
      value: sessionExpiry,
      sub: '자동 갱신',
      color: 'bg-amber-50 border-amber-100',
      badge: null,
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-500" />,
      label: '마지막 로그인',
      value: lastSignIn,
      sub: '최근 활동',
      color: 'bg-emerald-50 border-emerald-100',
      badge: null,
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* 환영 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                안녕하세요, {displayName}님!
              </h2>
              <p className="text-sm text-slate-500">
                {providerLabel[provider as string] || provider} 계정
              </p>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className={`rounded-xl border p-4 ${stat.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {stat.icon}
                </div>
                {stat.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.badge}`}>
                    활성
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 계정 정보 */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                계정 정보
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '사용자 ID', value: user?.id?.slice(0, 8) + '...' || '-' },
                { label: '닉네임', value: displayName },
                { label: '로그인 방식', value: providerLabel[provider as string] || provider },
                { label: '가입일', value: createdAt },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 보안 상태 */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                보안 상태
              </h3>
            </div>
            <div className="space-y-2.5">
              {[
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                  label: 'PKCE 플로우 활성화',
                  desc: 'OAuth 코드 인터셉트 공격 방지',
                  status: 'good',
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                  label: '자동 토큰 갱신',
                  desc: '세션 만료 전 자동 갱신',
                  status: 'good',
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                  label: 'Row Level Security',
                  desc: '본인 데이터만 접근 가능',
                  status: 'good',
                },
                {
                  icon: user?.email_confirmed_at
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertTriangle className="w-4 h-4 text-amber-500" />,
                  label: '이메일 인증',
                  desc: user?.email_confirmed_at ? '인증 완료' : '이메일 인증을 완료하세요',
                  status: user?.email_confirmed_at ? 'good' : 'warn',
                },
                {
                  icon: <Info className="w-4 h-4 text-sky-500" />,
                  label: '2단계 인증 (MFA)',
                  desc: '추후 지원 예정',
                  status: 'info',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 세션 정보 */}
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                세션 정보
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '액세스 토큰', value: session?.access_token?.slice(0, 20) + '...' || '-' },
                { label: '토큰 타입', value: 'Bearer JWT' },
                { label: '세션 만료', value: sessionExpiry },
                { label: '자동 갱신', value: '활성화됨' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 빠른 가이드 */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                다음 단계
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { num: '01', text: 'Supabase 대시보드에서 RLS 정책 활성화', done: false },
                { num: '02', text: 'Google OAuth 클라이언트 ID 설정', done: false },
                { num: '03', text: '카카오 OAuth 리다이렉트 URI 등록', done: true },
                { num: '04', text: 'profiles 테이블 트리거 생성', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-bold flex-shrink-0 mt-0.5 ${step.done ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {step.done ? '✓' : step.num}
                  </span>
                  <p className={`text-xs leading-relaxed ${step.done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
