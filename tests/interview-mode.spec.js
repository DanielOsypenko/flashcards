const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765/index.html';

// Helper: inject a mock token and cards into the app state
// This simulates a connected user with test data, bypassing actual Gist API
async function setupWithCards(page, cards, opts = {}) {
  await page.goto(BASE_URL);
  await page.evaluate(({ cards, stats }) => {
    // Mock token so app thinks we're connected
    localStorage.setItem('fc_token', 'ghp_test_mock_token');
    localStorage.setItem('fc_gist_id', 'mock_gist_id');
    localStorage.setItem('fc_stats', JSON.stringify(stats || []));
  }, { cards, stats: opts.stats || [] });
  // Reload and inject cards into app state (skip actual Gist load)
  await page.goto(BASE_URL);
  await page.evaluate((cards) => {
    S.token = 'ghp_test_mock_token';
    S.gistId = 'mock_gist_id';
    S.cards = cards;
    // Override saveGist to avoid actual API calls
    window._origSaveGist = saveGist;
    window.saveGist = function() { return Promise.resolve(); };
    window.scheduleSave = function() {}; // no-op
    S.current = nextCard();
    render();
    updateNav();
  }, cards);
}

const SAMPLE_INTERVIEW_CARDS = [
  { id: 'int1', english: 'What is a Kubernetes Pod?', russian: 'A Pod is the smallest deployable unit in Kubernetes. It can contain one or more containers that share network and storage.', label: 'Kubernetes', type: 'interview', difficulty: 'easy', known: 0, unknown: 0, bookmarked: false },
  { id: 'int2', english: 'Explain the difference between TCP and UDP.', russian: 'TCP is connection-oriented, reliable, and ordered. UDP is connectionless, faster, but unreliable. TCP uses handshakes; UDP does not.', label: 'Networking', type: 'interview', difficulty: 'medium', known: 0, unknown: 0, bookmarked: false },
  { id: 'int3', english: 'What does the chmod command do?', russian: 'chmod changes file permissions in Linux. It can use numeric (755) or symbolic (u+x) notation to set read, write, and execute permissions for owner, group, and others.', label: 'Bash/Linux', type: 'interview', difficulty: 'easy', known: 0, unknown: 0, bookmarked: false },
  { id: 'int4', english: 'What is a Ceph OSD?', russian: 'OSD (Object Storage Daemon) is the Ceph component that stores data, handles data replication, recovery, and rebalancing. Each OSD typically maps to one physical disk.', label: 'Storage & Ceph', type: 'interview', difficulty: 'medium', known: 0, unknown: 0, bookmarked: false },
  { id: 'int5', english: 'What is CRUSH map in Ceph?', russian: 'CRUSH (Controlled Replication Under Scalable Hashing) map defines the cluster topology and data placement rules. It determines how data is distributed across OSDs without a central lookup table.', label: 'Storage & Ceph', type: 'interview', difficulty: 'hard', known: 0, unknown: 0, bookmarked: false },
];

const SAMPLE_VOCAB_CARDS = [
  { id: 'v1', english: 'hello', russian: 'привет', label: 'greetings', type: 'vocab', known: 0, unknown: 0 },
  { id: 'v2', english: 'goodbye', russian: 'пока', label: 'greetings', type: 'vocab', known: 0, unknown: 0 },
];


// ─── Test Suite: Navigation ──────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('Interview button appears in nav bar', async ({ page }) => {
    await setupWithCards(page, [...SAMPLE_VOCAB_CARDS, ...SAMPLE_INTERVIEW_CARDS]);
    const nav = page.locator('#main-nav');
    await expect(nav.locator('button', { hasText: 'Interview' })).toBeVisible();
  });

  test('clicking Interview nav button switches to interview study mode', async ({ page }) => {
    await setupWithCards(page, [...SAMPLE_VOCAB_CARDS, ...SAMPLE_INTERVIEW_CARDS]);
    await page.click('button:has-text("Interview")');
    const navBtn = page.locator('#main-nav button:has-text("Interview")');
    await expect(navBtn).toHaveClass(/active/);
  });

  test('nav has 6 buttons: Study, Situations, Interview, Cards, Stats, gear', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    const buttons = page.locator('#main-nav button');
    await expect(buttons).toHaveCount(6);
  });
});


// ─── Test Suite: Interview Study View ────────────────────────────────────────

