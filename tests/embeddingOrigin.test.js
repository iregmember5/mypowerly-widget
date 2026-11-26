import test from 'node:test';
import assert from 'node:assert/strict';
import { getEmbeddingOrigin } from '../src/lib/embeddingOrigin.js';

const makeWindow = () => {
  let listener;
  return {
    location: { href: 'https://mypowerlywidget.mypowerly.com/', origin: 'https://mypowerlywidget.mypowerly.com' },
    addEventListener: (_type, callback) => { listener = callback; },
    removeEventListener: (_type, callback) => { if (listener === callback) listener = undefined; },
    receive: (event) => listener?.(event),
  };
};

test('uses the browser-verified parent origin when the page suppresses referrers', async () => {
  const ownWindow = makeWindow();
  const parentWindow = {
    postMessage: (request) => {
      assert.equal(request.type, 'WIDGET_ORIGIN_REQUEST');
      queueMicrotask(() => ownWindow.receive({
        source: parentWindow,
        origin: 'https://mypowerly.com',
        data: { type: 'WIDGET_ORIGIN_RESPONSE' },
      }));
    },
  };
  assert.equal(await getEmbeddingOrigin({ ownWindow, parentWindow, referrer: '' }), 'https://mypowerly.com');
});

test('ignores origin responses from a different window', async () => {
  const ownWindow = makeWindow();
  const parentWindow = {
    postMessage: () => queueMicrotask(() => ownWindow.receive({
      source: {}, origin: 'https://spoofed.example', data: { type: 'WIDGET_ORIGIN_RESPONSE' },
    })),
  };
  assert.equal(await getEmbeddingOrigin({
    ownWindow, parentWindow, referrer: 'https://customer.example/page', timeoutMs: 5,
  }), 'https://customer.example');
});

test('keeps direct widget visits on the existing fallback path', async () => {
  const ownWindow = makeWindow();
  assert.equal(await getEmbeddingOrigin({ ownWindow, parentWindow: ownWindow, referrer: '' }),
    'https://mypowerlywidget.mypowerly.com');
});
