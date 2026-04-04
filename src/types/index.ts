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
  imageUrl?: string;
  deposit: number;
  bonusIncluded: boolean;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface SubscriptionDetail extends Subscription {
  totalTickets: number;
  myTickets: number;
  myEntryRate: number;
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

export interface Product {
  id: number;
  category: ProductCategory;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  stock?: number;
}
