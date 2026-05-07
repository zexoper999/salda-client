'use client';

import BottomSheet from './BottomSheet';

interface MissionResult {
  pointEarned: number;
  piecesEarned: number;
  currentPieces: number;
  totalTickets: number;
  newTicketsEarned: number;
}

interface MissionResultSheetProps {
  isOpen: boolean;
  onClose: () => void;
  result: MissionResult | null;
}

export default function MissionResultSheet({ isOpen, onClose, result }: MissionResultSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="미션 완료!">
      {result && (
        <div className="space-y-4 pt-1">
          {/* 리워드 카드 */}
          <div className="flex gap-3">
            {result.piecesEarned > 0 && (
              <div className="flex-1 bg-[var(--color-primary-light)] rounded-2xl p-4 text-center">
                <p className="text-xs text-[var(--color-primary)] mb-1">응모권 조각</p>
                <p className="text-2xl font-black text-[var(--color-primary)]">+{result.piecesEarned}조각</p>
              </div>
            )}
            {result.pointEarned > 0 && (
              <div className="flex-1 bg-amber-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-amber-700 mb-1">포인트</p>
                <p className="text-2xl font-black text-amber-600">+{result.pointEarned}P</p>
              </div>
            )}
          </div>

          {/* 조각 진행 바 (N/10) */}
          <div className="bg-[var(--color-surface)] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">조각 진행</span>
              <span className="font-bold text-[var(--color-text-primary)]">
                {result.currentPieces}<span className="text-[var(--color-text-secondary)] font-normal">/10</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(result.currentPieces / 10) * 100}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              누적 응모권 <strong className="text-[var(--color-text-primary)]">{result.totalTickets}개</strong>
            </p>
          </div>

          {/* 자동 응모 알림 */}
          {result.newTicketsEarned > 0 && (
            <div className="bg-[var(--color-primary)] rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-white">
                응모권 {result.newTicketsEarned}개가 자동 응모되었습니다!
              </p>
              <p className="text-xs text-white/80 mt-1">미션을 계속 수행해 당첨 확률을 높이세요.</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full h-12 rounded-full font-bold text-white text-sm"
            style={{ background: 'var(--color-primary)' }}
          >
            확인
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
