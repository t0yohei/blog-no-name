import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../src/components/ThemeScript.astro', import.meta.url), 'utf8');
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function createBrowser({ dark = false, saved = null, storageUnavailable = false } = {}) {
  const events = () => {
    const listeners = new Map();
    return {
      addEventListener(type, listener) {
        const handlers = listeners.get(type) ?? [];
        handlers.push(listener);
        listeners.set(type, handlers);
      },
      dispatch(type, event = {}) {
        for (const listener of listeners.get(type) ?? []) listener(event);
      },
    };
  };
  class Select {
    value = 'system';
    matches(selector) { return selector === '[data-theme-select]'; }
  }
  let stored = saved;
  let select;
  let hidden = true;
  const media = { ...events(), matches: dark };
  const window = { ...events(), matchMedia: () => media };
  const document = {
    ...events(),
    documentElement: { dataset: {} },
    querySelector(selector) {
      if (selector === '[data-theme-select]') return select ?? null;
      if (selector === '[data-theme-control]' && select) {
        return { removeAttribute: () => { hidden = false; } };
      }
      return null;
    },
  };
  const localStorage = {
    getItem() {
      if (storageUnavailable) throw new Error('Storage unavailable');
      return stored;
    },
    setItem(_key, value) {
      if (storageUnavailable) throw new Error('Storage unavailable');
      stored = value;
    },
    removeItem() {
      if (storageUnavailable) throw new Error('Storage unavailable');
      stored = null;
    },
  };
  runInNewContext(script, { window, document, localStorage, HTMLSelectElement: Select });
  return {
    get theme() { return document.documentElement.dataset.theme; },
    get selection() { return select?.value; },
    get stored() { return stored; },
    get hidden() { return hidden; },
    mount() {
      select = new Select();
      document.dispatch('astro:page-load');
    },
    choose(value) {
      select.value = value;
      document.dispatch('change', { target: select });
    },
    system(dark) {
      media.matches = dark;
      media.dispatch('change');
    },
    navigate() {
      document.documentElement = { dataset: {} };
      select = new Select();
      document.dispatch('astro:after-swap');
    },
    storage(key, newValue) {
      window.dispatch('storage', { key, newValue });
    },
    unrelatedChange() {
      document.dispatch('change', { target: {} });
    },
  };
}

test('applies the system theme before page content exists and follows OS changes', () => {
  const browser = createBrowser({ dark: true });
  assert.equal(browser.theme, 'dark');
  browser.mount();
  assert.equal(browser.selection, 'system');
  assert.equal(browser.hidden, false);
  browser.system(false);
  assert.equal(browser.theme, 'light');
});

test('restores an explicit theme even when it differs from the OS', () => {
  for (const [saved, dark] of [['light', true], ['dark', false]]) {
    const browser = createBrowser({ saved, dark });
    browser.mount();
    assert.equal(browser.theme, saved);
    assert.equal(browser.selection, saved);
    browser.system(!dark);
    browser.system(dark);
    assert.equal(browser.theme, saved);
  }
});

test('persists manual choices, preserves them on navigation, and resets to system', () => {
  const browser = createBrowser();
  browser.mount();
  browser.choose('dark');
  assert.equal(browser.stored, 'dark');
  browser.navigate();
  assert.equal(browser.theme, 'dark');
  assert.equal(browser.selection, 'dark');
  browser.choose('light');
  assert.equal(browser.theme, 'light');
  assert.equal(browser.stored, 'light');
  browser.choose('system');
  assert.equal(browser.stored, null);
  browser.system(true);
  assert.equal(browser.theme, 'dark');
  assert.equal(browser.selection, 'system');
});

test('invalid stored values fall back to the system preference', () => {
  const browser = createBrowser({ dark: true, saved: 'invalid' });
  browser.mount();
  assert.equal(browser.theme, 'dark');
  assert.equal(browser.selection, 'system');
});

test('storage failures still allow switching and preserve the choice across navigation', () => {
  const browser = createBrowser({ dark: true, storageUnavailable: true });
  browser.mount();
  assert.equal(browser.theme, 'dark');
  browser.choose('light');
  browser.navigate();
  assert.equal(browser.theme, 'light');
  assert.equal(browser.selection, 'light');
  browser.choose('system');
  assert.equal(browser.theme, 'dark');
});

test('synchronizes theme changes from another tab and ignores other storage keys', () => {
  const browser = createBrowser();
  browser.mount();
  browser.storage('theme', 'dark');
  assert.equal(browser.theme, 'dark');
  assert.equal(browser.selection, 'dark');
  browser.storage('unrelated', 'light');
  assert.equal(browser.theme, 'dark');
  browser.storage(null, null);
  assert.equal(browser.theme, 'light');
  assert.equal(browser.selection, 'system');
});

test('unrelated form changes do not change the theme', () => {
  const browser = createBrowser({ saved: 'dark' });
  browser.mount();
  browser.unrelatedChange();
  assert.equal(browser.theme, 'dark');
});
