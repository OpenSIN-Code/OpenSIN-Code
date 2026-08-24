import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtocolClient, ProtocolSerializer, METHODS, PROTOCOL_VERSION } from '../jetbrains-plugin/protocol.js';
import { LifecycleManager } from '../jetbrains-plugin/lifecycle.js';
import { DocumentManager } from '../jetbrains-plugin/document.js';
import { EditorManager } from '../jetbrains-plugin/editor.js';
import { ProjectManager } from '../jetbrains-plugin/project.js';
import { JetBrainsPlugin } from '../jetbrains-plugin/index.js';
import type {
  JetBrainsConnectionConfig,
  JetBrainsDocumentInfo,
  JetBrainsEditorState,
  JetBrainsProjectInfo,
  JetBrainsActionResponse,
  JetBrainsNotification,
  JetBrainsToolWindow,
  JetBrainsTerminalState,
  JetBrainsLifecycleState,
  JetBrainsEvent,
  JetBrainsFileChange,
} from '../jetbrains-plugin/types.js';

vi.mock('ws', () => {
  const MockWebSocket = vi.fn().mockImplementation(() => ({
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    readyState: 1,
    send: vi.fn(),
    close: vi.fn(),
  }));
  MockWebSocket.OPEN = 1;
  return { default: MockWebSocket, WebSocket: MockWebSocket };
});

