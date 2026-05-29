import React from 'react';

/**
 * Hero/onboarding screen shown on the canvas area when nothing is open. Uses the
 * brand orange gradient (per design tokens — gradient reserved for hero moments).
 */
export const WelcomeScreen: React.FC<{
  onNewDrawing: () => void;
  onOpenWorkspace: () => void;
  onOpenCommands: () => void;
  hasWorkspace: boolean;
}> = ({ onNewDrawing, onOpenWorkspace, onOpenCommands, hasWorkspace }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
        background: 'radial-gradient(1200px 600px at 50% -10%, rgba(255,90,0,0.18), transparent 60%)',
      }}
    >
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em',
        }}
      >
        EXCALIBUR
      </div>
      <p style={{ color: 'var(--text-1)', fontSize: 16, maxWidth: 520, marginTop: 8 }}>
        A local-first Excalidraw desktop app — profiles, file control, plugins, and an AI import lane.
        Everything stays on your machine.
      </p>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" style={{ padding: '12px 22px', fontSize: 14 }} onClick={onNewDrawing}>
          ✎ New drawing
        </button>
        {!hasWorkspace && (
          <button className="btn-ghost" style={{ padding: '12px 22px', fontSize: 14 }} onClick={onOpenWorkspace}>
            📁 Open a folder
          </button>
        )}
        <button className="btn-ghost" style={{ padding: '12px 22px', fontSize: 14 }} onClick={onOpenCommands}>
          ⌘ Command palette
        </button>
      </div>

      <div style={{ marginTop: 28, fontSize: 12, color: 'var(--text-2)' }}>
        Tip: press <kbd style={kbd}>Ctrl</kbd> + <kbd style={kbd}>K</kbd> any time for commands,
        or <kbd style={kbd}>?</kbd> for keyboard help.
      </div>
    </div>
  );
};

const kbd: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  borderRadius: 4,
  padding: '1px 6px',
  fontFamily: 'ui-monospace, monospace',
};
