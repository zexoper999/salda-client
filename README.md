# SALDA Client

미션 리워드 기반 청약 응모 플랫폼 **SALDA**의 프론트엔드.  
모바일 웹(375~430px 기준)으로 구현하며, 추후 Capacitor로 AOS/iOS 앱 빌드 예정.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| UI | React 19 · Tailwind CSS v4 |
| 언어 | TypeScript 5 |
| 서버 상태 | TanStack React Query 5 |
| 클라이언트 상태 | Zustand 5 |
| HTTP | Axios (withCredentials, JWT 쿠키 자동 전송) |
| 폰트 | Pretendard (CDN) |

## 주요 화면

| 경로 | 설명 |
|------|------|
| `/login` | 카카오·애플 소셜 로그인 |
| `/home` | 청약 미리보기·미션 배너·쇼핑 섹션 |
| `/subscriptions/[id]` | 청약 상세·응모권 투입·점유율 폴링 |
| `/missions/[id]` | 미션 상세·완료 처리·결과 BottomSheet |
| `/shop/[id]` | 상품 상세·포인트 결제 3단계 |
| `/my` | 포인트·응모권 현황·마이메뉴 |
| `/admin/*` | 어드민 (별도 레이아웃, role: ADMIN 전용) |

## 실행

```bash
npm install
npm run dev    # 개발 (http://localhost:3000)
npm run build && npm run start
```
