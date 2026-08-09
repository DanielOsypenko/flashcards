# Flashcards

A self-contained, single-file (`index.html`) flashcard application with two modes: **Language Learning** and **Interview Prep**. Runs entirely in the browser — no build step, no server, no dependencies.

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

To disconnect or switch tokens, tap **⚙ Settings** from the navigation bar or mode chooser.

### 3. Choose Your Mode

After connecting, a mode chooser screen appears:

- **Interview Prep** — technical Q&A flashcards for job interviews (Kubernetes, Linux, networking, storage, etc.)
- **Language Learning** — vocabulary flashcards and situation practice

Your choice is remembered. Tap the **←** button in the header to switch modes.

## Interview Prep Mode

### Study

Questions are shown one at a time. Tap the card to reveal the answer. After flipping, rate yourself with three levels:

- **Nailed it** — you knew it well (score +2)
- **Partially** — you got parts right (+1 known, +1 unknown)
- **Failed** — you didn't know it (+2 unknown)

The algorithm prioritizes cards you struggle with.

### Quick Sessions

Tap **Quick 5**, **Quick 10**, or **Quick 15** to start a bounded micro-session. The app picks that many cards, shows a progress counter (e.g. "Card 3 of 10"), and presents a summary screen when done with your nailed/partial/failed breakdown. From the summary, choose **Another N** to start a fresh batch or **Done** to return.

### Difficulty & Bookmarks

- Filter by difficulty: **Easy**, **Medium**, **Hard**
- Bookmark questions with the **☆** icon on any card
- Filter to bookmarked questions with the **★** pill

### Practice Mode

Toggle **Practice** to study without scoring — just flip and tap **Next**. Useful for review without affecting your stats.

### Resource Links

Interview cards can include a resource link (shown as "Learn more" on the answer side) pointing to documentation or reference material.

## Language Learning Mode

### Study

Cards show one side at a time (English or Russian). Tap to flip, then:

- **Know it** — marks the card as known
- **Don't know** — marks the card as unknown
- **Skip →** — advances without recording

### Direction Toggle

Click the **EN→RU** button to switch study direction. The front and back of every card swap.

### Situations

A separate card type for situational phrases and feelings. Switch to **Situations** from the nav bar.

### Quick Sessions

Same as interview mode — tap **Quick 5/10/15** to study a fixed batch with a summary at the end.

## Shared Features

### Shuffle Mode

Click **⇄ Shuffle** to go through the deck in a randomized fixed order with a progress bar. When all cards are seen, the round resets.

### Labels / Topics

Each card can have one label. Use the filter pills at the top of the study view to narrow the deck. In interview mode, labels represent topics (e.g. `Kubernetes`, `Networking`, `Deployment`).

### Swipe Gestures (Mobile)

After flipping a card:
- **Swipe right** → Know it / Nailed it
- **Swipe left** → Don't know / Failed
- **Swipe up** → Partially (interview mode)
- **Swipe down** → Skip

Visual hints appear during the swipe.

### Keyboard Shortcuts (Desktop)

| Key | Action |
|-----|--------|
| Space / Enter | Flip card |
| → | Know it / Nailed it (or Skip if not flipped) |
| ← | Don't know / Failed |
| ↑ | Partially (interview) |
| ↓ | Skip |
| 1 / 2 / 3 | Failed / Partially / Nailed it (interview) |

### Stopwatch & Auto-Pause

A session stopwatch tracks study time. If no activity is detected for a configurable period (default: 1 min), the timer auto-pauses and trims idle time from your stats. Configure the auto-pause timer in **⚙ Settings** (30s, 1 min, 2 min, 5 min, or Off).

### Managing Cards

Switch to the **Cards** / **Questions** tab to:
- **Add** cards manually (with optional label, difficulty, resource link for interview cards)
- **Delete** individual cards
- **Filter** by label/topic
- **Browse** with pagination (20 per page)

Cards are sorted by number of incorrect answers (most-struggled first).

### Import JSON

Use the **Import JSON** panel to bulk-load cards from a file or pasted text.

**Language cards:**
```json
[
  { "english": "to procrastinate", "russian": "откладывать", "label": "verb" },
  { "english": "resilience", "russian": "стойкость", "label": "noun" }
]
```

**Interview questions:**
```json
[
  {
    "question": "What is a Kubernetes Pod?",
    "answer": "A Pod is the smallest deployable unit in Kubernetes...",
    "label": "Kubernetes",
    "type": "interview",
    "difficulty": "easy",
    "resource": "https://kubernetes.io/docs/concepts/workloads/pods/"
  }
]
```

The `label`, `difficulty`, and `resource` fields are optional. Duplicates are skipped automatically.

You can also import from standalone JSON files (e.g. `deployment-questions.json`) — the app merges them into your deck.

### Stats

The **Stats** tab shows:
- Daily chart of cards reviewed or minutes studied
- Period filters: 7 / 14 / 30 / 60 days
- Summary: total sessions, minutes, known, unknown, correct %
- Toggle between **Cards** and **Time** views

### Cross-Device Sync

All cards and stats sync through a private GitHub Gist. Pull to refresh on mobile (swipe down from the top of the study view) to reload from the Gist.
