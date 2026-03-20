# SALDA Client

> **청약응모 및 미션 리워드 플랫폼** — Next.js 기반 프론트엔드

---

## 목차

- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [환경 변수](#환경-변수)
- [인증 흐름](#인증-흐름)
- [상태 관리](#상태-관리)
- [API 클라이언트](#api-클라이언트)
- [관련 문서](#관련-문서)

---

## 프로젝트 개요

SALDA는 **청약 응모**와 **미션 리워드**를 제공하는 플랫폼입니다.  
사용자는 카카오 소셜 로그인을 통해 서비스에 접근하고, 포인트를 적립·사용할 수 있습니다.

| 항목 | 내용 |
|------|------|
| 서비스명 | SALDA |
| 성격 | 청약응모 및 미션 리워드 플랫폼 |
| 인증 방식 | 카카오 OAuth 2.0 (Redirect) + JWT HttpOnly 쿠키 |
| 개발 단계 | 초기 개발 중 |

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | [Next.js](https://nextjs.org) | 16.x |
| UI 라이브러리 | [React](https://react.dev) | 19.x |
| 언어 | TypeScript | 5.x |
| 스타일링 | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| 서버 상태 관리 | [TanStack React Query](https://tanstack.com/query) | 5.x |
| 클라이언트 상태 관리 | [Zustand](https://zustand-demo.pmnd.rs) | 5.x |
| HTTP 클라이언트 | [Axios](https://axios-http.com) | 1.x |

---

## 시작하기

### 사전 요구 사항

- **Node.js** 20 이상
- **백엔드 서버** 실행 중 (`http://localhost:4000`)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

### 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성하세요.

```bash
cp .env.example .env.local
```

> `.env.example` 파일은 [환경 변수](#환경-변수) 섹션을 참고해 직접 생성하세요.

---

## 프로젝트 구조

```
salda-client/
├── public/                   # 정적 파일
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # 루트 레이아웃 (Provider 주입)
│   │   ├── page.tsx          # 홈 페이지 (/)
│   │   ├── globals.css       # 전역 스타일 (Tailwind v4)
│   │   └── favicon.ico
│   ├── lib/
│   │   └── axios.ts          # Axios 인스턴스 (baseURL, withCredentials)
│   ├── providers/
│   │   ├── QueryProvider.tsx # React Query 클라이언트 설정
│   │   └── AuthProvider.tsx  # 앱 마운트 시 세션 복원
│   └── store/
│       └── useAuthStore.ts   # Zustand 인증 상태 스토어
├── .env.local                # 환경 변수 (gitignore)
├── package.json
├── tsconfig.json
└── postcss.config.mjs
```

> 디렉토리 설계 및 레이어 구조는 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)를 참고하세요.

---

## 환경 변수

현재 백엔드 URL이 소스코드에 하드코딩되어 있습니다.  
아래 환경 변수를 `.env.local`에 설정한 뒤, 코드에 적용하는 것을 권장합니다.

```env
# 백엔드 API 서버 주소
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> `NEXT_PUBLIC_` 접두사를 사용하면 클라이언트 컴포넌트에서도 접근 가능합니다.

---

## 인증 흐름

SALDA는 **카카오 OAuth 2.0 Redirect 방식**과 **JWT HttpOnly 쿠키**를 조합한 인증을 사용합니다.

```
1. 사용자가 "카카오로 시작하기" 버튼 클릭
        ↓
2. 프론트엔드 → 백엔드 /auth/kakao 로 리다이렉트
        ↓
3. 백엔드가 카카오 OAuth 처리 후 JWT를 HttpOnly 쿠키에 저장
        ↓
4. 프론트엔드로 리다이렉트
        ↓
5. AuthProvider가 /auth/me 호출 → 세션 복원 → Zustand 상태 업데이트
```

자세한 내용은 [docs/ARCHITECTURE.md#인증-흐름](./docs/ARCHITECTURE.md#인증-흐름)을 참고하세요.

---

## 상태 관리

### 클라이언트 상태 — Zustand (`useAuthStore`)

사용자 인증 정보를 전역으로 관리합니다.

```typescript
const { user, isLoggedIn, login, logout } = useAuthStore();
```

| 상태/액션 | 타입 | 설명 |
|-----------|------|------|
| `user` | `User \| null` | 로그인한 사용자 정보 |
| `isLoggedIn` | `boolean` | 로그인 여부 |
| `login(user)` | `(User) => void` | 로그인 처리 (상태 저장) |
| `logout()` | `() => void` | 로그아웃 처리 (상태 초기화) |

### 서버 상태 — React Query

서버 데이터 페칭, 캐싱, 동기화를 담당합니다.

- `staleTime`: 60,000ms (1분)
- `refetchOnWindowFocus`: `false`
- DevTools: 개발 환경에서 자동 활성화

---

## API 클라이언트

`src/lib/axios.ts`에 정의된 Axios 인스턴스를 사용합니다.

```typescript
import { api } from "@/lib/axios";

// 예시
const response = await api.get("/auth/me");
```

| 설정 | 값 | 설명 |
|------|-----|------|
| `baseURL` | `http://localhost:4000` | 백엔드 서버 주소 |
| `withCredentials` | `true` | HttpOnly 쿠키 자동 전송 |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 프로젝트 아키텍처, Provider 구조, 디렉토리 설계 |

---

## 개발 스크립트

```bash
npm run dev      # 개발 서버 실행 (Turbopack)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```
