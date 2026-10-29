import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('desktop overview stays bounded and marker centers hit their own group', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#chart .mark').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(1800);
  expect(await page.locator('#chart .mark').count()).toBeLessThan(50);
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
  await page.locator('#detail [data-focus-key="save-story"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await page.reload();
  await page.locator('[data-view="saved"]').click();
  await expect(page.locator('#saved-list')).toContainText('The kingdom divides');
  await page.locator('#saved-list button').click();
  await page.locator('#detail [data-focus-key="save-story"]').click();
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
  const story = await page.locator('#detail h2').innerText();
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
  await page.locator('#detail [data-focus-key="save-story"]').click();
  await expect(page.locator('#status')).toContainText('this visit only');
  await expect(page.locator('#saved-count')).toHaveText('1');
});

test('date bounds, legacy era links, and invalid URL state are safe', async ({ page }) => {
  await page.goto('/?era=bridge');
  await expect(page.locator('#visible-range')).toHaveText('440–1 BC');
  await page.goto('/?from=NaN&to=9&story=missing&layers=missing&view=bad');
  await expect(page.locator('#visible-range')).toHaveText('1100–1 BC');
  await page.locator('#start-year').fill('10');
  await page.locator('#start-year').press('Tab');
  await expect(page.locator('#status')).toContainText('at least 30 years');
  await expect(page.locator('#start-year')).toHaveValue('1100');
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