test.describe('Interview Study View', () => {
  test('shows Question label on card front', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('.card-lang').first()).toContainText('Question');
  });

  test('card flip reveals Answer', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('#fc');
    // After flip, back face with "Answer" label should be visible
    const backLang = page.locator('.card-back .card-lang');
    await expect(backLang).toContainText('Answer');
  });

  test('shows 3 rating buttons after flip (Failed, Partially, Nailed it)', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('#fc');
    await expect(page.locator('button:has-text("Failed")')).toBeVisible();
    await expect(page.locator('button:has-text("Partially")')).toBeVisible();
    await expect(page.locator('button:has-text("Nailed it")')).toBeVisible();
  });

  test('does NOT show EN/RU direction toggle in interview mode', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('button:has-text("EN→RU")')).not.toBeVisible();
    await expect(page.locator('button:has-text("RU→EN")')).not.toBeVisible();
  });

  test('shows topic badge on interview card', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    // Should have a badge with one of our labels
    await expect(page.locator('.card-badges .int-badge')).toBeVisible();
  });

  test('shows difficulty badge on interview card', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    // At least one difficulty badge should be visible
    const diffBadge = page.locator('.card-badges .label-badge[class*="diff-"]');
    await expect(diffBadge).toBeVisible();
  });

  test('empty state message for interview mode', async ({ page }) => {
    await setupWithCards(page, SAMPLE_VOCAB_CARDS); // no interview cards
    await page.click('button:has-text("Interview")');
    await expect(page.locator('.empty-state')).toContainText('No interview questions yet');
  });
});


// ─── Test Suite: Confidence Rating ───────────────────────────────────────────

test.describe('Confidence Rating', () => {
  test('Nailed it adds known+=2 and removes card from session', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    const cardId = await page.evaluate(() => S.current.id);
    await page.click('#fc'); // flip
    await page.click('button:has-text("Nailed it")');

    const result = await page.evaluate((id) => {
      var card = S.cards.find(c => c.id === id);
      return { known: card.known, unknown: card.unknown, excluded: !!S.sessionKnownIds[id] };
    }, cardId);
    expect(result.known).toBe(2);
    expect(result.unknown).toBe(0);
    expect(result.excluded).toBe(true);
  });

  test('Partially adds known+=1 and unknown+=1, card stays in pool', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    const cardId = await page.evaluate(() => S.current.id);
    await page.click('#fc');
    await page.click('button:has-text("Partially")');

    const result = await page.evaluate((id) => {
      var card = S.cards.find(c => c.id === id);
      return { known: card.known, unknown: card.unknown, excluded: !!S.sessionKnownIds[id] };
    }, cardId);
    expect(result.known).toBe(1);
    expect(result.unknown).toBe(1);
    expect(result.excluded).toBe(false);
  });

  test('Failed adds unknown+=2, card stays in pool', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    const cardId = await page.evaluate(() => S.current.id);
    await page.click('#fc');
    await page.click('button:has-text("Failed")');

    const result = await page.evaluate((id) => {
      var card = S.cards.find(c => c.id === id);
      return { known: card.known, unknown: card.unknown, excluded: !!S.sessionKnownIds[id] };
    }, cardId);
    expect(result.known).toBe(0);
    expect(result.unknown).toBe(2);
    expect(result.excluded).toBe(false);
  });
});


// ─── Test Suite: Difficulty Filter ───────────────────────────────────────────

test.describe('Difficulty Filter', () => {
  test('difficulty filter pills are shown in interview mode', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('.diff-filter-row')).toBeVisible();
    await expect(page.locator('.diff-filter-row button:has-text("Easy")')).toBeVisible();
    await expect(page.locator('.diff-filter-row button:has-text("Medium")')).toBeVisible();
    await expect(page.locator('.diff-filter-row button:has-text("Hard")')).toBeVisible();
  });

  test('filtering by Easy shows only easy cards', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('.diff-filter-row button:has-text("Easy")');
    // Check that the current card is an easy card
    const diff = await page.evaluate(() => S.current ? (S.current.difficulty || 'medium') : null);
    expect(diff).toBe('easy');
  });

  test('filtering by Hard shows only hard cards', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('.diff-filter-row button:has-text("Hard")');
    const diff = await page.evaluate(() => S.current ? (S.current.difficulty || 'medium') : null);
    expect(diff).toBe('hard');
  });

  test('difficulty filter does not appear in vocab mode', async ({ page }) => {
    await setupWithCards(page, [...SAMPLE_VOCAB_CARDS, ...SAMPLE_INTERVIEW_CARDS]);
    // Should start in vocab mode
    await expect(page.locator('.diff-filter-row')).not.toBeVisible();
  });
});


