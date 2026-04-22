# Flashcards

A self-contained, single-file (`index.html`) flashcard application for vocabulary learning. Runs entirely in the browser — no build step, no server, no dependencies.

## Setup

### 1. Get a GitHub Token

Cards sync across devices via a private GitHub Gist. You need a **classic** GitHub personal access token with the `gist` scope.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name (e.g. `flashcard-app`)
4. Check the **`gist`** scope only
5. Click **Generate token** and copy the value — GitHub shows it only once

### 2. Connect the App

1. Open the app in your browser
2. Paste your token into the **GitHub Token** field and click **Connect**
3. The app automatically finds or creates a private Gist named `Flashcards App Data` and loads your cards

To disconnect or switch tokens, click the **Token** button in the top navigation.

## Features

### Study Mode

Cards are shown one at a time. Click the card to flip it and reveal the answer. After flipping, use:
- **Know it** — marks the card as known and advances
- **Don't know** — marks the card as unknown and advances
- **Skip →** — advances without recording a result

The card selection algorithm weights cards you get wrong more heavily so they appear more often.

### Direction Toggle

Click the **EN→RU** button (or **RU→EN** when active) to switch the study direction. The front and back of every card swap, so you can practice translating in both directions independently.

### Shuffle Mode

Click **⇄ Shuffle** to go through the current card pool in a randomised fixed order. A progress bar and counter (e.g. `5 / 48`) show how many cards you have completed in the current round. When all cards are seen the round resets automatically.

Shuffle mode works with any active label filter.

### Labels

Each card can have one label (e.g. `verb`, `noun`, `adjective`). Use the filter pills at the top of the study view to narrow the deck to a specific label. **All** is selected by default.

### Managing Cards

Switch to the **Cards** tab to:
- **Add** a new English/Russian pair with an optional label
- **Delete** individual cards with the × button
- **Filter** the list by label using the filter pills
- **Browse** large lists page by page (20 cards per page) using the ← → pagination controls

Cards are sorted by number of incorrect answers (most-struggled words first).

### Import JSON

Use the **Import JSON** panel in the Cards tab to bulk-load cards from a file or pasted text.

Expected format:
```json
[
  { "english": "to procrastinate", "russian": "откладывать", "label": "verb" },
  { "english": "resilience", "russian": "стойкость", "label": "noun" }
]
```

The `label` field is optional. Cards whose English text already exists in the deck are skipped automatically.

### Stats

The stats bar in the Study view shows:
- **known** — cards where correct answers outnumber incorrect ones
- **new** — cards with no attempts yet
- **total** — number of cards in the current filter
