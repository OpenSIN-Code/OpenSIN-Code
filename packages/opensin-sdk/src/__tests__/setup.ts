import { vi } from 'vitest';

// Global mock for browser APIs
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: vi.fn(), readText: vi.fn() } },
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'document', {
  value: {
    createElement: vi.fn(() => ({
      style: {},
      setAttribute: vi.fn(),
      appendChild: vi.fn(),
      remove: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      classList: { add: vi.fn(), remove: vi.fn() },
      innerHTML: '',
      textContent: '',
      id: '',
    })),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      classList: { add: vi.fn(), remove: vi.fn() },
    },
    head: {
      appendChild: vi.fn(),
    },
    getElementById: vi.fn(),
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'window', {
  value: {
    innerWidth: 1920,
    innerHeight: 1080,
    scrollX: 0,
    scrollY: 0,
    devicePixelRatio: 1,
    getComputedStyle: vi.fn(() => ({
      getPropertyValue: vi.fn(() => ''),
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      zIndex: '0',
    })),
    requestAnimationFrame: vi.fn((cb: any) => setTimeout(() => cb(0), 16)),
    cancelAnimationFrame: vi.fn(clearTimeout),
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
  },
  writable: true,
  configurable: true,
});

// Suppress console noise during tests
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'log').mockImplementation(() => {});
