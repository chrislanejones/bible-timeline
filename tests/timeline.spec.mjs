import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// On a wide screen the selected story lives in a floating card that opens once a reader asks for it.
const openCard = async page => { await page.locator('#card-chip').click(); await expect(page.locator('#story-card')).toBeVisible(); };

test('desktop overview stays bounded and marker centers hit their own group', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#chart .mark').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1800);
  // 2,200 years of turning points, named patriarchs and judges, and grouped reigns.
  expect(await page.locator('#chart .mark').count()).toBeLessThan(60);
  expect(await page.locator('#chart [tabindex="0"]').count()).toBe(1);
  const wrongTargets = await page.locator('#chart .mark').evaluateAll(marks => marks.flatMap(mark => {
    const circle = mark.querySelector('circle');
    if (!circle) return [];
    const r = circle.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.mark');
    return hit === mark ? [] : [mark.getAttribute('aria-label')];
  }));
  expect(wrongTargets).toEqual([]);
  await page.locator('#chart .mark[aria-label*="Open group"]').first().locator('.hit').click();
  await expect(page.locator('#cluster-panel')).toBeVisible();
  const story = await page.locator('#cluster-list button .name').first().evaluate(e => e.firstChild.textContent);
  await page.locator('#cluster-list button').first().click();
  await expect(page.locator('#detail h2')).toHaveText(story);
  expect(errors).toEqual([]);
});

test('keyboard Next retains focus and chart has one tab stop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await openCard(page);
  const next = page.locator('#detail [data-focus-key="next"]');
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  const title = await page.locator('#detail h2').innerText();
  await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  await expect(page.locator('#detail h2')).not.toHaveText(title);
  await page.locator('#chart [tabindex="0"]').focus();
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#chart [tabindex="0"]').count()).toBe(1);
  await expect(page.locator('#chart [tabindex="0"]')).toBeFocused();
});

test('stories sharing a year remain individually selectable at maximum zoom', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?from=460&to=430&view=timeline');
  await expect(page.locator('#zoom-in')).toBeDisabled();
  const cluster = page.locator('#chart .mark[data-focus-key*="nehemiah-confronts-exploitation"]');
  await cluster.locator('.hit').click();
  const target = page.locator('#cluster-list button').filter({ hasText: 'Nehemiah confronts exploitation' });
  await target.click();
  await expect(page.locator('#detail h2')).toHaveText('Nehemiah confronts exploitation');
});

test('phone search is nearby, searches hidden layers, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?layers=united');
  await expect(page.locator('#list-view')).toBeVisible();
  await page.locator('#q').fill('Hezekiah');
  await expect(page.locator('#search-count')).toContainText('7 matches');
  const resultsBox = await page.locator('#search-results').boundingBox();
  expect(resultsBox.y).toBeLessThan(250);
  await page.locator('#q').press('ArrowDown');
  await expect(page.locator('#search-list button').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reader')).toBeVisible();
  await expect(page.locator('#reader-title')).toHaveText('Hezekiah');
  await page.keyboard.press('Escape');
  await expect(page.locator('#q')).toBeFocused();
  await page.locator('#q').fill('zzzz-no-match');
  await expect(page.locator('#search-list')).toContainText('No matches');
  await page.locator('#clear-search').click();
  await expect(page.locator('#search-results')).toBeHidden();
});

test('phone list filters work together and story reader returns to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const before = await page.locator('#chronological-list button').count();
  await expect(page.locator('#major-only')).toBeChecked();
  await page.locator('#include-people').check();
  expect(await page.locator('#chronological-list button').count()).toBeGreaterThan(before);
  await page.locator('#include-people').uncheck();
  const first = page.locator('#chronological-list button').first();
  await first.click();
  const next = page.locator('#reader-detail [data-focus-key="next"]');
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  await page.locator('#close-reader').click();
  await expect(first).toBeFocused();
});

test('related stories open at the top of the phone reader', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#q').fill('David');
  await page.locator('#search-list button').first().click();
  await expect(page.locator('#reader-title')).toHaveText('David');
  await page.locator('#reader-detail .connections summary').click();
  const last = page.locator('#reader-detail .related-item').last();
  const name = await last.evaluate(e => e.firstChild.textContent);
  await last.click();
  await expect(page.locator('#reader-title')).toHaveText(name);
  expect(await page.locator('#reader').evaluate(e => e.scrollTop)).toBe(0);
  await expect(page.locator('#reader-title')).toBeInViewport();
});

