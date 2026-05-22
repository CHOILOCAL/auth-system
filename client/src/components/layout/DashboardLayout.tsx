// ============================================================
// Design Philosophy: Precision Engineering
// - 사이드바 + 콘텐츠 영역 레이아웃
// - 인증 상태 표시 및 빠른 탐색
// ============================================================

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ShieldCheck, LayoutDashboard, User, Settings, MessageSquare,
  Lock, LogOut, Menu, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/routes';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: '대시보드', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: ROUTES.BOARD, label: '게시판', icon: <MessageSquare className="w-4 h-4" /> },
  { path: ROUTES.PROFILE, label: '프로필', icon: <User className="w-4 h-4" /> },
  { path: ROUTES.SETTINGS, label: '설정', icon: <Settings className="w-4 h-4" /> },
  { path: ROUTES.SECURITY, label: '보안', icon: <Lock className="w-4 h-4" /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();

  // Privacy: never show email in chrome. Nickname (with full_name fallback for
  // legacy data) is the only public identifier we render.
  const displayName = profile?.nickname || profile?.full_name || '사용자';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      {/* 로고 */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          SecureAuth
        </span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-sky-400' : ''}>{item.icon}</span>
              {item.label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-sky-400" />}
            </Link>
          );
        })}
      </nav>

      {/* 유저 프로필 */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate capitalize">
              {profile?.provider ?? '계정'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 데스크탑 사이드바 */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {navItems.find(n => n.path === location)?.label || '대시보드'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
