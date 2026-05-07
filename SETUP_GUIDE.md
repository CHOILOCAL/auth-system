# SecureAuth - 설정 가이드

> Supabase 기반 고도화 인증 시스템의 완전한 설정 가이드입니다.

---

## 1. 프로젝트 구조

```
supabase-auth-system/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx     # 인증 보호 라우트
│   │   │   └── layout/
│   │   │       └── DashboardLayout.tsx    # 대시보드 레이아웃
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx            # 전역 인증 상태 관리
│   │   ├── hooks/
│   │   │   └── useAuthActions.ts          # 인증 액션 커스텀 훅
│   │   ├── lib/
│   │   │   ├── routes.ts                  # 라우트 상수 중앙 관리
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts              # Supabase 클라이언트 초기화
│   │   │   │   ├── auth.ts                # Auth API 함수 모음
│   │   │   │   ├── database.types.ts      # DB 타입 정의
│   │   │   │   └── schema.sql             # DB 스키마 + RLS 정책
│   │   │   └── utils/
│   │   │       └── password.ts            # 비밀번호 강도 검사
│   │   ├── pages/
│   │   │   ├── Home.tsx                   # 랜딩 페이지
│   │   │   ├── Login.tsx                  # 로그인
│   │   │   ├── Register.tsx               # 회원가입
│   │   │   ├── ForgotPassword.tsx         # 비밀번호 찾기
│   │   │   ├── ResetPassword.tsx          # 비밀번호 재설정
│   │   │   ├── AuthCallback.tsx           # OAuth 콜백 처리
│   │   │   ├── Dashboard.tsx              # 보안 대시보드
│   │   │   ├── Profile.tsx                # 프로필 편집
│   │   │   ├── Security.tsx               # 보안 설정
│   │   │   └── SettingsPage.tsx           # 앱 설정
│   │   ├── styles/
│   │   │   └── modules/
│   │   │       ├── _mixins.scss           # SCSS 믹스인
│   │   │       └── auth.module.scss       # 인증 UI SCSS 모듈
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript 타입 정의
│   │   ├── App.tsx                        # 라우터 + Provider 통합
│   │   └── index.css                      # 글로벌 스타일 + Tailwind
│   └── index.html                         # HTML 진입점 + CSP 헤더
└── vite.config.ts                         # Vite 설정 + 환경변수 define
```

---

## 2. Supabase 프로젝트 설정

### 2-1. 데이터베이스 스키마 적용

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **SQL Editor** 클릭
3. `client/src/lib/supabase/schema.sql` 파일 내용 전체 복사 후 실행

이 SQL은 다음을 자동으로 처리합니다:
- `public.profiles` 테이블 생성
- 신규 가입 시 프로필 자동 생성 트리거 (`handle_new_user`)
- `updated_at` 자동 갱신 트리거
- Row Level Security (RLS) 정책 4종 적용

### 2-2. Authentication 설정

**Supabase 대시보드 → Authentication → Settings**

| 항목 | 값 |
|------|-----|
| Site URL | `https://your-domain.com` |
| Redirect URLs | `https://your-domain.com/auth/callback` |

---

## 3. Google OAuth 설정

### 3-1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Authorized redirect URIs에 추가:
   ```
   https://aqfaxvwxmrwjyufghryr.supabase.co/auth/v1/callback
   ```
5. Client ID와 Client Secret 복사

### 3-2. Supabase에 Google 설정 적용

**Supabase 대시보드 → Authentication → Providers → Google**

| 항목 | 값 |
|------|-----|
| Client ID | GCP에서 발급받은 Client ID |
| Client Secret | GCP에서 발급받은 Client Secret |

---

## 4. 카카오 OAuth 설정

### 4-1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. **내 애플리케이션 → 앱 설정 → 플랫폼 → Web**
3. 사이트 도메인 등록: `https://your-domain.com`
4. **카카오 로그인 → 활성화** ON
5. **Redirect URI 등록**:
   ```
   https://aqfaxvwxmrwjyufghryr.supabase.co/auth/v1/callback
   ```
6. **동의항목**: 닉네임, 프로필 사진, 카카오계정(이메일) 활성화

### 4-2. Supabase에 카카오 설정 적용

**Supabase 대시보드 → Authentication → Providers → Kakao**