// ─── Test Suite: Bookmark ────────────────────────────────────────────────────

test.describe('Bookmark', () => {
  test('bookmark icon appears on interview cards', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('.bookmark-icon')).toBeVisible();
  });

  test('clicking bookmark toggles bookmarked state', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    const cardId = await page.evaluate(() => S.current.id);

    // Initially not bookmarked
    let bm = await page.evaluate((id) => S.cards.find(c => c.id === id).bookmarked, cardId);
    expect(bm).toBe(false);

    await page.click('.bookmark-icon');

    bm = await page.evaluate((id) => S.cards.find(c => c.id === id).bookmarked, cardId);
    expect(bm).toBe(true);
  });

  test('bookmark filter shows only bookmarked cards', async ({ page }) => {
    // Bookmark one card
    const cards = SAMPLE_INTERVIEW_CARDS.map((c, i) => ({ ...c, bookmarked: i === 0 }));
    await setupWithCards(page, cards);
    await page.click('button:has-text("Interview")');

    // Click the bookmark filter button (★ N)
    await page.click('.diff-filter-row button:has-text("★")');

    const current = await page.evaluate(() => S.current ? S.current.id : null);
    expect(current).toBe('int1'); // the bookmarked card
  });
});


// ─── Test Suite: Practice Mode ───────────────────────────────────────────────

test.describe('Practice Mode', () => {
  test('practice button appears in interview mode', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('button:has-text("Practice")')).toBeVisible();
  });

  test('practice mode hides session counters', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('button:has-text("Practice")');
    await expect(page.locator('.session-pill')).not.toBeVisible();
  });

  test('practice mode shows indicator banner', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('button:has-text("Practice")');
    await expect(page.locator('.practice-indicator')).toContainText('Practice mode');
  });

  test('practice mode shows Next button after flip instead of rating buttons', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('button:has-text("Practice")');
    await page.click('#fc');
    await expect(page.locator('button:has-text("Next →")')).toBeVisible();
    await expect(page.locator('button:has-text("Failed")')).not.toBeVisible();
    await expect(page.locator('button:has-text("Nailed it")')).not.toBeVisible();
  });

  test('practice mode does not affect card scores', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await page.click('button:has-text("Practice")');
    const cardId = await page.evaluate(() => S.current.id);
    await page.click('#fc');
    await page.click('button:has-text("Next →")');

    const scores = await page.evaluate((id) => {
      var card = S.cards.find(c => c.id === id);
      return { known: card.known, unknown: card.unknown };
    }, cardId);
    expect(scores.known).toBe(0);
    expect(scores.unknown).toBe(0);
  });
});


// ─── Test Suite: Manage View ─────────────────────────────────────────────────

test.describe('Manage View - Interview Cards', () => {
  test('Interview tab appears in add card form', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await expect(page.locator('.add-form button:has-text("Interview")')).toBeVisible();
  });

  test('selecting Interview tab changes labels to Question/Answer', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await page.click('.add-form button:has-text("Interview")');
    await expect(page.locator('label:has-text("Question")')).toBeVisible();
    await expect(page.locator('label:has-text("Answer")')).toBeVisible();
  });

  test('selecting Interview tab shows textarea for answer', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await page.click('.add-form button:has-text("Interview")');
    await expect(page.locator('#inp-ru')).toBeVisible();
    const tag = await page.locator('#inp-ru').evaluate(el => el.tagName);
    expect(tag.toLowerCase()).toBe('textarea');
  });

  test('selecting Interview tab shows difficulty selector', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await page.click('.add-form button:has-text("Interview")');
    await expect(page.locator('label:has-text("Difficulty")')).toBeVisible();
  });

  test('Interview filter button appears in card list', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await expect(page.locator('.filter-pills button:has-text("Interview")')).toBeVisible();
  });

  test('interview cards show interview badge in list', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await expect(page.locator('.int-badge').first()).toBeVisible();
  });

  test('interview cards show difficulty badge in list', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    const diffBadge = page.locator('.card-item .label-badge[class*="diff-"]').first();
    await expect(diffBadge).toBeVisible();
  });

  test('bookmark toggle works in card list', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    const bmBtn = page.locator('.bookmark-list-btn').first();
    await expect(bmBtn).toBeVisible();
    await bmBtn.click();
    // Should toggle to active (★)
    await expect(bmBtn).toHaveClass(/active/);
  });
});


