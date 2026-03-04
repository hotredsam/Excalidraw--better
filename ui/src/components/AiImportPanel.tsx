import React, { useState, useCallback } from 'react';

interface ValidationResult {
  valid: boolean;
  type?: string;
  payload?: unknown;
  errors?: string[];
}

interface ApplyResult {
  success: boolean;
  message: string;
}

type PanelState = 'idle' | 'validating' | 'validated' | 'applying' | 'done';

export const AiImportPanel: React.FC = () => {
  const [content, setContent] = useState('');
  const [state, setState] = useState<PanelState>('idle');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleValidate = async () => {
    if (!content.trim()) return;
    setState('validating');
    setValidation(null);
    setApplyResult(null);

    try {
      const result = await window.api.aiImport.validate(content);
      setValidation(result as ValidationResult);
      setState('validated');
    } catch (err) {
      setValidation({ valid: false, errors: [String(err)] });
      setState('validated');
    }
  };

  const handleApply = async () => {
    if (!validation?.valid || !validation.payload) return;
    setState('applying');

    try {
      const result = await window.api.aiImport.apply(validation.payload);
      setApplyResult(result as ApplyResult);
      setState('done');
    } catch (err) {
      setApplyResult({ success: false, message: String(err) });
      setState('done');
    }
  };

  const handleReset = () => {
    setContent('');
    setState('idle');
    setValidation(null);
    setApplyResult(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((ev.target?.result as string) || '');
      setState('idle');
      setValidation(null);
      setApplyResult(null);
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const payloadTypeLabel: Record<string, string> = {
    plugin_scaffold: '🔌 Plugin Scaffold',
    template_pack: '📄 Template Pack',
    settings_bundle: '⚙️ Settings Bundle',
    docs_update: '📚 Docs Update',
  };

  return (
    <div style={{ padding: 'var(--s-md)', display: 'flex', flexDirection: 'column', gap: 'var(--s-md)', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        AI Import Lane
      </h3>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', lineHeight: '1.5' }}>
        Paste or drop a JSON payload to install plugins, templates, settings, or docs.
      </p>

      {/* Drop Zone + Textarea */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? 'var(--orange-600)' : 'var(--border-1)'}`,
          borderRadius: 'var(--r-sm)',
          padding: 'var(--s-sm)',
          backgroundColor: isDragging ? 'rgba(255, 122, 26, 0.08)' : 'var(--bg-2)',
          transition: 'all 0.15s ease',
        }}
      >
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (state !== 'idle') handleReset();
          }}
          placeholder='Paste JSON payload here or drop a .json/.txt file...'
          rows={10}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-0)',
            fontSize: '12px',
            fontFamily: 'monospace',
            resize: 'vertical',
            lineHeight: '1.5',
          }}
        />
      </div>

      {/* Action Buttons */}
      {state === 'idle' && (
        <button
          onClick={handleValidate}
          disabled={!content.trim()}
          style={{
            backgroundColor: content.trim() ? 'var(--orange-600)' : 'var(--bg-3)',
            color: content.trim() ? 'white' : 'var(--text-2)',
            padding: 'var(--s-sm) var(--s-lg)',
            fontSize: '13px',
          }}
        >
          Validate Payload
        </button>
      )}

      {state === 'validating' && (
        <p style={{ color: 'var(--text-2)', fontSize: '13px', margin: 0 }}>Validating...</p>
      )}

      {/* Validation Result */}
      {state === 'validated' && validation && (
        <div style={{
          backgroundColor: validation.valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          border: `1px solid ${validation.valid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
          borderRadius: 'var(--r-xs)',
          padding: 'var(--s-md)',
        }}>
          {validation.valid ? (
            <>
              <p style={{ margin: '0 0 var(--s-sm) 0', fontSize: '13px', fontWeight: 600, color: '#22c55e' }}>
                ✓ Valid — {validation.type ? payloadTypeLabel[validation.type] || validation.type : 'Unknown'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--s-sm)' }}>
                <button
                  onClick={handleApply}
                  style={{
                    backgroundColor: 'var(--orange-600)',
                    color: 'white',
                    padding: 'var(--s-xs) var(--s-lg)',
                    fontSize: '13px',
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-2)',
                    padding: 'var(--s-xs) var(--s-md)',
                    fontSize: '13px',
                    border: '1px solid var(--border-0)',
                    borderRadius: 'var(--r-pill)',
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 var(--s-sm) 0', fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
                ✗ Invalid payload
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#fca5a5' }}>
                {(validation.errors || []).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
              <button
                onClick={handleReset}
                style={{
                  marginTop: 'var(--s-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-2)',
                  padding: 'var(--s-xs) var(--s-md)',
                  fontSize: '13px',
                  border: '1px solid var(--border-0)',
                  borderRadius: 'var(--r-pill)',
                }}
              >
                Reset
              </button>
            </>
          )}
        </div>
      )}

      {state === 'applying' && (
        <p style={{ color: 'var(--text-2)', fontSize: '13px', margin: 0 }}>Applying payload...</p>
      )}

      {/* Apply Result */}
      {state === 'done' && applyResult && (
        <div style={{
          backgroundColor: applyResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          border: `1px solid ${applyResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
          borderRadius: 'var(--r-xs)',
          padding: 'var(--s-md)',
        }}>
          <p style={{ margin: '0 0 var(--s-sm) 0', fontSize: '13px', fontWeight: 600, color: applyResult.success ? '#22c55e' : '#ef4444' }}>
            {applyResult.success ? '✓ Applied successfully' : '✗ Apply failed'}
          </p>
          <p style={{ margin: '0 0 var(--s-sm) 0', fontSize: '12px', color: 'var(--text-1)' }}>{applyResult.message}</p>
          <button
            onClick={handleReset}
            style={{
              backgroundColor: 'var(--orange-600)',
              color: 'white',
              padding: 'var(--s-xs) var(--s-lg)',
              fontSize: '13px',
            }}
          >
            Import Another
          </button>
        </div>
      )}

      {/* Info box at bottom */}
      <div style={{
        marginTop: 'auto',
        padding: 'var(--s-md)',
        backgroundColor: 'var(--bg-3)',
        borderRadius: 'var(--r-xs)',
        fontSize: '11px',
        color: 'var(--text-2)',
        lineHeight: '1.6',
      }}>
        <strong style={{ color: 'var(--orange-600)' }}>Supported payload types:</strong><br />
        • <code>plugin_scaffold</code> — installs a new plugin<br />
        • <code>template_pack</code> — adds drawing templates<br />
        • <code>settings_bundle</code> — updates app settings<br />
        • <code>docs_update</code> — saves a documentation file
      </div>
    </div>
  );
};
