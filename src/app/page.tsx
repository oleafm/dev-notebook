import { NotebookApp } from '@/components/NotebookApp';
import { seedEntries } from '@/data/seed';

export default function HomePage() {
  // The public deployment is read-only unless authoring is explicitly enabled.
  // This is a UI switch, not a replacement for real authentication.
  const authoringEnabled = process.env.NEXT_PUBLIC_AUTHORING_MODE === 'true';
  return <NotebookApp initialEntries={seedEntries} authoringEnabled={authoringEnabled} />;
}
