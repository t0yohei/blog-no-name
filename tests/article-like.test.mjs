import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/components/ArticleLike.astro', import.meta.url), 'utf8');
const script = ts.transpileModule(source.match(/<script>([\s\S]*?)<\/script>/)[1], {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;

function mount(responses) {
  const button = {
    hidden: true, disabled: true, attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
    removeAttribute(name) { this.attributes.delete(name); },
  };
  const label = { textContent: 'イイね' };
  const count = { textContent: '—' };
  const status = { textContent: '' };
  const requests = [];
  let Component;
  runInNewContext(script, {
    HTMLElement: class {
      dataset = { articleId: '20261012' };
      querySelector(selector) {
        return { button, '[data-label]': label, '[data-count]': count, '[role="status"]': status }[selector];
      }
    },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { this.callback([{ isIntersecting: true }]); }
      disconnect() {}
    },
    AbortController, Error, TypeError, SyntaxError,
    customElements: { define(_name, value) { Component = value; } },
    async fetch(url, options) {
      requests.push({ url, method: options.method });
      const result = responses.shift();
      if (result instanceof Error) throw result;
      return result;
    },
  });
  const component = new Component();
  component.connectedCallback();
  return { button, label, count, status, requests, component };
}

test('a non-JSON loading error offers a Japanese retry and recovers', async () => {
  const ui = mount([
    new Response('<html>Bad gateway</html>', { status: 502 }),
    Response.json({ count: 3, liked: false }),
  ]);
  await setImmediate();
  assert.equal(ui.status.textContent, '通信できませんでした。もう一度お試しください。');
  assert.equal(ui.label.textContent, '再試行');
  assert.equal(ui.count.textContent, '—');
  assert.equal(ui.button.disabled, false);
  ui.button.onclick();
  await setImmediate();
  assert.equal(ui.status.textContent, '');
  assert.equal(ui.label.textContent, 'イイね');
  assert.equal(ui.count.textContent, '3');
  assert.deepEqual(ui.requests.map(request => request.method), ['GET', 'GET']);
});

test('failed saves preserve the displayed count and retry the same desired state', async () => {
  const ui = mount([
    Response.json({ count: 2, liked: false }),
    new Response('<html>Service unavailable</html>', { status: 503 }),
    Response.json({ count: 3, liked: true }),
  ]);
  await setImmediate();
  ui.button.onclick();
  assert.equal(ui.button.disabled, true);
  ui.button.onclick();
  await setImmediate();
  assert.equal(ui.status.textContent, '通信できませんでした。もう一度お試しください。');
  assert.equal(ui.count.textContent, '2');
  assert.equal(ui.button.attributes.get('aria-pressed'), 'false');
  assert.equal(ui.button.disabled, false);
  ui.button.onclick();
  await setImmediate();
  assert.equal(ui.count.textContent, '3');
  assert.equal(ui.button.attributes.get('aria-pressed'), 'true');
  assert.deepEqual(ui.requests.map(request => request.method), ['GET', 'PUT', 'PUT']);
});
