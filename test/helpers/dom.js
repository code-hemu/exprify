/**
 * A very small DOM stand-in so the playground module can be exercised in
 * node:test without pulling in a browser or a full DOM implementation.
 * Only the handful of APIs the playground actually touches are covered.
 */

class ClassList {
  constructor() {
    this.items = new Set();
  }

  add(...names) {
    for (const name of names) this.items.add(name);
  }

  remove(...names) {
    for (const name of names) this.items.delete(name);
  }

  contains(name) {
    return this.items.has(name);
  }
}

export class StubElement {
  constructor(tag = 'div') {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this.classList = new ClassList();
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.value = '';
    this.returnValue = '';
    this.open = false;
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this._text = '';
  }

  get className() {
    return [...this.classList.items].join(' ');
  }

  set className(value) {
    this.classList.items = new Set(
      String(value)
        .split(/\s+/)
        .filter(Boolean),
    );
  }

  get textContent() {
    return this._text;
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  append(...nodes) {
    for (const node of nodes) {
      node.parentNode = this;
      this.children.push(node);
    }
  }

  replaceChildren(...nodes) {
    this.children = [];
    this.append(...nodes);
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(
      (child) => child !== this,
    );
    this.parentNode = null;
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  removeEventListener(type, handler) {
    const handlers = this.listeners.get(type);
    if (!handlers) return;
    this.listeners.set(
      type,
      handlers.filter((entry) => entry !== handler),
    );
  }

  dispatch(type, detail = {}) {
    const event = {
      type,
      detail,
      preventDefault() {},
      stopPropagation() {},
      ...detail,
    };

    for (const handler of this.listeners.get(type) ?? []) handler(event);
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  focus() {}
  blur() {}
  select() {}
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  setSelectionRange(start, end) {
    this.selectionStart = start;
    this.selectionEnd = end;
  }
}

export function installDom() {
  const registry = new Map();

  const document = {
    getElementById(id) {
      if (!registry.has(id)) registry.set(id, new StubElement('div'));
      return registry.get(id);
    },
    createElement(tag) {
      return new StubElement(tag);
    },
    addEventListener() {},
    removeEventListener() {},
    execCommand: () => true,
    body: new StubElement('body'),
  };

  const storage = new Map();

  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  };

  const window = {
    location: { href: 'http://localhost/playground/', hash: '' },
    history: {
      replaceState(_state, _title, url) {
        const parsed = new URL(url);
        window.location.href = parsed.href;
        window.location.hash = parsed.hash;
      },
    },
    isSecureContext: false,
    confirm: () => true,
    setTimeout: (...args) => setTimeout(...args),
    clearTimeout: (...args) => clearTimeout(...args),
  };

  globalThis.document = document;
  globalThis.window = window;
  globalThis.localStorage = localStorage;

  return {
    document,
    window,
    localStorage,
    storage,
    el: (id) => document.getElementById(id),
    restore() {
      delete globalThis.document;
      delete globalThis.window;
      delete globalThis.localStorage;
    },
  };
}
