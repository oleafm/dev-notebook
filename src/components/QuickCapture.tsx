'use client';

import { useState, type FormEvent } from 'react';
import type { KnowledgeEntry, EntryCategory } from '@/lib/types';

const categories: EntryCategory[] = ['React', 'Next.js', 'TypeScript', 'Backend', 'Workflow', 'AI Development', 'Other'];
type Suggestion = Pick<KnowledgeEntry, 'title' | 'summary' | 'category' | 'explanation' | 'bubbleReference' | 'bubbleAnalogy' | 'codeExample' | 'insight' | 'appliedIn' | 'checkQuestions'>;
const example = `To run dailyfm locally:
git clone --branch claude/harvest-app-clone-00J4e https://github.com/oleafm/dailyfm.git
cd dailyfm
npm ci
npm run dev
Open http://localhost:3000. No Supabase credentials needed according to the instructions.`;

export function QuickCapture({ onClose, onSave }: { onClose: () => void; onSave: (entry: KnowledgeEntry) => void }) {
  const [raw, setRaw] = useState('');
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);

  const close = () => {
    if ((raw.trim() || suggestion) && !confirmClose) { setConfirmClose(true); return; }
    onClose();
  };
  const generate = async (event: FormEvent) => {
    event.preventDefault();
    if (raw.trim().length < 20 || busy) return;
    setBusy(true); setError(''); setSuggestion(null);
    try {
      const response = await fetch('/api/quick-capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: raw.trim() }) });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(typeof data === 'object' && data && 'error' in data && typeof data.error === 'string' ? data.error : 'Could not generate a note.');
      if (!data || typeof data !== 'object' || !('suggestion' in data)) throw new Error('Unexpected response.');
      const result = data.suggestion as Suggestion;
      if (typeof result.title !== 'string' || typeof result.summary !== 'string' || !categories.includes(result.category)) throw new Error('Invalid note returned. Please try again.');
      setSuggestion(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not generate a note.'); }
    finally { setBusy(false); }
  };
  const edit = (key: keyof Suggestion, value: string) => setSuggestion(old => old ? ({ ...old, [key]: key === 'checkQuestions' ? value.split('\n') : value }) : old);
  const save = () => {
    if (!suggestion || !suggestion.title.trim() || !suggestion.summary.trim()) { setError('Please add a title and summary.'); return; }
    const date = new Date().toISOString().slice(0, 10);
    onSave({ ...suggestion, id: crypto.randomUUID(), kind: 'knowledge', createdAt: date, updatedAt: date,
      title: suggestion.title.trim(), summary: suggestion.summary.trim(),
      checkQuestions: suggestion.checkQuestions.filter(s => s.trim()) });
  };
  return <div className="modal-backdrop quick-backdrop">
    <section className="quick-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-title">
      <div className="quick-header">
        <div><p className="eyebrow">// LEARNING ARCHIVE / QUICK CAPTURE</p><h2 id="quick-title">Capture a new insight.</h2><p>Paste something you learned. AI drafts a note; you decide what gets saved.</p></div>
        <button type="button" className="icon-button" aria-label="Close Quick Capture" onClick={close}>✕</button>
      </div>
      <div className="quick-body">
        <form onSubmit={generate} className="quick-input-area">
          <label htmlFor="quick-raw">01 / Your raw material</label>
          <textarea id="quick-raw" autoFocus spellCheck={false} maxLength={8000} value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Paste a terminal workflow, code snippet, rough notes, or a concept you just learned…" rows={11}/>
          <div className="quick-input-footer"><button type="button" className="button-ghost" onClick={()=>setRaw(example)}>Try example</button><span>{raw.length}/8000</span></div>
          <button className="button-solid" disabled={busy || raw.trim().length < 20} type="submit">{busy ? 'Drafting…' : suggestion ? 'Regenerate draft ↗' : 'Generate draft ↗'}</button>
          <p className="quick-hint">Your text is sent to an AI provider when you generate. Don't paste secrets or private client data.</p>
        </form>
        <div className="quick-preview">
          <div className="quick-preview-head"><span>02 / Review the draft</span><span>{suggestion ? 'EDITABLE' : 'WAITING FOR INPUT'}</span></div>
          {suggestion ? <div className="quick-edit-fields">
            <label>Title<input value={suggestion.title} onChange={e=>edit('title',e.target.value)}/></label>
            <label>Category<select value={suggestion.category} onChange={e=>edit('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
            {([
              ['summary','Summary'],['explanation','Explanation'],['bubbleReference','Closest Bubble concept'],['bubbleAnalogy','Bubble comparison'],['codeExample','Code / commands'],['insight','My takeaway'],['appliedIn','Where I applied it'],['checkQuestions','Three review questions (one per line)']
            ] as const).map(([key,label])=><label key={key}>{label}<textarea rows={key==='codeExample'?5:3} value={key==='checkQuestions'?suggestion.checkQuestions.join('\n'):suggestion[key]} onChange={e=>edit(key,e.target.value)}/></label>)}
          </div> : <div className="quick-empty"><span>✳</span><strong>From rough notes to a usable reference.</strong><p>The suggested title, explanation, Bubble analogy, and review questions will appear here. Nothing gets saved without your approval.</p></div>}
        </div>
      </div>
      {error && <p className="quick-error" role="alert">{error}</p>}
      {confirmClose && <div className="quick-confirm"><span>Discard this capture?</span><button type="button" className="button-ghost" onClick={()=>setConfirmClose(false)}>Keep editing</button><button type="button" className="button-solid" onClick={onClose}>Discard</button></div>}
      <footer className="quick-actions"><span>Local draft · Review before saving</span><div><button type="button" className="button-ghost" onClick={close}>Cancel</button><button type="button" className="button-solid" disabled={!suggestion||busy} onClick={save}>Save to Knowledge Library ↗</button></div></footer>
    </section>
  </div>;
}
