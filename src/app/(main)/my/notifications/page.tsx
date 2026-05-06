'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type NotificationSettings,
} from '@/hooks/useNotificationSettings';

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 ${
        checked ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();

  const [settings, setSettings] = useState<NotificationSettings>({
    notifAll: true,
    notifSubscription: false,
    notifMarketing: false,
    notifInfo: true,
    notifNight: false,
  });

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
  }, [user, router]);

  useEffect(() => {
    if (data?.data) setSettings(data.data);
  }, [data]);

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    const next = { ...settings, [key]: value };

    // 전체 알림 ON/OFF 시 하위 항목 일괄 동기화
    if (key === 'notifAll') {
      next.notifSubscription = value;
      next.notifMarketing = value;
      next.notifInfo = value;
      next.notifNight = value;
    }

    setSettings(next);
    try {
      await updateMutation.mutateAsync(
        key === 'notifAll'
          ? {
              notifAll: value,
              notifSubscription: value,
              notifMarketing: value,
              notifInfo: value,
              notifNight: value,
            }
          : { [key]: value },
      );
    } catch {
      setSettings(settings);
    }
  };

  if (!user) return null;

  const subDisabled = !settings.notifAll;

  const items: { key: keyof NotificationSettings; label: string }[] = [
    { key: 'notifSubscription', label: '신규 청약 알림' },
    { key: 'notifMarketing',    label: '마케팅 알림' },
    { key: 'notifInfo',         label: '안내성 정보 알림' },
    { key: 'notifNight',        label: '야간시간 알림(20시~08시)' },
  ];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <PageHeader title="알림설정" showBack />

      {isLoading ? (
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] last:border-b-0">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-7 w-12 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
          {/* 전체 알림 */}
          <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)]">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">전체 알림 설정</span>
            <Toggle
              checked={settings.notifAll}
              onChange={(v) => handleToggle('notifAll', v)}
            />
          </div>

          {/* 하위 항목 */}
          {items.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between px-5 h-14 border-b border-[var(--color-border)] last:border-b-0"
            >
              <span className={`text-sm ${subDisabled ? 'text-[var(--color-text-disabled)]' : 'text-[var(--color-text-primary)]'}`}>
                {label}
              </span>
              <Toggle
                checked={settings[key]}
                onChange={(v) => handleToggle(key, v)}
                disabled={subDisabled}
              />
            </div>
          ))}
        </div>
      )}

      <p className="mx-4 mt-3 text-xs text-[var(--color-text-disabled)] leading-relaxed">
        전체 알림을 끄면 모든 알림이 수신되지 않습니다.
      </p>
    </div>
  );
}
