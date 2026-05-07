// ============================================================
// Design Philosophy: Precision Engineering
// - 랜딩 페이지: 제품 소개 및 CTA
// - 비대칭 레이아웃, Sky Blue 강조색
// ============================================================

import React from 'react';
import { Link } from 'wouter';
import {
  ShieldCheck, Lock, Zap, Users, ArrowRight,
  CheckCircle2, Globe, Key, Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/routes';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-500" />,
      title: 'Row Level Security',
      desc: 'PostgreSQL RLS 정책으로 사용자별 데이터 완전 격리',
    },
    {
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      title: 'PKCE 플로우',
      desc: 'OAuth 코드 인터셉트 공격을 방지하는 보안 강화 플로우',
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: '자동 토큰 갱신',
      desc: '세션 만료 전 자동으로 액세스 토큰을 갱신',
    },
    {
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      title: '3종 OAuth 지원',
      desc: '이메일, Google, 카카오 로그인을 하나의 시스템으로',
    },
    {
      icon: <Database className="w-5 h-5 text-purple-500" />,
      title: '자동 프로필 생성',
      desc: 'Supabase 트리거로 가입 즉시 profiles 테이블 동기화',
    },
    {
      icon: <Key className="w-5 h-5 text-rose-500" />,
      title: '비밀번호 강도 검사',
      desc: '실시간 비밀번호 강도 측정 및 보안 가이드 제공',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              SecureAuth
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href={ROUTES.DASHBOARD} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-all" style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)' }}>
                대시보드
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href={ROUTES.LOGIN} className="text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
                  로그인
                </Link>
                <Link href={ROUTES.REGISTER} className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-all" style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)' }}>
                  무료 시작
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-sky-600">Supabase 기반 엔터프라이즈 인증</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              보안 인증을<br />
              <span style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                빠르게 구축
              </span>
              하세요
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-2xl">
              이메일, Google, 카카오 OAuth를 지원하는 고도화된 인증 시스템.
              RLS 정책, PKCE 플로우, 자동 세션 관리까지 모두 포함된 완전한 보안 솔루션입니다.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={ROUTES.REGISTER} className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all hover:shadow-lg" style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)' }}>
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href={ROUTES.LOGIN} className="flex items-center gap-2 text-sm font-semibold text-slate-700 px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                로그인
              </Link>
            </div>

            {/* 신뢰 지표 */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {[
                '✓ 무료 오픈소스',
                '✓ TypeScript 완전 지원',
                '✓ 반응형 디자인',
              ].map((item, i) => (
                <span key={i} className="text-xs text-slate-400 font-medium">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              엔터프라이즈급 보안 기능
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              처음부터 보안을 고려하여 설계된 인증 아키텍처
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기술 스택 섹션 */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  검증된 기술 스택
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  React, TypeScript, Supabase, TailwindCSS, SCSS Modules의 조합으로
                  유지보수가 쉽고 확장 가능한 구조를 제공합니다.
                </p>
                <div className="space-y-2">
                  {[
                    'React 19 + TypeScript + Vite',
                    'Supabase Auth (PKCE 플로우)',
                    'TailwindCSS + SCSS Modules 하이브리드',
                    'PostgreSQL RLS 정책',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Frontend', value: 'React + Vite', color: 'text-sky-400' },
                  { label: 'Auth', value: 'Supabase', color: 'text-emerald-400' },
                  { label: 'Styling', value: 'Tailwind + SCSS', color: 'text-purple-400' },
                  { label: 'Database', value: 'PostgreSQL', color: 'text-amber-400' },
                  { label: 'OAuth', value: 'Google + Kakao', color: 'text-rose-400' },
                  { label: 'Security', value: 'RLS + PKCE', color: 'text-indigo-400' },
                ].map((tech, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-slate-500 mb-1">{tech.label}</p>
                    <p className={`text-sm font-bold ${tech.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {tech.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            지금 바로 시작하세요
          </h2>
          <p className="text-slate-500 text-sm mb-6">무료로 가입하고 보안 대시보드를 경험해보세요.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={ROUTES.REGISTER} className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #0EA5E9, #0284C7)' }}>
              무료로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={ROUTES.LOGIN} className="text-sm font-semibold text-slate-600 px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
              이미 계정이 있나요?
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-600" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SecureAuth</span>
          </div>
          <p className="text-xs text-slate-400">
            Supabase 기반 고도화 인증 시스템 · Built with React + TypeScript
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Globe className="w-3.5 h-3.5" />
            <span>Powered by Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