test('bookmarks survive reload and can be removed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await openCard(page);
  await page.locator('#detail [data-focus-key="save-story"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await page.reload();
  await page.locator('[data-view="saved"]').click();
  await expect(page.locator('#saved-list')).toContainText('The kingdom divides');
  // Away from the chart there is nothing to anchor a card to, so the story opens in the reader.
  await page.locator('#saved-list button').click();
  await expect(page.locator('#reader')).toBeVisible();
  await page.locator('#reader-detail [data-focus-key="save-story"]').click();
  await page.locator('#close-reader').click();
  await expect(page.locator('#saved-list')).toContainText('No bookmarks yet');
});

test('shared links restore story, range, layers, mode, and query', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('[data-range="exile"]').click();
  await page.locator('#q').fill('Huldah');
  await page.locator('#search-list button').first().click();
  await page.locator('[data-view="list"]').click();
  await page.locator('.layers summary').click();
  await page.locator('[data-layer="minor"]').uncheck();
  await page.locator('.layers summary').click();
  const url = page.url();
  const story = await page.locator('#detail h2').textContent();
  await page.reload();
  await expect(page.locator('#detail h2')).toHaveText(story);
  await expect(page.locator('#visible-range')).toHaveText('630–420 BC');
  await expect(page.locator('#list-view')).toBeVisible();
  await expect(page.locator('#q')).toHaveValue('Huldah');
  expect(new URL(url).searchParams.get('layers').split(',')).not.toContain('minor');
  await expect(page.locator('[data-layer="minor"]')).not.toBeChecked();
});

test('copy fallback works without clipboard or storage permissions', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied'); } } });
    Storage.prototype.setItem = () => { throw new Error('Denied'); };
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('#share-view').click();
  await expect(page.locator('.link-fallback input')).toBeVisible();
  await expect(page.locator('.link-fallback input')).toHaveValue(/story=event-story-the-kingdom-divides/);
  await page.locator('.link-fallback button').click();
  await openCard(page);
  await page.locator('#detail [data-focus-key="save-story"]').click();
  await expect(page.locator('#status')).toContainText('this visit only');
  await expect(page.locator('#saved-count')).toHaveText('1');
});

test('date bounds, legacy era links, and invalid URL state are safe', async ({ page }) => {
  await page.goto('/?era=bridge');
  await expect(page.locator('#visible-range')).toHaveText('440–1 BC');
  await page.goto('/?from=NaN&to=9&story=missing&layers=missing&view=bad');
  await expect(page.locator('#visible-range')).toHaveText('2200–1 BC');
  await page.locator('#start-year').fill('10');
  await page.locator('#start-year').press('Tab');
  await expect(page.locator('#status')).toContainText('at least 30 years');
  await expect(page.locator('#start-year')).toHaveValue('2200');
  // Links shared before the timeline reached back to Genesis keep their range.
  await page.goto('/?from=1100&to=1&view=timeline');
  await expect(page.locator('#visible-range')).toHaveText('1100–1 BC');
});

