// Available English translations from bible-api.com
export interface Translation {
  id: string;
  name: string;
  short: string;
}

export const TRANSLATIONS: Translation[] = [
  { id: "kjv", name: "King James Version", short: "KJV" },
  { id: "web", name: "World English Bible", short: "WEB" },
  { id: "asv", name: "American Standard Version", short: "ASV" },
  { id: "bbe", name: "Bible in Basic English", short: "BBE" },
  { id: "darby", name: "Darby Bible", short: "DARBY" },
  { id: "dra", name: "Douay-Rheims 1899", short: "DRA" },
  { id: "oeb-us", name: "Open English Bible (US)", short: "OEB" },
  { id: "ylt", name: "Young's Literal Translation", short: "YLT" },
];

export type TranslationId = string;

export const DEFAULT_TRANSLATION: TranslationId = "web";

// A curated set of Bible verse references to cycle through.
export const VERSE_POOL = [
  "John 3:16",
  "Psalm 23:1-6",
  "Proverbs 3:5-6",
  "Romans 8:28",
  "Philippians 4:13",
  "Isaiah 41:10",
  "Jeremiah 29:11",
  "Psalm 46:1",
  "Romans 12:2",
  "2 Timothy 1:7",
  "Matthew 11:28-30",
  "Psalm 119:105",
  "Proverbs 16:3",
  "1 Corinthians 13:4-8",
  "Galatians 5:22-23",
  "Ephesians 2:8-9",
  "Hebrews 11:1",
  "James 1:5",
  "1 Peter 5:7",
  "Psalm 27:1",
  "Psalm 37:4",
  "Isaiah 40:31",
  "Matthew 5:16",
  "Matthew 6:33",
  "John 14:6",
  "John 14:27",
  "Romans 5:8",
  "Romans 15:13",
  "2 Corinthians 5:17",
  "Philippians 4:6-7",
  "Colossians 3:23",
  "Hebrews 12:1-2",
  "Revelation 21:4",
  "Psalm 91:1-2",
  "Psalm 139:14",
  "Proverbs 18:10",
  "Isaiah 26:3",
  "Lamentations 3:22-23",
  "Micah 6:8",
  "Nahum 1:7",
  "Matthew 7:7",
  "John 8:32",
  "John 10:10",
  "Acts 1:8",
  "Romans 8:38-39",
  "1 Corinthians 10:13",
  "Ephesians 6:10",
  "Philippians 2:3-4",
  "1 Thessalonians 5:16-18",
  "1 John 4:19",
];

export interface BibleVerse {
  reference: string;
  text: string;
  translation_name: string;
}

const API_BASE = "https://bible-api.com";

export async function fetchVerse(
  reference: string,
  translation: TranslationId = DEFAULT_TRANSLATION,
): Promise<BibleVerse> {
  const encoded = encodeURIComponent(reference);
  const res = await fetch(`${API_BASE}/${encoded}?translation=${translation}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch verse: ${res.status}`);
  }

  const data = await res.json();

  const meta = TRANSLATIONS.find((t) => t.id === translation);
  return {
    reference: data.reference,
    text: data.text.trim(),
    translation_name: data.translation_name || meta?.short || translation.toUpperCase(),
  };
}

export function getRandomReference(exclude?: string): string {
  const pool = exclude
    ? VERSE_POOL.filter((v) => v !== exclude)
    : VERSE_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}
