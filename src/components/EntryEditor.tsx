'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Entry, EntryCategory, JournalEntry, KnowledgeEntry, Tab } from '@/lib/types';

const categories: EntryCategory[] = ['React', 'Next.js', 'TypeScript', 'Backend', 'Workflow', 'AI Development', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);
const makeId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'note-' + Date.now();

function blankEntry(kind: Tab): Entry {
  const common = { id: makeId(), title: '', summary: '', createdAt: today(), updatedAt: today() };
  return kind === 'knowledge'
    ? { ...common, kind, category: 'React', bubbleReference: '', explanation: '', bubbleAnalogy: '', codeExample: '', insight: '', appliedIn: '', checkQuestions: [] }
    : { ...common, kind, date: today(), project: 'NextHop', session: '', objective: '', decisions: '', aiAssistance: '', challenges: '', verification: '', lessons: '', next: '', reflections: ['', '', ''] };
}

const sections = {
  knowledge: [
    { title: 'The essentials', detail: 'Give this concept a name and a clear, useful introduction.' },
    { title: 'Make sense of it', detail: 'Explain the idea, connect it to Bubble, and keep a code example.' },
    { title: 'Make it yours', detail: 'Document where you used it and what you can now explain.' },
  ],
  journal: [
    { title: 'Set the scene', detail: 'What did you work on, and what were you trying to achieve?' },
    { title: 'Behind the build', detail: 'Capture decisions, AI collaboration, problems, and how you tested.' },
    { title: 'Takeaways', detail: 'Turn a development session into a repeatable learning experience.' },
  ],
};

export function EntryEditor({ entry, kind, onSave, onClose }: {
  entry?: Entry;
  kind: Tab;
  onSave: (entry: Entry) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Entry>(() => entry ? structuredClone(entry) : blankEntry(kind));
  const initialDraft = useRef(JSON.stringify(draft));
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const formScroll = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const changed = JSON.stringify(draft) !== initialDraft.current;
  const steps = sections[draft.kind];

  useEffect(() => {
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    return () => previousFocus.current?.focus();
  }, []);

  const requestClose = () => {
    if (!changed || window.confirm('Discard the changes in this entry?')) onClose();
  };

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = formScroll.current?.closest('[role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')).filter(element => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeys);
    return () => document.removeEventListener('keydown', handleKeys);
  });

  const updateField = (key: string, value: string) => setDraft(previous => ({ ...previous, [key]: value } as Entry));
  const updateLines = (key: string, value: string) => setDraft(previous => ({ ...previous, [key]: value.split('\n') } as Entry));
  const goToStep = (next: number) => {
    setStep(next);
    setError('');
    formScroll.current?.scrollTo({ top: 0 });
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.summary.trim()) {
      goToStep(0);
      setError('Add a title and short description before saving.');
      return;
    }
    onSave({ ...draft, title: draft.title.trim(), summary: draft.summary.trim(), updatedAt: today() });
  };

  return <div className="modal-backdrop editor-backdrop">
    <section className="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editor-heading" aria-describedby="editor-description">
      <aside className="editor-sidebar">
        <div className="editor-sidebar-top"><span className="editor-monogram">DN.</span><span className="editor-sidebar-brand">DEVELOPER NOTEBOOK<br /><span>PERSONAL WORKSPACE</span></span></div>
        <div className="editor-sidebar-context">
          <p className="eyebrow">// {draft.kind === 'knowledge' ? 'KNOWLEDGE LIBRARY' : 'BUILD JOURNAL'}</p>
          <h3>{entry ? 'Refine your notes.' : 'Make it make sense.'}</h3>
          <p>{draft.kind === 'knowledge' ? 'A place for concepts that finally clicked.' : 'A record of the work behind what you built.'}</p>
        </div>
        <nav className="editor-steps" aria-label="Entry sections">
          {steps.map((item, index) => <button key={item.title} type="button" className={'editor-step' + (step === index ? ' is-active' : '')} aria-current={step === index ? 'step' : undefined} onClick={() => goToStep(index)}>
            <span className="editor-step-number">0{index + 1}</span><span>{item.title}</span><span className="editor-step-arrow">↗</span>
          </button>)}
        </nav>
        <div className="editor-sidebar-foot"><span className="editor-sidebar-dot" aria-hidden="true" />Local writing mode<small>Saved in this browser only. Export to publish.</small></div>
      </aside>
      <div className="editor-workspace">
        <header className="editor-header">
          <div>
            <p className="eyebrow">// {entry ? 'EDIT ENTRY' : 'NEW ENTRY'} · {draft.kind === 'knowledge' ? 'KNOWLEDGE NOTE' : 'SESSION LOG'}</p>
            <h2 id="editor-heading">{entry ? 'Edit entry' : draft.kind === 'knowledge' ? 'New knowledge note' : 'New build journal'}</h2>
            <p id="editor-description">{draft.kind === 'knowledge' ? 'Write it down in a way future-you will understand.' : 'Capture what happened, not just what shipped.'}</p>
          </div>
          <button type="button" ref={closeButton} className="editor-close" onClick={requestClose} aria-label="Close editor">✕</button>
        </header>
        <form className="editor-form" noValidate onSubmit={save}>
          <div className="editor-form-scroll" ref={formScroll}>
            <div className="editor-step-heading">
              <span>0{step + 1} / 03 · {draft.kind === 'knowledge' ? 'KNOWLEDGE NOTE' : 'BUILD JOURNAL'}</span>
              <h3>{steps[step].title}</h3>
              <p>{steps[step].detail}</p>
            </div>
            {draft.kind === 'knowledge'
              ? <KnowledgeStep draft={draft} step={step} updateField={updateField} updateLines={updateLines} />
              : <JournalStep draft={draft} step={step} updateField={updateField} updateLines={updateLines} />}
            {error && <div className="editor-error" role="alert">{error}</div>}
          </div>
          <footer className="editor-actions">
            <div className="editor-progress" aria-label={'Section ' + (step + 1) + ' of 3'}>
              {[0, 1, 2].map(i => <span className={i <= step ? 'filled' : ''} key={i} />)}
              <small>Section {step + 1} of 3</small>
            </div>
            <div className="editor-footer-buttons">
              {step > 0 && <button type="button" className="button-ghost" onClick={() => goToStep(step - 1)}>← Back</button>}
              {step < 2 && <button type="button" className="editor-next" onClick={() => goToStep(step + 1)}>Next section →</button>}
              <button type="submit" className="button-solid">{entry ? 'Save changes' : 'Save entry'} ↗</button>
            </div>
          </footer>
        </form>
      </div>
    </section>
  </div>;
}