for (const width of [320, 768, 1440]) {
  test(`layout stays within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.locator('[data-view="timeline"]').click();
    await page.locator('[data-range="divided"]').click();
    await expect(page.locator('#chart .mark').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('touch reader, horizontal pan, and pinch work in a mobile context', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5174');
  await page.locator('#chronological-list button').first().tap();
  await expect(page.locator('#reader')).toBeVisible();
  await page.locator('#close-reader').tap();
  await page.locator('[data-view="timeline"]').tap();
  await page.locator('[data-range="divided"]').tap();
  await page.locator('#chart').evaluate(e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120));
  const client = await context.newCDPSession(page);
  const touch = (type, points) => client.send('Input.dispatchTouchEvent', {
    type, touchPoints: points.map(([x, y], id) => ({ x, y, id })),
  });
  await touch('touchStart', [[140, 280]]);
  await touch('touchMove', [[180, 280]]);
  await touch('touchMove', [[210, 280]]);
  await touch('touchEnd', []);
  await expect.poll(() => page.locator('#start-year').inputValue().then(Number)).toBeGreaterThan(940);
  const spanBefore = await page.evaluate(() => Number(document.querySelector('#start-year').value) - Number(document.querySelector('#end-year').value));
  await touch('touchStart', [[130, 300], [210, 300]]);
  await touch('touchMove', [[100, 300], [240, 300]]);
  await touch('touchMove', [[80, 300], [260, 300]]);
  await touch('touchEnd', []);
  await expect.poll(() => page.evaluate(() => Number(document.querySelector('#start-year').value) - Number(document.querySelector('#end-year').value))).toBeLessThan(spanBefore);
  await context.close();
});

test('standalone file works with no network access', async ({ browser }) => {
  const context = await browser.newContext({ offline: true, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('ot-timeline.html')).href);
  await page.locator('#q').fill('Huldah');
  await page.locator('#search-list button').first().click();
  await expect(page.locator('#detail h2')).toHaveText('Huldah');
  await page.locator('#detail [data-focus-key="save-story"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  expect(errors).toEqual([]);
  await context.close();
});

test('the timeline runs from Genesis to the eve of the New Testament', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#visible-range')).toHaveText('2200–1 BC');
  // Genesis 1–11 is shown as one undated group, never as a dated mark.
  const beginnings = page.locator('#chart .mark[aria-label*="undated stories"]');
  await expect(beginnings).toHaveCount(1);
  await beginnings.locator('.hit').click();
  await expect(page.locator('#cluster-title')).toContainText('undated stories');
  await expect(page.locator('#zoom-cluster')).toBeHidden();
  await page.locator('#cluster-list button').filter({ hasText: 'Noah and the flood' }).click();
  await expect(page.locator('#detail h2')).toHaveText('Noah and the flood');
  await expect(page.locator('#detail .detail-date')).toHaveText('Undated');
  await expect(page.locator('#detail')).toContainText('Scripture gives no date');
  for (const [era, range, name] of [
    ['patriarchs', '2200–1790 BC', 'Abraham'], ['exodus', '1540–1360 BC', 'Moses'], ['judges', '1400–1040 BC', 'Deborah'],
  ]) {
    await page.locator(`[data-range="${era}"]`).click();
    await expect(page.locator('#visible-range')).toHaveText(range);
    await expect(page.locator(`#chart .mark[aria-label^="${name},"]`)).toHaveCount(1);
  }
  await page.locator('[data-range="bridge"]').click();
  await expect(page.locator('#chart .mark[aria-label^="Herod the Great,"]')).toHaveCount(1);
  await page.goto('/?era=exodus');
  await expect(page.locator('#detail h2')).toHaveText('Israel crosses the sea');
  expect(errors).toEqual([]);
});

