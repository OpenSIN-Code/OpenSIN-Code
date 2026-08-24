import { vi } from 'vitest';

export function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  };
}

export function restoreConsole(mocks: ReturnType<typeof mockConsole>) {
  Object.values(mocks).forEach((m) => m.mockRestore());
}

export function createMockUIElement(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: '#test-element',
    tagName: 'div',
    className: 'test-class',
    textContent: 'Test content',
    attributes: {},
    boundingRect: { left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50 },
    xpath: '/html/body/div[1]',
    cssSelector: 'div.test-class',
    zIndex: 0,
    isVisible: true,
    parentElement: null,
    children: [],
    computedStyles: {},
    ...overrides,
  };
}

export function createMockCanvasComponent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'comp-test-123',
    type: 'button',
    name: 'Test Button',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    rotation: 0,
    zIndex: 1,
    properties: { text: 'Click me' },
    styles: { backgroundColor: '#3b82f6' },
    children: [],
    parentId: null,
    locked: false,
    visible: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function createMockCLIMessage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'msg-test',
    role: 'user',
    content: 'Hello',
    timestamp: Date.now(),
    ...overrides,
  };
}

export function createMockToolCall(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'tc-test',
    toolName: 'read_file',
    parameters: { path: 'test.txt' },
    result: { success: true, output: 'content' },
    timestamp: Date.now(),
    duration: 0,
    approved: true,
    ...overrides,
  };
}

export function createMockJetBrainsConfig(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    protocol: 'ws',
    host: 'localhost',
    port: 63342,
    timeoutMs: 5000,
    reconnectAttempts: 3,
    reconnectDelayMs: 1000,
    ...overrides,
  };
}

export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

export function advanceTimersByTime(ms: number) {
  vi.advanceTimersByTime(ms);
}