function Field({ title, value, onChange, placeholder, rows = 3, help, code = false }: {
  title: string; value: string; onChange: (value: string) => void; placeholder: string; rows?: number; help?: string; code?: boolean;
}) {
  return <label className="field"><span>{title}</span><textarea rows={rows} className={code ? 'code-input' : undefined} spellCheck={!code} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{help && <small>{help}</small>}</label>;
}

function KnowledgeStep({ draft, step, updateField, updateLines }: {
  draft: KnowledgeEntry; step: number; updateField: (key: string, value: string) => void; updateLines: (key: string, value: string) => void;
}) {
  if (step === 0) return <div className="editor-fields">
    <label className="field"><span>Category</span><select value={draft.category} onChange={e => updateField('category', e.target.value)}>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
    <label className="field"><span>Title <em>*</em></span><input className="editor-title-input" value={draft.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. React State" /></label>
    <Field title="Short description *" value={draft.summary} onChange={value => updateField('summary', value)} rows={3} placeholder="Explain what this entry covers in one or two sentences…" help="Think of this as the subtitle on your library card." />
  </div>;
  if (step === 1) return <div className="editor-fields">
    <Field title="Explain the concept" value={draft.explanation} onChange={value => updateField('explanation', value)} rows={5} placeholder="In plain language, what is it and why does it matter?" />
    <div className="editor-bubble-group">
      <p className="editor-group-label">// CONNECT IT TO WHAT YOU KNOW</p><h4>Bubble reference</h4>
      <p>Use a familiar no-code concept as a starting point. It doesn't need to be an exact equivalent.</p>
      <label className="field"><span>Closest Bubble concept</span><input value={draft.bubbleReference} onChange={e => updateField('bubbleReference', e.target.value)} placeholder="e.g. Custom states" /></label>
      <Field title="Similarities and differences" value={draft.bubbleAnalogy} onChange={value => updateField('bubbleAnalogy', value)} rows={4} placeholder="In Bubble I would…, but in React…" />
    </div>
    <Field title="Code example" code value={draft.codeExample} onChange={value => updateField('codeExample', value)} rows={5} placeholder="const [value, setValue] = useState('');" help="A small example you can explain is better than a large pasted snippet." />
  </div>;
  return <div className="editor-fields">
    <Field title="My own understanding" value={draft.insight} onChange={value => updateField('insight', value)} rows={5} placeholder="What finally made this click for me?" />
    <Field title="Where I applied it" value={draft.appliedIn} onChange={value => updateField('appliedIn', value)} rows={3} placeholder="Name the project and feature. If not implemented yet, say 'planned'." />
    <div className="editor-reflection">
      <p className="editor-group-label">// SELF CHECK</p><h4>Three questions for future you</h4>
      <p>Questions you should be able to answer without asking the coding agent.</p>
      <Field title="One question per line" value={draft.checkQuestions.join('\n')} onChange={value => updateLines('checkQuestions', value)} rows={4} placeholder={'What is it?\nWhen would I use it?\nHow can I verify it?'} />
    </div>
  </div>;
}

function JournalStep({ draft, step, updateField, updateLines }: {
  draft: JournalEntry; step: number; updateField: (key: string, value: string) => void; updateLines: (key: string, value: string) => void;
}) {
  if (step === 0) return <div className="editor-fields">
    <div className="two-fields">
      <label className="field"><span>Project</span><input value={draft.project} onChange={e => updateField('project', e.target.value)} placeholder="NextHop" /></label>
      <label className="field"><span>Date</span><input type="date" value={draft.date} onChange={e => updateField('date', e.target.value)} /></label>
    </div>
    <label className="field"><span>Session label</span><input value={draft.session} onChange={e => updateField('session', e.target.value)} placeholder="Session 01 · Setup" /></label>
    <label className="field"><span>Title <em>*</em></span><input className="editor-title-input" value={draft.title} onChange={e => updateField('title', e.target.value)} placeholder="What did you work on today?" /></label>
    <Field title="Short description *" value={draft.summary} onChange={value => updateField('summary', value)} rows={2} placeholder="One sentence about the session…" />
    <Field title="Objective" value={draft.objective} onChange={value => updateField('objective', value)} rows={3} placeholder="What did I set out to build or solve?" />
  </div>;
  if (step === 1) return <div className="editor-fields">
    <Field title="Decisions I made" value={draft.decisions} onChange={value => updateField('decisions', value)} rows={4} placeholder="What did I choose, and why?" />
    <div className="editor-bubble-group">
      <p className="editor-group-label">// WORKING WITH AI</p><h4>AI collaboration</h4>
      <p>Separate what the agent generated from what you personally decided, reviewed or verified.</p>
      <Field title="What AI helped with" value={draft.aiAssistance} onChange={value => updateField('aiAssistance', value)} rows={4} placeholder="The agent proposed…, I chose…, then I checked…" />
    </div>
    <Field title="Challenges and mistakes" value={draft.challenges} onChange={value => updateField('challenges', value)} rows={3} placeholder="What went wrong? How did I investigate?" />
    <Field title="How I verified the result" value={draft.verification} onChange={value => updateField('verification', value)} rows={3} placeholder="What commands, tests, or manual checks did I run?" />
  </div>;
  return <div className="editor-fields">
    <Field title="What I learned" value={draft.lessons} onChange={value => updateField('lessons', value)} rows={5} placeholder="Explain the insight in your own words." />
    <Field title="Next meaningful step" value={draft.next} onChange={value => updateField('next', value)} rows={2} placeholder="What will I build or investigate next?" />
    <div className="editor-reflection">
      <p className="editor-group-label">// END-OF-SESSION REFLECTION</p><h4>Three questions</h4>
      <p>Your interview preparation, written while the experience is still fresh.</p>
      <Field title="Your answers, one per line" value={draft.reflections.join('\n')} onChange={value => updateLines('reflections', value)} rows={5} placeholder={'What decision did I make myself?\nWhat can I explain now?\nWhat would I do differently next time?'} />
    </div>
  </div>;
}
