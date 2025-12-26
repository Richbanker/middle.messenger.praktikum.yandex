import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

const { window } = dom;

(global as any).window = window;
(global as any).document = window.document;
(global as any).HTMLElement = window.HTMLElement;
(global as any).XMLHttpRequest = window.XMLHttpRequest;

if (global.navigator) {
  delete (global as any).navigator;
}

Object.defineProperty(global, 'navigator', {
  value: window.navigator,
  writable: true,
  configurable: true,
});

(global as any).localStorage = window.localStorage;

