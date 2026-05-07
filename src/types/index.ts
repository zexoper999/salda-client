// ─── 공통 API 응답 포맷 ───────────────────────────────────────
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// ─── 유저 ─────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  phone: string | null;
  point: number;
  role: 'USER' | 'ADMIN';
}

export interface SubscriptionProgress {
  missionCount: number;   // 이 청약에서 완료한 미션 수
  totalPieces: number;    // 누적 조각 수
  currentPieces: number;  // 현재 조각 수 = totalPieces % 10 (UI: N/10)
  totalTickets: number;   // 응모횟수 = floor(totalPieces/10) (UI: "11회")
}

// ─── 청약 ─────────────────────────────────────────────────────
export type SubscriptionType = 'JEONSE' | 'VEHICLE';
export type SubscriptionStatus = 'ONGOING' | 'CLOSING_SOON' | 'CLOSED';

export interface Subscription {
  id: number;
  type: SubscriptionType;
  status: SubscriptionStatus;
  title: string;
  oneLineDesc?: string;
  description?: string;
  imageUrls?: string[];        // R2 업로드 이미지 배열 (첫 번째를 썸네일로 사용)
  deposit: number;
  maxEntries: number;         // 목표 응모수 (0이면 미설정)
  totalEntryCount: number;    // 현재 전체 응모 건수
  entryProgress: number;      // 응모달성률 = totalEntryCount / maxEntries * 100
  myEntryCount?: number;
  myEntryRate?: number;
  isMySubscription?: boolean;
  myProgress?: SubscriptionProgress;
  bonusIncluded: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
}

export interface SubscriptionDetail extends Subscription {
  totalTickets: number;
  myTickets: number;
  myEntryRate: number;
  isMySubscription: boolean;
  myProgress: SubscriptionProgress;
}

export interface SubscriptionEntry {
  id: number;
  subscriptionId: number;
  ticketCount: number;
  createdAt: string;
  subscription: Pick<Subscription, 'id' | 'type' | 'title' | 'status' | 'endAt'>;
}

// ─── 미션 ─────────────────────────────────────────────────────
export type MissionCategory = 'SNS_SUBSCRIBE' | 'PAGE_VISIT' | 'TAG_FIND';
export type MissionStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export interface Mission {
  id: number;
  category: MissionCategory;
  status: MissionStatus;
  title: string;
  oneLineDesc?: string;
  description?: string;
  imageUrls: string[];
  publisher?: string;
  missionUrl?: string;
  rewardPoint: number;
  rewardTicket: number;
  ageRestriction: boolean;
  isFirstCome: boolean;
  limitCount?: number;
  completedToday?: boolean;
  completedCount?: number;
  remainCount?: number | null;
}

export interface UserMission {
  id: number;
  missionId: number;
  completedAt: string;
  mission: Pick<Mission, 'id' | 'title' | 'rewardPoint' | 'rewardTicket' | 'category'>;
}

// ─── 쇼핑 ─────────────────────────────────────────────────────
export type ProductCategory =
  | 'GIFT_CARD'
  | 'CAFE'
  | 'CONVENIENCE'
  | 'BURGER_PIZZA'
  | 'GAS'
  | 'DINING';

export type ProductStatus = 'ON_SALE' | 'SUSPENDED' | 'ENDED';

export interface Product {
  id: number;
  category: ProductCategory;
  status: ProductStatus;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  purchaseCount: number;
  isSoldOut: boolean;
}

export interface ProductListResponse {
  total: number;
  products: Product[];
}

export interface Purchase {
  id: number;
  phone: string;
  pointBefore: number;
  pointUsed: number;
  pointAfter: number;
  createdAt: string;
  product: Pick<Product, 'id' | 'category' | 'name' | 'imageUrl' | 'price'>;
}
