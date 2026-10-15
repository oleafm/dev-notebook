'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Entry, EntryCategory, JournalEntry, KnowledgeEntry, Tab } from '@/lib/types';

const categories: EntryCategory[] = ['React', 'Next.js', 'TypeScript', 'Backend', 'Workflow', 'AI Development', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);
const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `note-${Date.now()}`;

function blankEntry(kind: Tab): Entry {
  const common = { id: makeId(), title: '', summary: '', createdAt: today(), updatedAt: today() };
  return kind === 'knowledge'
    ? { ...common, kind, category: 'React', bubbleReference: '', explanation: '', bubbleAnalogy: '', codeExample: '', insight: '', appliedIn: '', checkQuestions: [] }
    : { ...common, kind, date: today(), project: 'NextHop', session: '', objective: '', decisions: '', aiAssistance: '', challenges: '', verification: '', lessons: '', next: '', reflections: ['', '', ''] };
}

export function EntryEditor({ entry, kind, onSave, onClose }: {
  entry?: Entry;
  kind: Tab;
  onSave: (entry: Entry) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Entry>(() => entry ? structuredClone(entry) : blankEntry(kind));

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [onClose]);

  const updateField = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value } as Entry));
  };
  const updateLines = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value.split('\n') } as Entry));
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.summary.trim()) return;
    onSave({ ...draft, title: draft.title.trim(), summary: draft.summary.trim(), updatedAt: today() });
  };

  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editor-heading">
        <header className="editor-header">
          <div>
            <p className="eyebrow">// PERSONAL WORKSPACE</p>
            <h2 id="editor-heading">{entry ? 'Edit entry' : 'New entry'}</h2>
          </div>
          <button className="icon-button" aria-label="Close editor" onClick={onClose}>✕</button>
        </header>
        <form onSubmit={submit} className="editor-form">
          <div className="two-fields">
            <label className="field">Entry type<input value={draft.kind === 'knowledge' ? 'Knowledge Note' : 'Build Journal'} disabled /></label>
            {draft.kind === 'knowledge' ? (
              <label className="field">Category
                <select value={draft.category} onChange={event => updateField('category', event.target.value)}>
                  {categories.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            ) : <label className="field">Date<input type="date" value={draft.date} onChange={event => updateField('date', event.target.value)} required /></label>}
          </div>
          <label className="field">Title *<input autoFocus required value={draft.title} onChange={event => updateField('title', event.target.value)} placeholder="What are we documenting?" /></label>
          <label className="field">Short description *<textarea required rows={2} value={draft.summary} onChange={event => updateField('summary', event.target.value)} placeholder="A useful one-sentence summary..." /></label>
          {draft.kind === 'knowledge' ? <KnowledgeFields draft={draft} updateField={updateField} updateLines={updateLines} /> : <JournalFields draft={draft} updateField={updateField} updateLines={updateLines} />}
          <div className="editor-actions"><span>Saved locally in this browser only.</span><div><button type="button" className="button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button-solid">Save note</button></div></div>
        </form>
      </div>
    </div>
  );
}

function KnowledgeFields({ draft, updateField, updateLines }: {
  draft: KnowledgeEntry; updateField: (key: string, value: string) => void; updateLines: (key: string, value: string) => void;
}) {
  return <>
    <label className="field">Explain the concept<textarea rows={4} value={draft.explanation} onChange={e => updateField('explanation', e.target.value)} placeholder="In plain language..." /></label>
    <label className="field">Bubble equivalent<input value={draft.bubbleReference} onChange={e => updateField('bubbleReference', e.target.value)} placeholder="e.g. Custom states" /></label>
    <label className="field">Bubble reference / comparison<textarea rows={3} value={draft.bubbleAnalogy} onChange={e => updateField('bubbleAnalogy', e.target.value)} placeholder="How is this similar to and different from Bubble?" /></label>
    <label className="field">Code example<textarea rows={5} className="code-input" spellCheck={false} value={draft.codeExample} onChange={e => updateField('codeExample', e.target.value)} placeholder="const [value, setValue] = useState('')" /></label>
    <label className="field">My insight<textarea rows={3} value={draft.insight} onChange={e => updateField('insight', e.target.value)} placeholder="Explain it in your own words..." /></label>
    <label className="field">Where I used / can use it<textarea rows={2} value={draft.appliedIn} onChange={e => updateField('appliedIn', e.target.value)} placeholder="Name a real feature; distinguish planned from implemented." /></label>
    <label className="field">Three review questions (one per line)<textarea rows={3} value={draft.checkQuestions.join('\n')} onChange={e => updateLines('checkQuestions', e.target.value)} placeholder={'What is it?\nWhy use it?\nHow do I verify it?'} /></label>
  </>;
}

function JournalFields({ draft, updateField, updateLines }: {
  draft: JournalEntry; updateField: (key: string, value: string) => void; updateLines: (key: string, value: string) => void;
}) {
  const fields: { key: keyof JournalEntry; title: string; placeholder: string }[] = [
    { key: 'objective', title: 'Objective', placeholder: 'What did I set out to build or solve?' },
    { key: 'decisions', title: 'Decisions made', placeholder: 'What did I choose, and why?' },
    { key: 'aiAssistance', title: 'AI assistance', placeholder: 'What did the agent do? What did I do?' },
    { key: 'challenges', title: 'Challenges / mistakes', placeholder: 'What went wrong? How did I investigate?' },
    { key: 'verification', title: 'How I verified it', placeholder: 'What did I actually run or test?' },
    { key: 'lessons', title: 'What I learned', placeholder: 'My own insight, in my own words.' },
    { key: 'next', title: 'Next step', placeholder: 'What is the next meaningful milestone?' },
  ];
  return <>
    <div className="two-fields">
      <label className="field">Project<input value={draft.project} onChange={e => updateField('project', e.target.value)} placeholder="NextHop" /></label>
      <label className="field">Session label<input value={draft.session} onChange={e => updateField('session', e.target.value)} placeholder="Session 01 · Setup" /></label>
    </div>
    {fields.map(field => <label className="field" key={field.key}>{field.title}<textarea rows={3} value={String(draft[field.key])} onChange={e => updateField(field.key, e.target.value)} placeholder={field.placeholder} /></label>)}
    <label className="field">Three reflection answers (one per line)<textarea rows={4} value={draft.reflections.join('\n')} onChange={e => updateLines('reflections', e.target.value)} placeholder="What decision did I make?\nWhat can I explain now?\nWhat would I change?" /></label>
  </>;
}
