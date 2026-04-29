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
  ticket: number;
  role: 'USER' | 'ADMIN';
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
  myEntryCount?: number;      // 내 응모 횟수
  bonusIncluded: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  missionCount: number;       // 사용자 미션진행도 (0~9, 10이 되면 자동응모)
}

export interface SubscriptionDetail extends Subscription {
  totalTickets: number;
  myTickets: number;
  myEntryRate: number;        // 내 참여율 = myTickets / totalTickets * 100
  myEntryCount: number;       // 내 응모 횟수
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
  imageUrl?: string;
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
