import rawEntries from './entries.json';
import type { Entry } from '@/lib/types';

/** These are the notes that will be visible on the public, read-only site. */
export const seedEntries: Entry[] = rawEntries as Entry[];
