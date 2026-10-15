'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Entry, EntryCategory, KnowledgeEntry, Tab } from '@/lib/types';
import { EntryReader } from './EntryReader';
import { EntryEditor } from './EntryEditor';

const STORAGE_KEY = 'developer-notebook-local-v1';

const iconLetters: Record<EntryCategory, string> = {
  React: 'R', 'Next.js': 'N', TypeScript: 'TS', Backend: 'DB', Workflow: 'G', 'AI Development': 'AI', Other: 'N',
};

export function NotebookApp({ initialEntries, authoringEnabled }: { initialEntries: Entry[]; authoringEnabled: boolean }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [tab, setTab] = useState<Tab>('knowledge');
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!authoringEnabled) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: unknown = JSON.parse(raw);
        if (Array.isArray(stored) && stored.every(item => item && typeof item === 'object' && (item.kind === 'knowledge' || item.kind === 'journal') && typeof item.id === 'string')) {
          setEntries(stored as Entry[]);
        }
      }
    } catch { setNotice('Local drafts could not be loaded. The published sample entries are still available.'); }
  }, [authoringEnabled]);

  useEffect(() => {
    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#note=/, ''));
      if (window.location.hash.startsWith('#note=') && id) {
        setSelectedId(id);
        const target = initialEntries.find(entry => entry.id === id);
        if (target) setTab(target.kind);
      } else setSelectedId(null);
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [initialEntries]);

  const selected = entries.find(entry => entry.id === selectedId) ?? null;
  const currentTab: Tab = selected?.kind ?? tab;
  const categories = useMemo(() => ['All', ...new Set(entries.filter(e => e.kind === 'knowledge').map(e => e.category))], [entries]);
  const filtered = useMemo(() => entries.filter(entry => {
    if (entry.kind !== tab) return false;
    if (entry.kind === 'knowledge' && category !== 'All' && entry.category !== category) return false;
    const words = entry.kind === 'knowledge'
      ? [entry.title, entry.summary, entry.category, entry.bubbleReference, entry.explanation]
      : [entry.title, entry.summary, entry.project, entry.session, entry.objective];
    return words.join(' ').toLowerCase().includes(search.trim().toLowerCase());
  }), [entries, tab, category, search]);

  const navigateTo = (id: string) => {
    const target = entries.find(entry => entry.id === id);
    if (target) setTab(target.kind);
    setSelectedId(id);
    window.location.hash = `note=${encodeURIComponent(id)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setSelectedId(null);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };
  const changeTab = (next: Tab) => { setTab(next); setCategory('All'); setSearch(''); goBack(); };
  const persist = (next: Entry[]) => {
    setEntries(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { setNotice('Could not save locally. Check browser storage permissions or available space.'); }
  };
  const saveEntry = (entry: Entry) => {
    const next = entries.some(existing => existing.id === entry.id)
      ? entries.map(existing => existing.id === entry.id ? entry : existing)
      : [entry, ...entries];
    persist(next);
    setEditorOpen(false); setEditingId(null); setTab(entry.kind); navigateAfterSave(entry.id);
    setNotice('Saved locally. Export your notes to include them in a public deployment.');
  };
  const navigateAfterSave = (id: string) => { setSelectedId(id); window.location.hash = `note=${encodeURIComponent(id)}`; };
  const deleteEntry = () => {
    if (!selected || !window.confirm(`Delete “${selected.title}” from your local notebook?`)) return;
    persist(entries.filter(entry => entry.id !== selected.id));
    goBack(); setNotice('Entry deleted locally.');
  };
  const exportEntries = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'entries.json'; anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Exported entries.json. To publish, replace src/data/entries.json and redeploy.');
  };

  return <div className="site-shell">
    <div className="site-top"><div className="container top-inner">
      <button className="brand-link" type="button" onClick={() => { changeTab('knowledge'); window.scrollTo({top:0,behavior:'smooth'}); }} aria-label="Developer Notebook home">
        <span className="brand-mark">DN.</span>
        <span className="brand-copy"><strong>Developer Notebook</strong><small>A PERSONAL ENGINEERING LIBRARY</small></span>
      </button>
      <div className="header-right"><span>PORTFOLIO EXTENSION</span><span className="header-divider">/</span><small>Learning by building.</small></div>
    </div></div>
    <main className="container main-content">
      <header className="hero">
        <p className="eyebrow">{selected ? `// ${selected.kind === 'knowledge' ? 'KNOWLEDGE NOTE' : 'BUILD JOURNAL'}` : currentTab === 'knowledge' ? '// THE LEARNING ARCHIVE' : '// THE BUILD PROCESS'}</p>
        <h1>{selected ? 'The notes behind the work.' : currentTab === 'knowledge' ? 'Built to understand.' : 'Built. Tested. Learned.'}</h1>
        <p>{selected ? 'A closer look at the concept, the thinking, and the practical context.' : currentTab === 'knowledge' ? 'A collection of concepts, decisions and lessons learned while turning ideas into working products. Written for future me.' : 'A chronological record of choices, problems and lessons behind each project. Not just what shipped, but how it happened.'}</p>
      </header>

      {selected ? <EntryReader entry={selected} authoringEnabled={authoringEnabled} onBack={goBack} onEdit={() => { setEditingId(selected.id); setEditorOpen(true); }} onDelete={deleteEntry} /> : <>
        <div className="toolbar">
          <div role="tablist" aria-label="Notebook section" className="tabs">
            <button type="button" role="tab" aria-selected={tab === 'knowledge'} className={tab === 'knowledge' ? 'tab active' : 'tab'} onClick={() => changeTab('knowledge')}>Knowledge Library <span className="tab-count">{String(entries.filter(e => e.kind === 'knowledge').length).padStart(2, '0')}</span></button>
            <button type="button" role="tab" aria-selected={tab === 'journal'} className={tab === 'journal' ? 'tab active' : 'tab'} onClick={() => changeTab('journal')}>Build Journal <span className="tab-count">{String(entries.filter(e => e.kind === 'journal').length).padStart(2, '0')}</span></button>
          </div>
          <div className="toolbar-actions"><label className="search-box"><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search notebook entries</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search my notes..." type="search" /></label>
            {authoringEnabled && <><button className="new-entry" type="button" onClick={() => { setEditingId(null); setEditorOpen(true); }}>+ New entry</button><button className="export-button" type="button" title="Export all notes as entries.json" onClick={exportEntries}>Export ↗</button></>}
          </div>
        </div>
        {tab === 'knowledge' && <div className="filters" aria-label="Category filters">{categories.map(c => <button type="button" key={c} className={category === c ? 'filter active' : 'filter'} onClick={() => setCategory(c)}>{c}</button>)}</div>}
        <div className="section-heading"><span>// {tab === 'knowledge' ? 'KNOWLEDGE ENTRIES' : 'BUILD JOURNAL'}</span><span>{filtered.length} {tab === 'knowledge' ? (filtered.length === 1 ? 'ENTRY' : 'ENTRIES') : (filtered.length === 1 ? 'SESSION' : 'SESSIONS')}</span></div>
        {filtered.length === 0 ? <div className="empty-state"><strong>No matching entries.</strong><p>Try another keyword or category.</p></div> : tab === 'knowledge' ? <div className="entry-grid">{filtered.map(entry => entry.kind === 'knowledge' && <KnowledgeCard key={entry.id} entry={entry} onClick={() => navigateTo(entry.id)} />)}</div> : <div className="journal-list">{filtered.map(entry => entry.kind === 'journal' && <JournalCard key={entry.id} entry={entry} onClick={() => navigateTo(entry.id)} />)}</div>}
        <div className="tip-box"><span className="tip-symbol">✳</span><div><strong>{tab === 'knowledge' ? 'Theory meets practice.' : 'Document the actual work.'}</strong><p>{tab === 'knowledge' ? 'Each note connects a technical concept to familiar Bubble ideas, practical examples and a real project. Some starter entries describe work we have not done yet.' : 'Record what you decided, how AI helped, what went wrong, and what you actually tested. This becomes evidence for interviews.'}</p></div></div>
      </>}
      {notice && <div className="status-notice" role="status">{notice}<button type="button" aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}
      <footer className="footer"><span>Developer Notebook © 2026</span><span>{authoringEnabled ? 'Local writing mode · changes stay in your browser until exported' : 'Public reading edition · learning by building'}</span></footer>
    </main>
    {editorOpen && authoringEnabled && <EntryEditor key={editingId ?? `new-${tab}`} kind={tab} entry={entries.find(entry => entry.id === editingId)} onSave={saveEntry} onClose={() => { setEditorOpen(false); setEditingId(null); }} />}
  </div>;
}

function KnowledgeCard({ entry, onClick }: { entry: KnowledgeEntry; onClick: () => void }) {
  return <button type="button" className="entry-card" onClick={onClick}>
    <div className="entry-card-top"><span className="entry-icon">{iconLetters[entry.category]}</span><span className="card-type">{entry.category}</span></div>
    <h3>{entry.title}</h3><p>{entry.summary}</p>
    <div className="card-bottom"><span>{entry.bubbleReference ? `BUBBLE: ${entry.bubbleReference.toUpperCase()}` : 'KNOWLEDGE NOTE'}</span><span className="card-arrow">↗</span></div>
  </button>;
}

function JournalCard({ entry, onClick }: { entry: Extract<Entry, { kind: 'journal' }>; onClick: () => void }) {
  const date = new Date(`${entry.date}T12:00:00Z`);
  const dateLabel = isNaN(date.getTime()) ? entry.date : new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
  return <button type="button" className="journal-card" onClick={onClick}>
    <div className="journal-date">{dateLabel}</div><div className="journal-body"><span className="card-type">{entry.session} · {entry.project}</span><h3>{entry.title}</h3><p>{entry.summary}</p></div><span className="card-arrow">↗</span>
  </button>;
}