| 항목 | 값 |
|------|-----|
| REST API Key | `5e4507b775c782a8556fffbbbf9aab40` |
| Client Secret | `MATUxwbI25zxGvv3QniegqCvHP72owbl` |

---

## 5. 환경변수 설정

### 개발 환경 (`.env` 파일)

```env
VITE_SUPABASE_URL=https://aqfaxvwxmrwjyufghryr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_KAKAO_REST_API_KEY=5e4507b775c782a8556fffbbbf9aab40
VITE_APP_NAME=SecureAuth
VITE_APP_URL=https://your-domain.com
```

> **주의**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 추가되어 있습니다.

---

## 6. 핵심 보안 로직 설명

### 6-1. PKCE 플로우 (Proof Key for Code Exchange)

```typescript
// client/src/lib/supabase/client.ts
const supabase = createClient(url, key, {
  auth: {
    flowType: 'pkce',           // PKCE 활성화
    autoRefreshToken: true,     // 자동 토큰 갱신
    persistSession: true,       // 세션 영속성
    detectSessionInUrl: true,   // URL에서 세션 감지
  }
});
```

PKCE는 OAuth 코드 인터셉트 공격을 방지합니다. 인증 요청 시 `code_verifier`를 생성하고, 콜백에서 이를 검증합니다.

### 6-2. Row Level Security (RLS)

```sql
-- 사용자는 본인 데이터만 조회/수정 가능
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### 6-3. 자동 세션 관리 (AuthContext)

```typescript
// client/src/contexts/AuthContext.tsx
useEffect(() => {
  // 초기 세션 로드
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
  });

  // 인증 상태 변경 구독
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        await loadProfile(session?.user?.id);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### 6-4. 에러 핸들링 전략

| 에러 타입 | 처리 방법 |
|-----------|-----------|
| 네트워크 오류 | 재시도 버튼 + 오프라인 감지 |
| 잘못된 자격증명 | 인라인 에러 메시지 (필드 하이라이트) |
| 이메일 미인증 | 재발송 링크 제공 |
| 소셜 로그인 실패 | 팝업 차단 안내 + 대체 방법 안내 |
| 세션 만료 | 자동 갱신 시도 → 실패 시 로그인 페이지 리다이렉트 |
| Rate Limit | 대기 시간 안내 |

---

## 7. 반응형 전략

### Tailwind + SCSS 하이브리드 방식

```scss
// client/src/styles/modules/_mixins.scss

// 반응형 브레이크포인트 믹스인
@mixin sm { @media (min-width: 640px) { @content; } }
@mixin md { @media (min-width: 768px) { @content; } }
@mixin lg { @media (min-width: 1024px) { @content; } }

// 인증 레이아웃 믹스인
@mixin auth-panel-layout {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;

  @include lg {
    grid-template-columns: 40% 60%;
  }
}
```

- **Tailwind**: 간단한 유틸리티 클래스 (`sm:`, `md:`, `lg:` 프리셋)
- **SCSS Modules**: 복잡한 레이아웃, 애니메이션, 상태 기반 스타일

---

## 8. Content Security Policy (CSP)

```html
<!-- client/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  connect-src 'self'
    https://*.supabase.co
    wss://*.supabase.co
    https://kapi.kakao.com
    https://accounts.google.com;
  frame-src 'self' https://accounts.google.com;
  object-src 'none';
" />
```

허용된 외부 연결:
- `*.supabase.co` - Supabase API + WebSocket (실시간)
- `kapi.kakao.com` - 카카오 API
- `accounts.google.com` - Google OAuth

---

## 9. 동적 임포트 (코드 스플리팅)

```typescript
// client/src/App.tsx
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// ... 모든 페이지 동적 임포트
```

각 페이지는 필요할 때만 로드되어 초기 번들 크기를 최소화합니다.

---

## 10. 로컬 개발 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 타입 체크
pnpm check

# 빌드
pnpm build
```

---

## 11. 보안 체크리스트

- [ ] Supabase RLS 정책 활성화 확인
- [ ] Google OAuth 리다이렉트 URI 등록
- [ ] 카카오 OAuth 리다이렉트 URI 등록
- [ ] `profiles` 테이블 트리거 생성 확인
- [ ] `.env` 파일 `.gitignore` 포함 확인
- [ ] HTTPS 환경에서만 배포
- [ ] Supabase Anon Key는 공개 가능 (RLS로 보호됨)
- [ ] Service Role Key는 절대 프론트엔드에 노출 금지
