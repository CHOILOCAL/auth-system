// ============================================================
// Design Philosophy: Precision Engineering
// - OAuth 콜백 처리 페이지
// - URL 파라미터에서 세션 자동 감지 및 처리
// ============================================================

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/routes';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 코드 파라미터 추출 (PKCE 플로우)
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          throw new Error(errorDescription || error);
        }

        if (code) {
          // PKCE 코드를 세션으로 교환
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 세션 확인
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setStatus('success');
          setTimeout(() => navigate(ROUTES.DASHBOARD), 1500);
        } else {
          throw new Error('세션을 생성할 수 없습니다.');
        }
      } catch (err) {
        const message = (err as Error).message || '인증 처리 중 오류가 발생했습니다.';
        setErrorMessage(message);
        setStatus('error');
        setTimeout(() => navigate(ROUTES.LOGIN), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-sky-100" />
              <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              로그인 처리 중
            </h2>
            <p className="text-sm text-slate-500">인증 정보를 확인하고 있습니다...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              로그인 성공!
            </h2>
            <p className="text-sm text-slate-500">대시보드로 이동합니다...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              인증 실패
            </h2>
            <p className="text-sm text-red-500 mb-1">{errorMessage}</p>
            <p className="text-xs text-slate-400">로그인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
