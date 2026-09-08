import { describe, expect, it } from "vitest";

import { CARD_LIMIT, filterCards, parseDeck, shuffleCards, starterDeck } from "./deck";

describe("parseDeck", () => {
  it("accepts a valid exported deck", () => {
    expect(parseDeck(starterDeck)).toEqual(starterDeck);
  });

  it("rejects duplicate card IDs", () => {
    const card = starterDeck.cards[0]!;
    expect(() => parseDeck({ ...starterDeck, cards: [card, card] })).toThrow(/duplicate ID/);
  });

  it("rejects oversized decks", () => {
    const card = starterDeck.cards[0]!;
    const cards = Array.from({ length: CARD_LIMIT + 1 }, (_, index) => ({
      ...card,
      id: `card-${index}`,
    }));
    expect(() => parseDeck({ ...starterDeck, cards })).toThrow(/at most/);
  });

  it("rejects malformed date fields", () => {
    const card = { ...starterDeck.cards[0]!, updatedAt: "not-a-date" };
    expect(() => parseDeck({ ...starterDeck, cards: [card] })).toThrow(/invalid date/);
  });
});

describe("filterCards", () => {
  it("matches prompts, answers, and tags without case sensitivity", () => {
    expect(filterCards(starterDeck.cards, "JAVASCRIPT")).toHaveLength(1);
    expect(filterCards(starterDeck.cards, "native elements")).toHaveLength(1);
    expect(filterCards(starterDeck.cards, "security")).toHaveLength(1);
  });
});

describe("shuffleCards", () => {
  it("returns a shuffled copy without mutating its input", () => {
    const input = [1, 2, 3, 4];
    expect(shuffleCards(input, () => 0)).toEqual([2, 3, 4, 1]);
    expect(input).toEqual([1, 2, 3, 4]);
  });
});
