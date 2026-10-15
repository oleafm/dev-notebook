/** A discriminated union: kind tells TypeScript which fields an entry has. */
export type EntryCategory = 'React' | 'Next.js' | 'TypeScript' | 'Backend' | 'Workflow' | 'AI Development' | 'Other';

export type BaseEntry = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeEntry = BaseEntry & {
  kind: 'knowledge';
  category: EntryCategory;
  bubbleReference: string;
  explanation: string;
  bubbleAnalogy: string;
  codeExample: string;
  insight: string;
  appliedIn: string;
  checkQuestions: string[];
};

export type JournalEntry = BaseEntry & {
  kind: 'journal';
  date: string;
  project: string;
  session: string;
  objective: string;
  decisions: string;
  aiAssistance: string;
  challenges: string;
  verification: string;
  lessons: string;
  next: string;
  reflections: string[];
};

export type Entry = KnowledgeEntry | JournalEntry;
export type Tab = Entry['kind'];
