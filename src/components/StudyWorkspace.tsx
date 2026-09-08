"use client";

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";

import {
  CARD_LIMIT,
  STORAGE_KEY,
  TAG_LIMIT,
  TEXT_LIMIT,
  type Card,
  type Deck,
  filterCards,
  parseDeck,
  shuffleCards,
  starterDeck,
} from "@/lib/deck";

type IconProps = { size?: number };

function FlipIcon({ size = 20 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 10V5a1 1 0 0 1 1-1h5M20 14v5a1 1 0 0 1-1 1h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ size = 18 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ size = 18 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ size = 18 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon({ size = 18 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4m0 0 4 4m-4-4L8 8M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Draft = { prompt: string; answer: string; tags: string };
type Session = {
  cards: Card[];
  index: number;
  known: number;
  again: number;
  complete: boolean;
};

const emptyDraft: Draft = { prompt: "", answer: "", tags: "" };

function cloneStarterDeck(): Deck {
  return { ...starterDeck, cards: starterDeck.cards.map((card) => ({ ...card, tags: [...card.tags] })) };
}

function tagsFromInput(value: string): string[] {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))].slice(0, TAG_LIMIT);
}

export function StudyWorkspace() {
  const [deck, setDeck] = useState<Deck>(cloneStarterDeck);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"library" | "study">("library");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [revealed, setRevealed] = useState(false);
  const skipFirstSave = useRef(true);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- Hydrate persisted browser data after the server render to avoid a content mismatch. */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDeck(parseDeck(JSON.parse(saved) as unknown));
    } catch {
      setStatus("Your saved deck could not be read. The starter deck is shown instead.");
    } finally {
      setReady(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
  }, [deck, ready]);

  useEffect(() => {
    if (editorOpen) promptRef.current?.focus();
  }, [editorOpen]);

  const filteredCards = filterCards(deck.cards, query);
  const topics = new Set(deck.cards.flatMap((card) => card.tags)).size;
  const currentCard = session?.cards[session.index];

  function openNewCard() {
    setDraft(emptyDraft);
    setEditingId(null);
    setEditorOpen(true);
  }

  function openEditCard(card: Card) {
    setDraft({ prompt: card.prompt, answer: card.answer, tags: card.tags.join(", ") });
    setEditingId(card.id);
    setEditorOpen(true);
  }

  function closeEditor() {
    setDraft(emptyDraft);
    setEditingId(null);
    setEditorOpen(false);
  }

  function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = draft.prompt.trim();
    const answer = draft.answer.trim();
    if (!prompt || !answer) {
      setStatus("Add both a prompt and an answer before saving.");
      return;
    }
    if (!editingId && deck.cards.length >= CARD_LIMIT) {
      setStatus(`This deck has reached its ${CARD_LIMIT}-card limit.`);
      return;
    }

    const now = new Date().toISOString();
    const tags = tagsFromInput(draft.tags);
    if (editingId) {
      setDeck((current) => ({
        ...current,
        cards: current.cards.map((card) =>
          card.id === editingId ? { ...card, prompt, answer, tags, updatedAt: now } : card,
        ),
      }));
      setStatus("Card updated.");
    } else {
      const card: Card = {
        id: crypto.randomUUID(),
        prompt,
        answer,
        tags,
        createdAt: now,
        updatedAt: now,
      };
      setDeck((current) => ({ ...current, cards: [card, ...current.cards] }));
      setStatus("Card added to your deck.");
    }
    closeEditor();
  }

  function deleteCard(card: Card) {
    if (!window.confirm(`Delete “${card.prompt}”? This cannot be undone.`)) return;
    setDeck((current) => ({ ...current, cards: current.cards.filter(({ id }) => id !== card.id) }));
    if (editingId === card.id) closeEditor();
    setStatus("Card deleted.");
  }

  function exportDeck() {
    const blob = new Blob([`${JSON.stringify(deck, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${deck.title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "flip-it-deck"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Deck exported.");
  }

  async function importDeck(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      setStatus("That file is too large. Flip-It accepts deck files up to 1 MB.");
      return;
    }
    try {
      const incoming = parseDeck(JSON.parse(await file.text()) as unknown);
      if (!window.confirm(`Replace your current deck with “${incoming.title}”?`)) return;
      setDeck(incoming);
      setQuery("");
      closeEditor();
      setStatus(`Imported ${incoming.cards.length} cards.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That deck file is invalid.");
    }
  }

  function resetDeck() {
    if (!window.confirm("Replace your current deck with the six starter cards?")) return;
    setDeck(cloneStarterDeck());
    setQuery("");
    closeEditor();
    setStatus("Starter deck restored.");
  }

  function startStudy() {
    if (!deck.cards.length) {
      setStatus("Add at least one card before starting a study session.");
      return;
    }
    setSession({ cards: shuffleCards(deck.cards), index: 0, known: 0, again: 0, complete: false });
    setRevealed(false);
    setView("study");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function assess(result: "known" | "again") {
    if (!session || !revealed) return;
    const lastCard = session.index === session.cards.length - 1;
    setSession({
      ...session,
      index: lastCard ? session.index : session.index + 1,
      known: session.known + (result === "known" ? 1 : 0),
      again: session.again + (result === "again" ? 1 : 0),
      complete: lastCard,
    });
    setRevealed(false);
  }

  function leaveStudy() {
    setView("library");
    setSession(null);
    setRevealed(false);
  }

  if (!ready) {
    return (
      <main className="loading-screen">
        <span className="loading-mark" aria-hidden="true"><FlipIcon size={30} /></span>
        <p>Opening your study desk…</p>
      </main>
    );
  }

  if (view === "study" && session) {
    const total = session.cards.length;
    const answered = session.known + session.again;
    const accuracy = answered ? Math.round((session.known / answered) * 100) : 0;

    return (
      <>
        <a className="skip-link" href="#study-card">Skip to study card</a>
        <header className="study-header">
          <button className="brand brand-button" type="button" onClick={leaveStudy} aria-label="Leave study session">
            <span className="brand-mark"><FlipIcon size={22} /></span>
            <span>Flip-It</span>
          </button>
          <button className="button button-quiet" type="button" onClick={leaveStudy}>End session</button>
        </header>
        <main className="study-shell">
          {session.complete ? (
            <section className="results" aria-labelledby="results-title">
              <span className="results-stamp" aria-hidden="true">✓</span>
              <p className="section-kicker">Session complete</p>
              <h1 id="results-title">You worked through the whole deck.</h1>
              <p className="results-copy">Recall is a signal, not a score. Keep the cards that felt difficult in the next round.</p>
              <div className="result-grid" aria-label="Session results">
                <div><strong>{accuracy}%</strong><span>recalled</span></div>
                <div><strong>{session.known}</strong><span>knew it</span></div>
                <div><strong>{session.again}</strong><span>review again</span></div>
              </div>
              <div className="results-actions">
                <button className="button button-primary" type="button" onClick={startStudy}><FlipIcon />Study again</button>
                <button className="button button-secondary" type="button" onClick={leaveStudy}>Back to deck</button>
              </div>
            </section>
          ) : currentCard ? (
            <section className="study-stage" aria-labelledby="study-heading">
              <div className="progress-row">
                <div>
                  <p className="section-kicker" id="study-heading">Study session</p>
                  <p className="progress-copy">Card {session.index + 1} of {total}</p>
                </div>
                <div className="progress-track" aria-label={`${answered} of ${total} cards completed`} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}>
                  <span style={{ width: `${(answered / total) * 100}%` }} />
                </div>
              </div>
              <button
                className={`study-card${revealed ? " is-revealed" : ""}`}
                id="study-card"
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-pressed={revealed}
                aria-label={revealed ? "Answer shown. Flip back to the prompt." : "Prompt shown. Reveal the answer."}
              >
                <span className="card-side-label">{revealed ? "Answer" : "Prompt"}</span>
                <span className="study-card-copy">{revealed ? currentCard.answer : currentCard.prompt}</span>
                <span className="flip-hint"><FlipIcon size={18} />{revealed ? "Show prompt" : "Reveal answer"}</span>
              </button>
              {currentCard.tags.length > 0 && (
                <ul className="tag-list study-tags" aria-label="Card topics">
                  {currentCard.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              )}
              <div className="assessment" aria-label="How well did you recall this card?">
                <button className="button button-secondary" type="button" disabled={!revealed} onClick={() => assess("again")}>Review again</button>
                <button className="button button-primary" type="button" disabled={!revealed} onClick={() => assess("known")}>I knew it</button>
              </div>
              {!revealed && <p className="assessment-hint">Reveal the answer before rating your recall.</p>}
            </section>
          ) : null}
        </main>
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#deck">Skip to your deck</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Flip-It home">
            <span className="brand-mark"><FlipIcon size={22} /></span>
            <span>Flip-It</span>
          </a>
          <div className="privacy-note"><span aria-hidden="true">●</span>Private by default. Stored on this device.</div>
          <button className="button button-primary header-study" type="button" onClick={startStudy}><FlipIcon />Study deck</button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="section-kicker">Your local study desk</p>
            <h1 id="page-title">Remember the parts worth keeping.</h1>
            <p className="hero-intro">Build a sharp deck, flip through it without distractions, and decide what needs another pass. No account. No tracking.</p>
            <div className="hero-actions">
              <button className="button button-primary button-large" type="button" onClick={startStudy}><FlipIcon />Start a study session</button>
              <button className="button button-secondary button-large" type="button" onClick={openNewCard}><PlusIcon />Add a card</button>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="hero-card-shadow" />
            <div className="hero-card-paper">
              <span>Prompt</span>
              <strong>What will you remember tomorrow?</strong>
              <div className="scribble"><i /><i /><i /></div>
              <small>Tap to flip</small>
            </div>
          </div>
        </section>

        <section className="deck-section" id="deck" aria-labelledby="deck-title">
          <div className="deck-heading">
            <div>
              <p className="section-kicker">Current deck</p>
              <h2 id="deck-title">{deck.title}</h2>
            </div>
            <dl className="deck-stats">
              <div><dt>Cards</dt><dd>{deck.cards.length}</dd></div>
              <div><dt>Topics</dt><dd>{topics}</dd></div>
              <div><dt>Cloud sync</dt><dd>Off</dd></div>
            </dl>
          </div>

          <div className="deck-toolbar">
            <label className="search-box">
              <span className="sr-only">Search cards</span>
              <SearchIcon />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompts, answers, or topics" />
            </label>
            <div className="toolbar-actions">
              <button className="button button-quiet" type="button" onClick={exportDeck} disabled={!deck.cards.length}><DownloadIcon />Export</button>
              <label className="button button-quiet import-button"><UploadIcon />Import<input className="sr-only" type="file" accept="application/json,.json" onChange={importDeck} /></label>
              <button className="button button-secondary" type="button" onClick={openNewCard}><PlusIcon />New card</button>
            </div>
          </div>

          {editorOpen && (
            <form className="card-editor" onSubmit={saveCard} aria-labelledby="editor-title">
              <div className="editor-heading">
                <div>
                  <p className="section-kicker">{editingId ? "Edit card" : "New card"}</p>
                  <h3 id="editor-title">{editingId ? "Tighten this memory cue" : "Add something worth recalling"}</h3>
                </div>
                <button className="text-button" type="button" onClick={closeEditor}>Close</button>
              </div>
              <div className="editor-grid">
                <label>Prompt<textarea ref={promptRef} required maxLength={TEXT_LIMIT} rows={4} value={draft.prompt} onChange={(event) => setDraft({ ...draft, prompt: event.target.value })} placeholder="Ask one clear question" /></label>
                <label>Answer<textarea required maxLength={TEXT_LIMIT} rows={4} value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} placeholder="Write the shortest useful answer" /></label>
              </div>
              <div className="editor-footer">
                <label className="tag-input">Topics <span>(comma-separated, up to {TAG_LIMIT})</span><input maxLength={160} value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="JavaScript, testing" /></label>
                <div className="editor-actions">
                  <button className="button button-quiet" type="button" onClick={closeEditor}>Cancel</button>
                  <button className="button button-primary" type="submit">{editingId ? "Save changes" : "Add card"}</button>
                </div>
              </div>
            </form>
          )}

          <div className="library-summary">
            <p>{query ? `${filteredCards.length} matching ${filteredCards.length === 1 ? "card" : "cards"}` : `${deck.cards.length} ${deck.cards.length === 1 ? "card" : "cards"}`}</p>
            {query && <button className="text-button" type="button" onClick={() => setQuery("")}>Clear search</button>}
          </div>

          {filteredCards.length > 0 ? (
            <div className="card-grid">
              {filteredCards.map((card, index) => (
                <article className="library-card" key={card.id}>
                  <div className="library-card-top">
                    <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                    <div className="card-menu">
                      <button className="text-button" type="button" onClick={() => openEditCard(card)}>Edit</button>
                      <button className="text-button text-danger" type="button" onClick={() => deleteCard(card)}>Delete</button>
                    </div>
                  </div>
                  <h3>{card.prompt}</h3>
                  <p>{card.answer}</p>
                  {card.tags.length > 0 && <ul className="tag-list" aria-label="Card topics">{card.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true"><FlipIcon size={28} /></span>
              <h3>{query ? "No cards match that search." : "Your deck is ready for its first card."}</h3>
              <p>{query ? "Try another word or clear the search." : "Add a focused prompt and the answer you want to remember."}</p>
              <button className="button button-secondary" type="button" onClick={query ? () => setQuery("") : openNewCard}>{query ? "Clear search" : "Add first card"}</button>
            </div>
          )}

          <div className="deck-footnote">
            <p>Decks stay in local browser storage. Export a JSON backup before clearing browser data or moving devices.</p>
            <button className="text-button" type="button" onClick={resetDeck}>Restore starter deck</button>
          </div>
        </section>
      </main>

      <footer><p>Made for deliberate practice.</p><a href="https://github.com/TinoMuzambi/Flip-It" rel="noreferrer">View source on GitHub</a></footer>
      <p className="status-message" role="status" aria-live="polite">{status}</p>
    </>
  );
}
