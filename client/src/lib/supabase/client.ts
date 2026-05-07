// ============================================================
// Design Philosophy: Precision Engineering
// - 싱글톤 패턴으로 Supabase 클라이언트 인스턴스 관리
// - 환경변수 유효성 검증으로 런타임 에러 방지
// ============================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 환경변수 유효성 검증
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Supabase] 환경변수가 설정되지 않았습니다.\n' +
    'VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env 파일에 설정하세요.'
  );
}

// Supabase 클라이언트 싱글톤 인스턴스
let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // 세션을 localStorage에 자동 저장
        persistSession: true,
        // URL에서 세션 자동 감지 (OAuth 콜백 처리)
        detectSessionInUrl: true,
        // 자동 토큰 갱신
        autoRefreshToken: true,
        // 스토리지 키 커스터마이징
        storageKey: 'supabase-auth-token',
        // 플로우 타입: PKCE (보안 강화)
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'secure-auth-system/1.0.0',
        },
      },
      // 실시간 구독 설정
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseInstance;
};

// 편의를 위한 기본 export
export const supabase = getSupabaseClient();

// OAuth 리다이렉트 URL 생성 헬퍼
export const getOAuthRedirectUrl = (path: string = '/auth/callback'): string => {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}${path}`;
};
