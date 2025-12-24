import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

const { window } = dom;

Object.assign(global, {
  window: window as any,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  XMLHttpRequest: window.XMLHttpRequest,
});

