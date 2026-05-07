// ============================================================
// Design Philosophy: Precision Engineering
// - 앱 설정 페이지
// ============================================================

import React from 'react';
import { Settings, Bell, Globe, Palette } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const SettingsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                일반 설정
              </h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: <Bell className="w-4 h-4 text-slate-400" />, label: '이메일 알림', desc: '로그인 알림 및 보안 경고 수신', enabled: true },
                { icon: <Globe className="w-4 h-4 text-slate-400" />, label: '언어', desc: '한국어 (Korean)', enabled: null },
                { icon: <Palette className="w-4 h-4 text-slate-400" />, label: '테마', desc: '라이트 모드', enabled: null },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  {item.enabled !== null && (
                    <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${item.enabled ? 'bg-sky-500' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm mt-0.5 transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-100 p-5">
            <h3 className="text-sm font-bold text-red-700 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              위험 구역
            </h3>
            <p className="text-xs text-red-500 mb-3">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
            <button className="text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
              계정 삭제
            </button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
