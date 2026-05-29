import React, { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import { TemplateSummary, StoredTemplate } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

export const TemplatesPanel: React.FC<{
  onUseTemplate: (tpl: StoredTemplate) => void;
  onSaveCurrent: () => Promise<{ title: string; scene: any } | null>;
  refreshKey?: number;
}> = ({ onUseTemplate, onSaveCurrent, refreshKey }) => {
  const api = useApi();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);

  const refresh = async () => {
    const { templates } = await api.templates.list();
    setTemplates(templates);
  };

  useEffect(() => {
    refresh();
  }, [refreshKey]);

  const use = async (id: string) => {
    try {
      const tpl = await api.templates.apply(id);
      onUseTemplate(tpl);
      toastSuccess(`Inserted template "${tpl.title}"`);
    } catch (e: any) {
      toastError(e?.message || 'Could not load template');
    }
  };

  const saveCurrent = async () => {
    const data = await onSaveCurrent();
    if (!data) return;
    try {
      await api.templates.save({ title: data.title, scene: data.scene });
      toastSuccess(`Saved template "${data.title}"`);
      await refresh();
    } catch (e: any) {
      toastError(e?.message || 'Could not save template');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={saveCurrent}>
        + Save current canvas as template
      </button>

      {templates.length === 0 && (
        <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>
          No templates yet. Save the current canvas, or import a <code>template_pack</code> via AI Import.
        </p>
      )}

      {templates.map((t) => (
        <div
          key={t.id}
          style={{
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border-0)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--s-md)',
          }}
        >
          <strong style={{ fontSize: '13px' }}>{t.title}</strong>
          <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-2)' }}>{t.description}</p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {t.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
          <button className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => use(t.id)}>
            New from this
          </button>
        </div>
      ))}
    </div>
  );
};