test('the kings toggle filters rulers by rating and survives a reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('[data-range="divided"]').click();
  const mark = name => page.locator(`#chart .mark[aria-label^="${name},"]`);
  await expect(mark('Ahab')).toHaveCount(1);
  await page.locator('[data-rating="good"]').click();
  await expect(page.locator('[data-rating="good"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(mark('Hezekiah')).toHaveCount(1);
  await expect(mark('Ahab')).toHaveCount(0);
  await expect(mark('Elijah')).toHaveCount(1);
  await expect(page).toHaveURL(/kings=good/);
  await page.reload();
  await expect(page.locator('[data-rating="good"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(mark('Ahab')).toHaveCount(0);
  await page.locator('[data-rating="bad"]').click();
  await expect(mark('Ahab')).toHaveCount(1);
  await expect(mark('Hezekiah')).toHaveCount(0);
  // The story list follows the same filter.
  await page.locator('[data-view="list"]').click();
  await page.locator('#include-people').check();
  await expect(page.locator('#chronological-list [data-item-key="king-israel-ahab"]')).toHaveCount(1);
  await expect(page.locator('#chronological-list [data-item-key="king-judah-hezekiah"]')).toHaveCount(0);
  await expect(page.locator('#chronological-list [data-item-key="prophet-major-isaiah"]')).toHaveCount(1);
  // Choosing a hidden king from search brings every ruler back rather than showing nothing.
  await page.locator('[data-view="timeline"]').click();
  await page.locator('#q').fill('Hezekiah');
  await page.locator('#search-list button').first().click();
  await expect(page.locator('[data-rating="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#detail h2')).toHaveText('Hezekiah');
  await expect(mark('Hezekiah')).toHaveCount(1);
});

test('the floating card follows the selected mark and steps aside when it leaves the view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Nothing floats over the chart until a reader chooses something.
  await expect(page.locator('#story-card')).toBeHidden();
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await page.locator('[data-range="patriarchs"]').click();
  const jacob = page.locator('#chart .mark[data-focus-key="leader-patriarchs-jacob"]');
  await jacob.locator('.hit').click();
  const card = page.locator('#story-card');
  await expect(card).toBeVisible();
  await expect(page.locator('#detail h2')).toHaveText('Jacob');
  await expect(page.locator('#card-chip')).toBeHidden();
  const box = async locator => locator.boundingBox();
  const [cardBox, wrapBox, anchorBox] = [await box(card), await box(page.locator('#chart-wrap')), await box(jacob.locator('.anchor'))];
  expect(cardBox.x).toBeGreaterThanOrEqual(wrapBox.x);
  expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(wrapBox.x + wrapBox.width);
  // It sits beside the mark rather than on top of it, and the pointer lines up with the mark's row.
  const beside = cardBox.x >= anchorBox.x + anchorBox.width || cardBox.x + cardBox.width <= anchorBox.x;
  const below = cardBox.y >= anchorBox.y + anchorBox.height;
  expect(beside || below).toBe(true);
  const arrowBox = await box(page.locator('#card-arrow'));
  if (beside) expect(Math.abs(arrowBox.y + arrowBox.height / 2 - (anchorBox.y + anchorBox.height / 2))).toBeLessThan(40);
  // The chart area grows to hold the card, so the navigator below is never covered, and the card is fully on screen.
  expect(wrapBox.y + wrapBox.height).toBeGreaterThanOrEqual(cardBox.y + cardBox.height);
  await expect(card).toBeInViewport({ ratio: 1 });
  // Dragging the top bar moves the card; the offset lasts until the next selection.
  await page.mouse.move(cardBox.x + 60, cardBox.y + 20);
  await page.mouse.down();
  await page.mouse.move(cardBox.x + 160, cardBox.y + 80, { steps: 4 });
  await page.mouse.up();
  const moved = await box(card);
  expect(moved.x).toBeGreaterThan(cardBox.x + 60);
  expect(moved.y).toBeGreaterThan(cardBox.y + 30);
  await expect(page.locator('#card-arrow')).toBeHidden();
  // Hide and reopen.
  await page.locator('#hide-card').click();
  await expect(card).toBeHidden();
  await expect(page.locator('#card-chip')).toBeFocused();
  await expect(page.locator('#card-chip')).toContainText('Open story: Jacob');
  await page.keyboard.press('Enter');
  await expect(card).toBeVisible();
  await expect(page.locator('#detail h2')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(card).toBeHidden();
  await page.locator('#card-chip').click();
  // Leaving the era docks the card; the chip brings the story back into view.
  await page.locator('[data-range="divided"]').click();
  await expect(card).toBeHidden();
  await expect(page.locator('#card-chip')).toContainText('Jacob is outside this view');
  await page.locator('#card-chip').click();
  await expect(card).toBeVisible();
  await expect(jacob).toHaveCount(1);
});

test('hovering a mark previews it without selecting it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.locator('[data-range="united"]').click();
  await page.locator('#chart .mark[aria-label^="David,"] .hit').hover();
  await expect(page.locator('#peek')).toBeVisible();
  await expect(page.locator('#peek')).toContainText('David');
  await expect(page.locator('#peek')).toContainText('Best / faithful');
  await expect(page.locator('#story-card')).toBeHidden();
  await page.mouse.move(5, 5);
  await expect(page.locator('#peek')).toBeHidden();
});

test('on a wide screen the story list opens stories in the reader', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/?view=list');
  await expect(page.locator('#chronological-list button').first()).toContainText('In the beginning: creation');
  await expect(page.locator('#chronological-list button').first()).toContainText('Undated');
  const story = page.locator('#chronological-list button').filter({ hasText: 'The burning bush' });
  await story.click();
  await expect(page.locator('#reader')).toBeVisible();
  await expect(page.locator('#reader-title')).toHaveText('The burning bush');
  await page.locator('#close-reader').click();
  await expect(story).toBeFocused();
});
