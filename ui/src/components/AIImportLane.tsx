import React, { useState, useCallback, useEffect } from 'react';
import { useApi } from '../api/ApiContext';
import { AiValidationResult } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';
import { diffObjects, formatValue, FieldChange } from '../lib/diff';

const SAMPLE = `{
  "type": "template_pack",
  "name": "work_templates",
  "version": "1.0.0",
  "templates": [
    { "id": "meeting-notes", "title": "Meeting Notes", "description": "Agenda + notes", "tags": ["work"] }
  ]
}`;

export const AIImportLane: React.FC<{ onApplied?: () => void }> = ({ onApplied }) => {
  const api = useApi();
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<AiValidationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [settingsDiff, setSettingsDiff] = useState<FieldChange[] | null>(null);

  // For settings bundles, show exactly which settings would change.
  useEffect(() => {
    (async () => {
      if (result?.ok && result.type === 'settings_bundle' && result.payload) {
        const current = await api.settings.get();
        setSettingsDiff(diffObjects(current as any, (result.payload as any).settings || {}));
      } else {
        setSettingsDiff(null);
      }
    })();
  }, [result]);

  const validate = useCallback(async (text: string) => {
    setRaw(text);
    if (!text.trim()) {
      setResult(null);
      return;
    }
    const res = await api.ai.validate(text);
    setResult(res);
  }, []);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const text = await file.text();
      validate(text);
    } else {
      const text = e.dataTransfer.getData('text');
      if (text) validate(text);
    }
  };

  const apply = async () => {
    if (!result?.ok || !result.payload) return;
    setBusy(true);
    try {
      const res = await api.ai.apply(result.payload);
      toastSuccess(res.message);
      setRaw('');
      setResult(null);
      onApplied?.();
    } catch (e: any) {
      toastError(e?.message || 'Apply failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)' }}>
        Paste or drop an AI payload (JSON or <code>TYPE:</code> text). It is validated before anything is applied.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--orange-600)' : 'var(--border-1)'}`,
          borderRadius: 'var(--r-md)',
          padding: '4px',
          transition: 'border-color var(--motion-fast)',
        }}
      >
        <textarea
          value={raw}
          onChange={(e) => validate(e.target.value)}
          placeholder="Paste payload here, or drag a .json / .txt file…"
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: '160px',
            resize: 'vertical',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: '12px',
            border: 'none',
            background: 'transparent',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--s-sm)' }}>
        <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => validate(SAMPLE)}>
          Load sample
        </button>
        <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => validate('')}>
          Clear
        </button>
      </div>

      {result && (
        <div
          style={{
            backgroundColor: 'var(--bg-2)',
            border: `1px solid ${result.ok ? 'var(--success)' : 'var(--danger)'}`,
            borderRadius: 'var(--r-md)',
            padding: 'var(--s-md)',
          }}
        >
          {result.ok ? (
            <>
              <div className="chip" style={{ marginBottom: 8 }}>{result.type}</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: '12px', color: 'var(--text-1)' }}>
                {result.summary.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>

              {settingsDiff && settingsDiff.length > 0 && (
                <div style={{ marginTop: 'var(--s-md)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                    Changes
                  </div>
                  {settingsDiff.map((c) => (
                    <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '1px 0' }}>
                      <span style={{ color: 'var(--text-1)' }}>{c.key}</span>
                      <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-2)' }}>
                        {formatValue(c.before)} → <span style={{ color: 'var(--orange-500)' }}>{formatValue(c.after)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn-primary"
                disabled={busy}
                onClick={apply}
                style={{ marginTop: 'var(--s-md)', width: '100%' }}
              >
                {busy ? 'Applying…' : 'Apply payload'}
              </button>
            </>
          ) : (
            <>
              <strong style={{ color: 'var(--danger)', fontSize: '13px' }}>Validation failed</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '12px', color: 'var(--text-1)' }}>
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};
