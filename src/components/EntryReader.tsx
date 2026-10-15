'use client';

import type { Entry, JournalEntry, KnowledgeEntry } from '@/lib/types';

function Section({ heading, value }: { heading: string; value: string }) {
  if (!value.trim()) return null;
  return <section className="reading-section"><h3>{heading}</h3><p>{value}</p></section>;
}

function KnowledgeReader({ entry }: { entry: KnowledgeEntry }) {
  return <>
    <Section heading="In plain language" value={entry.explanation} />
    {entry.bubbleAnalogy && <aside className="bubble-reference"><div className="highlight-label">// BUBBLE REFERENCE {entry.bubbleReference && `· ${entry.bubbleReference}`}</div><p>{entry.bubbleAnalogy}</p></aside>}
    {entry.codeExample && <section className="reading-section"><h3>Code example</h3><pre className="code-block"><code>{entry.codeExample}</code></pre></section>}
    <Section heading="My understanding" value={entry.insight} />
    <Section heading="Where I can apply it" value={entry.appliedIn} />
    {entry.checkQuestions.filter(Boolean).length > 0 && <aside className="question-box"><strong>What I should be able to explain</strong><ol>{entry.checkQuestions.filter(Boolean).map((question, index) => <li key={index}>{question}</li>)}</ol></aside>}
  </>;
}

function JournalReader({ entry }: { entry: JournalEntry }) {
  return <>
    <Section heading="Objective" value={entry.objective} />
    <Section heading="Decisions made" value={entry.decisions} />
    <Section heading="AI assistance" value={entry.aiAssistance} />
    <Section heading="Challenges & mistakes" value={entry.challenges} />
    <Section heading="How I verified the result" value={entry.verification} />
    <aside className="bubble-reference"><div className="highlight-label">// LESSONS LEARNED</div><p>{entry.lessons || 'Add your key learning after completing the session.'}</p></aside>
    <Section heading="Next step" value={entry.next} />
    {entry.reflections.filter(Boolean).length > 0 && <section className="reading-section"><h3>Three reflection questions / answers</h3><ol className="review-questions">{entry.reflections.filter(Boolean).map((answer, index) => <li key={index}>{answer}</li>)}</ol></section>}
  </>;
}

export function EntryReader({ entry, authoringEnabled, onBack, onEdit, onDelete }: {
  entry: Entry;
  authoringEnabled: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return <article className="reader">
    <button type="button" className="back-link" onClick={onBack}>← Back to {entry.kind === 'knowledge' ? 'Knowledge Library' : 'Build Journal'}</button>
    <p className="eyebrow">// {entry.kind === 'knowledge' ? `${entry.category.toUpperCase()} / KNOWLEDGE` : `${entry.project.toUpperCase()} / ${entry.session.toUpperCase()}`}</p>
    <h2 className="reader-title">{entry.title}</h2>
    <p className="reader-description">{entry.summary}</p>
    <div className="reader-tags"><span className="small-pill">{entry.kind === 'knowledge' ? entry.category : 'Build Journal'}</span>{entry.kind === 'knowledge' && entry.bubbleReference && <span className="small-pill">Bubble reference</span>}<span className="small-pill">Updated {entry.updatedAt}</span></div>
    {entry.kind === 'knowledge' ? <KnowledgeReader entry={entry} /> : <JournalReader entry={entry} />}
    <div className="reader-actions">{authoringEnabled && <><button type="button" className="button-outline" onClick={onEdit}>Edit note ↗</button><button type="button" className="button-danger" onClick={onDelete}>Delete locally</button></>}<button type="button" className="button-ghost" onClick={onBack}>← All entries</button></div>
  </article>;
}
