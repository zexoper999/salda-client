'use client';

import BottomSheet from './BottomSheet';

interface MissionResult {
  pointEarned: number;
  ticketEarned: number;
  bonusTicket: number;
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
            {result.ticketEarned > 0 && (
              <div className="flex-1 bg-[var(--color-primary-light)] rounded-2xl p-4 text-center">
                <p className="text-xs text-[var(--color-primary)] mb-1">응모권 조각</p>
                <p className="text-2xl font-black text-[var(--color-primary)]">+{result.ticketEarned}장</p>
              </div>
            )}
            {result.pointEarned > 0 && (
              <div className="flex-1 bg-amber-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-amber-700 mb-1">포인트</p>
                <p className="text-2xl font-black text-amber-600">+{result.pointEarned}P</p>
              </div>
            )}
          </div>

          {/* 보너스 */}
          {result.bonusTicket > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-amber-700">🏆 미션 10회 달성 보너스!</p>
              <p className="text-2xl font-black text-amber-600 mt-1">응모권 +{result.bonusTicket}장</p>
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
