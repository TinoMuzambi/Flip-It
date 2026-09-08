export const STORAGE_KEY = "flip-it.deck.v1";
export const CARD_LIMIT = 200;
export const TEXT_LIMIT = 1_000;
export const TAG_LIMIT = 5;

export type Card = {
  id: string;
  prompt: string;
  answer: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Deck = {
  version: 1;
  title: string;
  cards: Card[];
};

const starterCards: Card[] = [
  {
    id: "event-loop",
    prompt: "What does the JavaScript event loop coordinate?",
    answer:
      "It coordinates the call stack and queued work. Once the stack is empty, microtasks run before the next task such as a timer or input event.",
    tags: ["JavaScript", "runtime"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "semantic-html",
    prompt: "Why use semantic HTML before adding ARIA?",
    answer:
      "Native elements provide keyboard behaviour, roles, names, and states by default. ARIA can describe semantics, but it does not add the expected interaction.",
    tags: ["accessibility", "HTML"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "database-index",
    prompt: "What trade-off does a database index make?",
    answer:
      "It spends storage and write-time maintenance to make selected reads faster. Indexes should follow real query patterns rather than every available column.",
    tags: ["databases"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "http-idempotent",
    prompt: "What makes an HTTP method idempotent?",
    answer:
      "Repeating the same request has the same intended server-side effect as making it once. GET, PUT, and DELETE are defined as idempotent; POST generally is not.",
    tags: ["HTTP", "APIs"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "test-pyramid",
    prompt: "What is the practical value of a test pyramid?",
    answer:
      "It encourages many fast, focused tests and fewer broad integration or end-to-end tests, balancing useful confidence with feedback speed and maintenance cost.",
    tags: ["testing"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "csp",
    prompt: "What risk does a Content Security Policy reduce?",
    answer:
      "A CSP limits which resources a page may execute or load. A restrictive policy reduces the impact of injected content, especially cross-site scripting.",
    tags: ["security", "web"],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export const starterDeck: Deck = {
  version: 1,
  title: "Developer fundamentals",
  cards: starterCards,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`${field} must be text.`);
  const cleaned = value.trim();
  if (!cleaned) throw new Error(`${field} cannot be empty.`);
  if (cleaned.length > TEXT_LIMIT) {
    throw new Error(`${field} must be ${TEXT_LIMIT.toLocaleString()} characters or fewer.`);
  }
  return cleaned;
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("Card tags must be a list.");
  const tags = value.map((tag) => {
    if (typeof tag !== "string") throw new Error("Every tag must be text.");
    return tag.trim().slice(0, 30);
  });
  return [...new Set(tags.filter(Boolean))].slice(0, TAG_LIMIT);
}

export function parseDeck(value: unknown): Deck {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("This is not a supported Flip-It deck.");
  }
  const title = cleanText(value.title, "Deck title");
  if (!Array.isArray(value.cards)) throw new Error("Deck cards must be a list.");
  if (value.cards.length > CARD_LIMIT) {
    throw new Error(`A deck can contain at most ${CARD_LIMIT} cards.`);
  }

  const seenIds = new Set<string>();
  const cards = value.cards.map((candidate, index): Card => {
    if (!isRecord(candidate)) throw new Error(`Card ${index + 1} is invalid.`);
    const id = cleanText(candidate.id, `Card ${index + 1} ID`);
    if (id.length > 100 || seenIds.has(id)) {
      throw new Error(`Card ${index + 1} has an invalid or duplicate ID.`);
    }
    seenIds.add(id);

    const createdAt = cleanText(candidate.createdAt, `Card ${index + 1} created date`);
    const updatedAt = cleanText(candidate.updatedAt, `Card ${index + 1} updated date`);
    if (Number.isNaN(Date.parse(createdAt)) || Number.isNaN(Date.parse(updatedAt))) {
      throw new Error(`Card ${index + 1} has an invalid date.`);
    }

    return {
      id,
      prompt: cleanText(candidate.prompt, `Card ${index + 1} prompt`),
      answer: cleanText(candidate.answer, `Card ${index + 1} answer`),
      tags: cleanTags(candidate.tags),
      createdAt,
      updatedAt,
    };
  });

  return { version: 1, title, cards };
}

export function filterCards(cards: Card[], query: string): Card[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return cards;
  return cards.filter((card) =>
    [card.prompt, card.answer, ...card.tags].some((part) =>
      part.toLocaleLowerCase().includes(needle),
    ),
  );
}

export function shuffleCards<T>(items: T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const sample = Math.min(Math.max(random(), 0), 0.999999999);
    const target = Math.floor(sample * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!];
  }
  return shuffled;
}
