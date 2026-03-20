# SALDA Client — 아키텍처 문서

> 프로젝트의 구조 설계, Provider 계층, 인증 흐름, 상태 관리 전략을 설명합니다.

---

## 목차

- [기술 선택 이유](#기술-선택-이유)
- [디렉토리 구조 설계](#디렉토리-구조-설계)
- [Provider 계층 구조](#provider-계층-구조)
- [인증 흐름](#인증-흐름)
- [상태 관리 전략](#상태-관리-전략)
- [HTTP 통신 레이어](#http-통신-레이어)
- [향후 확장 방향](#향후-확장-방향)

---

## 기술 선택 이유

### Next.js App Router
- **서버 컴포넌트(RSC)** 와 **클라이언트 컴포넌트** 혼합 사용으로 성능 최적화
- `layout.tsx` 기반의 중첩 레이아웃으로 공통 UI 관리
- `page.tsx` 파일 기반 라우팅으로 직관적인 구조

### Zustand (클라이언트 상태)
- Redux 대비 **보일러플레이트 최소화**
- React 외부에서도 스토어 접근 가능 (`getState()`)
- 인증처럼 **앱 전역에서 공유되는 UI 상태** 관리에 적합

### TanStack React Query (서버 상태)
- 서버 데이터의 **캐싱, 재검증, 동기화**를 자동으로 처리
- `isLoading`, `isError` 등 로딩 상태를 선언적으로 표현
- `useQuery` / `useMutation` 훅으로 일관된 데이터 페칭 패턴 제공

### JWT + HttpOnly 쿠키
- 클라이언트 JavaScript에서 토큰에 직접 접근 불가 → **XSS 공격 차단**
- `withCredentials: true` 설정으로 쿠키를 자동으로 요청에 포함
- 백엔드가 쿠키 발급/삭제를 전담하여 프론트엔드 보안 로직 단순화

---

## 디렉토리 구조 설계

```
src/
├── app/               # Next.js App Router (라우팅 담당)
│   ├── layout.tsx     # 전역 레이아웃, Provider 주입
│   ├── page.tsx       # / 라우트
│   └── globals.css    # Tailwind CSS 진입점
│
├── lib/               # 서드파티 라이브러리 설정 및 래퍼
│   └── axios.ts       # Axios 인스턴스 (baseURL, interceptors 등)
│
├── providers/         # React Context / 전역 초기화 컴포넌트
│   ├── QueryProvider.tsx  # React Query 클라이언트 설정
│   └── AuthProvider.tsx   # 앱 로드 시 세션 복원
│
└── store/             # Zustand 전역 상태 스토어
    └── useAuthStore.ts    # 인증 상태 (user, isLoggedIn)
```

### 향후 추가 예정 디렉토리

```
src/
├── components/        # 재사용 가능한 UI 컴포넌트
│   ├── common/        # 버튼, 인풋, 모달 등 공통 컴포넌트
│   └── features/      # 도메인별 컴포넌트 (청약, 미션 등)
│
├── hooks/             # 커스텀 React 훅
│   └── useAuth.ts     # 인증 관련 훅
│
├── services/          # API 호출 함수 모음
│   ├── auth.ts        # 인증 API
│   └── subscription.ts # 청약 API
│
└── types/             # TypeScript 타입 정의
    ├── user.ts
    └── subscription.ts
```

---

## Provider 계층 구조

`src/app/layout.tsx`에서 Provider가 중첩되어 감쌉니다.

```
<QueryProvider>          ← React Query 클라이언트 제공
  <AuthProvider>         ← 앱 마운트 시 /auth/me 호출 → 세션 복원
    {children}           ← 실제 페이지 컴포넌트
  </AuthProvider>
</QueryProvider>
```

### 순서가 중요한 이유

`AuthProvider` 내부에서 `useQuery`를 사용하므로, **반드시 `QueryProvider` 안에 위치**해야 합니다.  
`QueryProvider`가 바깥에 있어야 React Query 컨텍스트가 먼저 초기화됩니다.

---

## 인증 흐름

### 1. 최초 로그인 (카카오 OAuth)

```
[브라우저]                    [프론트엔드]              [백엔드]              [카카오]
    │                             │                       │                     │
    │── "카카오로 시작하기" 클릭 ──▶│                       │                     │
    │                             │── /auth/kakao 리다이렉트 ──▶│                │
    │                             │                       │── OAuth 요청 ──────▶│
    │                             │                       │◀── 인가 코드 ────────│
    │                             │                       │── 토큰 교환 ────────▶│
    │                             │                       │◀── Access Token ────│
    │                             │                       │── 유저 정보 조회 ───▶│
    │                             │                       │◀── 유저 정보 ────────│
    │                             │                       │
    │                             │◀── JWT 쿠키 Set-Cookie + 프론트엔드로 리다이렉트 ──│
    │                             │                       │
    │                             │── AuthProvider /auth/me 호출 ──▶│
    │                             │◀── 유저 정보 응답 ─────────────│
    │                             │
    │                             │── Zustand login(user) 호출
    │◀── 로그인 완료 화면 ──────────│
```

### 2. 앱 재방문 시 세션 복원

```
[브라우저]          [AuthProvider]          [백엔드]
    │                    │                     │
    │── 앱 접속 ─────────▶│                     │
    │                    │── GET /auth/me ─────▶│  (쿠키 자동 포함)
    │                    │                     │── JWT 검증
    │                    │◀── 200 유저 정보 ────│  (유효한 경우)
    │                    │── login(user)        │
    │                    │                     │
    │                    │◀── 401 Unauthorized ─│  (만료/없는 경우)
    │                    │── logout()           │
```

### 3. 로그아웃

> 현재 `logout()` (Zustand 상태 초기화)만 구현되어 있습니다.  
> **백엔드 `/auth/logout` 호출(쿠키 삭제)은 TODO 상태입니다.**

완전한 로그아웃 흐름 (구현 예정):

```
1. 백엔드 POST /auth/logout 호출 → 서버에서 쿠키 삭제
2. Zustand logout() 호출 → 클라이언트 상태 초기화
```

---

## 상태 관리 전략

SALDA는 상태를 두 가지로 분리하여 관리합니다.

### 클라이언트 상태 (Zustand)

UI 상태나 앱 전역에서 공유되는 데이터를 관리합니다.

| 스토어 | 파일 | 관리 데이터 |
|--------|------|------------|
| `useAuthStore` | `store/useAuthStore.ts` | 로그인 유저 정보, 인증 여부 |

```typescript
// 사용 예시
const { user, isLoggedIn, login, logout } = useAuthStore();
```

### 서버 상태 (React Query)

백엔드 API 데이터의 페칭, 캐싱, 동기화를 관리합니다.

| 설정 | 값 | 이유 |
|------|----|------|
| `staleTime` | 60,000ms | 1분 내 동일 요청 재사용 (불필요한 API 호출 방지) |
| `refetchOnWindowFocus` | `false` | 탭 전환 시 자동 재요청 비활성화 |
| `retry` (AuthProvider) | `false` | 401 에러 시 즉시 비로그인 처리 (불필요한 재시도 방지) |

---

## HTTP 통신 레이어

`src/lib/axios.ts`에서 공유 Axios 인스턴스를 생성합니다.

```typescript
export const api = axios.create({
  baseURL: "http://localhost:4000",  // TODO: 환경변수로 교체
  withCredentials: true,             // HttpOnly 쿠키 자동 전송
});
```

### 권장 개선사항: 인터셉터 추가

```typescript
// 요청 인터셉터 (예: 공통 헤더 추가)
api.interceptors.request.use((config) => {
  // ...
  return config;
});

// 응답 인터셉터 (예: 401 시 자동 로그아웃)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

---

## 향후 확장 방향

### 단기 과제

- [ ] `NEXT_PUBLIC_API_URL` 환경변수 적용 (`src/lib/axios.ts`)
- [ ] 로그아웃 API 호출 구현 (`POST /auth/logout`)
- [ ] Axios 응답 인터셉터 추가 (401 자동 로그아웃)
- [ ] `.env.example` 파일 생성

### 중기 과제

- [ ] `src/types/` 디렉토리 생성 및 공통 타입 분리
- [ ] `src/services/` 디렉토리 생성 및 API 함수 모듈화
- [ ] `src/components/` 공통 컴포넌트 설계
- [ ] 청약 응모 도메인 개발
- [ ] 미션 리워드 도메인 개발

### 장기 과제

- [ ] 테스트 환경 구성 (Vitest + Testing Library)
- [ ] CI/CD 파이프라인 구성
- [ ] 프로덕션 환경 배포 설정