// ─── Test Suite: Import ──────────────────────────────────────────────────────

test.describe('Import Interview Cards', () => {
  test('import with question/answer fields works', async ({ page }) => {
    await setupWithCards(page, []);
    await page.click('button:has-text("Cards")');
    await page.click('.import-header');

    const json = JSON.stringify([
      { question: 'What is Docker?', answer: 'Docker is a container platform.', label: 'Containers', type: 'interview', difficulty: 'easy' }
    ]);
    await page.fill('#import-txt', json);
    await page.click('button:has-text("Import")');

    const count = await page.evaluate(() => S.cards.filter(c => c.type === 'interview').length);
    expect(count).toBe(1);

    const card = await page.evaluate(() => S.cards[0]);
    expect(card.english).toBe('What is Docker?');
    expect(card.russian).toBe('Docker is a container platform.');
    expect(card.difficulty).toBe('easy');
    expect(card.type).toBe('interview');
  });

  test('import with english/russian fields still works for vocab', async ({ page }) => {
    await setupWithCards(page, []);
    await page.click('button:has-text("Cards")');
    await page.click('.import-header');

    const json = JSON.stringify([
      { english: 'cat', russian: 'кот', label: 'animals' }
    ]);
    await page.fill('#import-txt', json);
    await page.click('button:has-text("Import")');

    const card = await page.evaluate(() => S.cards[0]);
    expect(card.type).toBe('vocab');
    expect(card.english).toBe('cat');
  });

  test('duplicate interview questions are skipped', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Cards")');
    await page.click('.import-header');

    const json = JSON.stringify([
      { question: 'What is a Kubernetes Pod?', answer: 'duplicate', label: 'Kubernetes', type: 'interview' }
    ]);
    await page.fill('#import-txt', json);
    await page.click('button:has-text("Import")');

    await expect(page.locator('.import-msg-ok, .import-msg-err')).toContainText('skipped');
  });
});


// ─── Test Suite: Statistics ──────────────────────────────────────────────────

test.describe('Statistics', () => {
  test('60-day period option exists', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS, {
      stats: [{ date: '2026-07-27', duration: 60000, known: 5, unknown: 2, mode: 'interview' }]
    });
    await page.click('button:has-text("Stats")');
    await expect(page.locator('.filter-pills button:has-text("60d")')).toBeVisible();
  });

  test('Interview mode filter exists in stats', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Stats")');
    await expect(page.locator('.filter-pills button:has-text("Interview")')).toBeVisible();
  });

  test('Correct % summary card is shown', async ({ page }) => {
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS, {
      stats: [{ date: '2026-07-27', duration: 60000, known: 8, unknown: 2, mode: 'interview' }]
    });
    await page.click('button:has-text("Stats")');
    await expect(page.locator('.summary-card:has-text("Correct")')).toBeVisible();
  });
});


// ─── Test Suite: isVocab Bug Fix ─────────────────────────────────────────────

test.describe('isVocab bug fix', () => {
  test('interview cards do NOT appear in vocab study mode', async ({ page }) => {
    await setupWithCards(page, [...SAMPLE_VOCAB_CARDS, ...SAMPLE_INTERVIEW_CARDS]);
    // Default mode is vocab
    const poolTypes = await page.evaluate(() => {
      return filteredPool().map(c => c.type);
    });
    // All cards in vocab pool should be vocab type
    poolTypes.forEach(t => expect(t).toBe('vocab'));
    expect(poolTypes.length).toBe(2); // only 2 vocab cards
  });
});


// ─── Test Suite: Mobile Responsive ───────────────────────────────────────────

test.describe('Mobile Responsive', () => {
  test('nav is scrollable on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone-sized
    await setupWithCards(page, [...SAMPLE_VOCAB_CARDS, ...SAMPLE_INTERVIEW_CARDS]);

    // All 6 nav buttons should exist
    const count = await page.locator('#main-nav button').count();
    expect(count).toBe(6);

    // Nav should have overflow-x auto (computed style check)
    const overflow = await page.locator('#main-nav').evaluate(el => window.getComputedStyle(el).overflowX);
    expect(overflow).toBe('auto');
  });

  test('interview card renders correctly on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupWithCards(page, SAMPLE_INTERVIEW_CARDS);
    await page.click('button:has-text("Interview")');
    await expect(page.locator('.card-lang').first()).toContainText('Question');
    await expect(page.locator('.card-word-question')).toBeVisible();
  });
});