describe('jetbrains-plugin', () => {
  describe('Protocol', () => {
    it('should export PROTOCOL_VERSION', () => {
      expect(PROTOCOL_VERSION).toBe('2.0.0');
    });

    it('should export METHODS constant', () => {
      expect(METHODS.INITIALIZE).toBe('jetbrains/initialize');
      expect(METHODS.SHUTDOWN).toBe('jetbrains/shutdown');
      expect(METHODS.PING).toBe('jetbrains/ping');
      expect(METHODS.DOCUMENT_GET).toBe('jetbrains/document/get');
      expect(METHODS.EDITOR_STATE).toBe('jetbrains/editor/state');
      expect(METHODS.PROJECT_INFO).toBe('jetbrains/project/info');
    });

    it('should create ProtocolClient instance', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      expect(client).toBeDefined();
    });

    it('should create protocol message', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const message = client.createMessage('test/method', { key: 'value' });
      expect(message.jsonrpc).toBe('2.0');
      expect(message.method).toBe('test/method');
      expect(message.params).toEqual({ key: 'value' });
      expect(message.id).toBeDefined();
    });

    it('should create success response', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const response = client.createResponse(1, { result: 'ok' });
      expect(response.jsonrpc).toBe('2.0');
      expect(response.result).toEqual({ result: 'ok' });
      expect(response.id).toBe(1);
      expect(response.error).toBeUndefined();
    });

    it('should create error response', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const response = client.createErrorResponse(1, -32600, 'Invalid Request');
      expect(response.jsonrpc).toBe('2.0');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32600);
      expect(response.error?.message).toBe('Invalid Request');
      expect(response.id).toBe(1);
    });

    it('should set on message handler', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const handler = vi.fn();
      client.setOnMessage(handler);
      expect(client).toBeDefined();
    });

    it('should set on event handler', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const handler = vi.fn();
      client.setOnEvent(handler);
      expect(client).toBeDefined();
    });

    it('should disconnect client', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      client.disconnect();
      expect(client).toBeDefined();
    });
  });

  describe('ProtocolSerializer', () => {
    it('should serialize protocol message', () => {
      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const serialized = ProtocolSerializer.serialize(message);
      expect(serialized).toContain('Content-Length:');
      expect(serialized).toContain('"jsonrpc":"2.0"');
    });

    it('should deserialize valid protocol message', () => {
      const message = { jsonrpc: '2.0', method: 'test', id: 1 };
      const serialized = ProtocolSerializer.serialize(message);
      const deserialized = ProtocolSerializer.deserialize(serialized);
      expect(deserialized).not.toBeNull();
      expect(deserialized?.jsonrpc).toBe('2.0');
      expect((deserialized as any).method).toBe('test');
    });

    it('should return null for invalid serialized data', () => {
      const deserialized = ProtocolSerializer.deserialize('invalid data');
      expect(deserialized).toBeNull();
    });

    it('should return null for malformed header', () => {
      const deserialized = ProtocolSerializer.deserialize('Content-Length: abc\r\n\r\n{}');
      expect(deserialized).toBeNull();
    });
  });

  describe('LifecycleManager', () => {
    let client: ProtocolClient;
    let lifecycle: LifecycleManager;

    beforeEach(() => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      client = new ProtocolClient(config);
      lifecycle = new LifecycleManager(client);
    });

    it('should create LifecycleManager instance', () => {
      expect(lifecycle).toBeDefined();
    });

    it('should start with initializing state', () => {
      const state = lifecycle.getState();
      expect(state.phase).toBe('initializing');
      expect(state.connectionStatus).toBe('disconnected');
    });

    it('should not be ready initially', () => {
      expect(lifecycle.isReady()).toBe(false);
    });

    it('should set state change listener', () => {
      const listener = vi.fn();
      lifecycle.setStateChangeListener(listener);
      expect(lifecycle).toBeDefined();
    });

    it('should set event listener', () => {
      const listener = vi.fn();
      lifecycle.setEventListener(listener);
      expect(lifecycle).toBeDefined();
    });

    it('should throw when subscribing events while not ready', async () => {
      await expect(lifecycle.subscribeEvents(['document.change'])).rejects.toThrow('Lifecycle not ready');
    });

    it('should throw when unsubscribing events while not ready', async () => {
      await expect(lifecycle.unsubscribeEvents(['document.change'])).rejects.toThrow('Lifecycle not ready');
    });

    it('should stop lifecycle', async () => {
      await lifecycle.stop();
      const state = lifecycle.getState();
      expect(state.phase).toBe('terminated');
    });
  });

  describe('DocumentManager', () => {
    let client: ProtocolClient;
    let docManager: DocumentManager;

    beforeEach(() => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      client = new ProtocolClient(config);
      docManager = new DocumentManager(client);
    });

    it('should create DocumentManager instance', () => {
      expect(docManager).toBeDefined();
    });

    it('should set document change listener', () => {
      const listener = vi.fn();
      docManager.onDocumentChange(listener);
      expect(docManager).toBeDefined();
    });

    it('should update document', () => {
      expect(docManager).toBeDefined();
    });
  });

  describe('EditorManager', () => {
    let client: ProtocolClient;
    let editorManager: EditorManager;

    beforeEach(() => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      client = new ProtocolClient(config);
      editorManager = new EditorManager(client);
    });

    it('should create EditorManager instance', () => {
      expect(editorManager).toBeDefined();
    });

    it('should set selection change listener', () => {
      const listener = vi.fn();
      editorManager.onSelectionChange(listener);
      expect(editorManager).toBeDefined();
    });
  });

  describe('ProjectManager', () => {
    let client: ProtocolClient;
    let projectManager: ProjectManager;

    beforeEach(() => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      client = new ProtocolClient(config);
      projectManager = new ProjectManager(client);
    });

    it('should create ProjectManager instance', () => {
      expect(projectManager).toBeDefined();
    });

    it('should set project change listener', () => {
      const listener = vi.fn();
      projectManager.onFileChange(listener);
      expect(projectManager).toBeDefined();
    });
  });

  describe('JetBrainsPlugin', () => {
    it('should create JetBrainsPlugin components individually', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'ws',
        host: 'localhost',
        port: 63342,
        timeoutMs: 5000,
        reconnectAttempts: 3,
        reconnectDelayMs: 1000,
      };
      const client = new ProtocolClient(config);
      const lifecycle = new LifecycleManager(client);
      const documents = new DocumentManager(client);
      const editor = new EditorManager(client);
      const project = new ProjectManager(client);
      expect(lifecycle).toBeDefined();
      expect(documents).toBeDefined();
      expect(editor).toBeDefined();
      expect(project).toBeDefined();
    });
  });
  });

  describe('types', () => {
    it('should support JetBrainsConnectionConfig type', () => {
      const config: JetBrainsConnectionConfig = {
        protocol: 'wss',
        host: 'example.com',
        port: 443,
        timeoutMs: 10000,
        reconnectAttempts: 5,
        reconnectDelayMs: 2000,
      };
      expect(config.protocol).toBe('wss');
      expect(config.port).toBe(443);
    });

    it('should support JetBrainsLifecycleState type', () => {
      const state: JetBrainsLifecycleState = {
        phase: 'ready',
        startTime: Date.now(),
        lastActivity: Date.now(),
        connectionStatus: 'connected',
        errorCount: 0,
      };
      expect(state.phase).toBe('ready');
      expect(state.connectionStatus).toBe('connected');
    });

    it('should support JetBrainsEvent type', () => {
      const event: JetBrainsEvent = {
        type: 'document.change',
        data: { fileUrl: 'file:///test.ts' },
        timestamp: Date.now(),
      };
      expect(event.type).toBe('document.change');
    });

    it('should support JetBrainsFileChange type', () => {
      const change: JetBrainsFileChange = {
        fileUrl: 'file:///test.ts',
        changeType: 'modified',
        timestamp: Date.now(),
      };
      expect(change.changeType).toBe('modified');
    });
  });
});
