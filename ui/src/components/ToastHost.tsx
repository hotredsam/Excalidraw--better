import React, { useEffect, useState } from 'react';
import { Toast, subscribeToasts } from '../lib/toast';

const COLORS: Record<Toast['type'], string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--info)',
};

const ICONS: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--s-xl)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-sm)',
        zIndex: 5000,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-enter"
          style={{
            backgroundColor: 'var(--bg-2)',
            border: `1px solid ${COLORS[t.type]}`,
            borderLeft: `4px solid ${COLORS[t.type]}`,
            borderRadius: 'var(--r-md)',
            padding: '10px 16px',
            boxShadow: 'var(--shadow-2)',
            fontSize: '13px',
            color: 'var(--text-0)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s-sm)',
            maxWidth: '420px',
          }}
        >
          <span style={{ color: COLORS[t.type], fontWeight: 700 }}>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
