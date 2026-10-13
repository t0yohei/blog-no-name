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
  class Element {
    constructor(selector, dataset = {}) {
      this.selector = selector;
      this.dataset = dataset;
      this.attributes = new Map();
      this.hidden = true;
    }
    closest(selector) { return selector === this.selector ? this : null; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    focus() { document.activeElement = this; }
  }
  let stored = saved;
  let options = [];
  let icons = [];
  let trigger;
  let menu;
  let hidden = true;
  const media = { ...events(), matches: dark };
  const window = { ...events(), matchMedia: () => media };
  const document = {
    ...events(),
    documentElement: { dataset: {} },
    querySelector(selector) {
      if (selector === '[data-theme-trigger]') return trigger ?? null;
      if (selector === '[data-theme-menu]') return menu ?? null;
      if (selector === '[data-theme-option][aria-checked="true"]') {
        return options.find(option => option.attributes.get('aria-checked') === 'true') ?? null;
      }
      if (selector === '[data-theme-control]' && trigger) {
        return {
          removeAttribute: () => { hidden = false; },
          contains: target => target === trigger || options.includes(target),
        };
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-theme-option]') return options;
      if (selector === '[data-theme-icon]') return icons;
      return [];
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
  const createMenu = () => {
    options = ['system', 'light', 'dark'].map(themeOption => new Element('[data-theme-option]', { themeOption }));
    icons = ['light', 'dark'].map(themeIcon => new Element('[data-theme-icon]', { themeIcon }));
    trigger = new Element('[data-theme-trigger]');
    menu = new Element('[data-theme-menu]');
  };
  runInNewContext(script, { window, document, localStorage, Element });
  return {
    get theme() { return document.documentElement.dataset.theme; },
    get selection() { return document.querySelector('[data-theme-option][aria-checked="true"]')?.dataset.themeOption; },
    get stored() { return stored; },
    get hidden() { return hidden; },
    get menuOpen() { return !menu.hidden; },
    get expanded() { return trigger.attributes.get('aria-expanded'); },
    get focused() { return document.activeElement === trigger ? 'trigger' : document.activeElement?.dataset.themeOption; },
    get visibleIcon() { return icons.find(icon => !icon.hidden)?.dataset.themeIcon; },
    mount() {
      createMenu();
      document.dispatch('astro:page-load');
    },
    choose(value) {
      document.dispatch('click', { target: options.find(option => option.dataset.themeOption === value) });
    },
    open() {
      document.dispatch('click', { target: trigger });
    },
    key(key, fromTrigger = false) {
      document.dispatch('keydown', { key, target: fromTrigger ? trigger : document.activeElement, preventDefault() {} });
    },
    system(dark) {
      media.matches = dark;
      media.dispatch('change');
    },
    navigate() {
      document.documentElement = { dataset: {} };
      createMenu();
      document.dispatch('astro:after-swap');
    },
    storage(key, newValue) {
      window.dispatch('storage', { key, newValue });
    },
    outsideClick() {
      document.dispatch('click', { target: new Element('outside') });
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

test('outside clicks close the menu without changing the theme', () => {
  const browser = createBrowser({ saved: 'dark' });
  browser.mount();
  browser.open();
  assert.equal(browser.menuOpen, true);
  browser.outsideClick();
  assert.equal(browser.menuOpen, false);
  assert.equal(browser.expanded, 'false');
  assert.equal(browser.theme, 'dark');
});

test('menu focuses the selected option and supports arrows, Home, End, and Escape', () => {
  const browser = createBrowser({ saved: 'light' });
  browser.mount();
  browser.open();
  assert.equal(browser.focused, 'light');
  assert.equal(browser.expanded, 'true');
  browser.key('ArrowDown');
  assert.equal(browser.focused, 'dark');
  browser.key('ArrowDown');
  assert.equal(browser.focused, 'system');
  browser.key('ArrowUp');
  assert.equal(browser.focused, 'dark');
  browser.key('Home');
  assert.equal(browser.focused, 'system');
  browser.key('End');
  assert.equal(browser.focused, 'dark');
  assert.equal(browser.selection, 'light');
  browser.key('Escape');
  assert.equal(browser.menuOpen, false);
  assert.equal(browser.focused, 'trigger');
});

test('keyboard can open the menu and choosing an option closes it and restores focus', () => {
  const browser = createBrowser();
  browser.mount();
  browser.key('ArrowUp', true);
  assert.equal(browser.menuOpen, true);
  assert.equal(browser.focused, 'dark');
  browser.choose('dark');
  assert.equal(browser.menuOpen, false);
  assert.equal(browser.focused, 'trigger');
  assert.equal(browser.selection, 'dark');
  browser.key('ArrowDown', true);
  assert.equal(browser.focused, 'system');
  browser.key('Tab');
  assert.equal(browser.menuOpen, false);
});

test('trigger icon follows the resolved theme while the system option stays selected', () => {
  const browser = createBrowser();
  browser.mount();
  assert.equal(browser.visibleIcon, 'light');
  browser.system(true);
  assert.equal(browser.visibleIcon, 'dark');
  assert.equal(browser.selection, 'system');
});
