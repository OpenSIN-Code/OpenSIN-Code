import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { CLIAgent } from '../cli-agent/agent.js';
import { SessionManager } from '../cli-agent/session.js';
import { ToolRegistry, createBuiltinTools } from '../cli-agent/tools.js';
import {
  createDefaultConfig,
  loadConfigFromFile,
  saveConfigToFile,
  mergeCommandOptions,
  validateConfig,
  getConfigDefaults,
} from '../cli-agent/config.js';
import type {
  CLIAgentConfig,
  CLIAgentSession,
  CLIMessage,
  CLIContext,
  CLITool,
  ToolCallRecord,
  ToolResult,
  TokenUsage,
  CLICommand,
  CLICommandOptions,
  CLIAgentState,
  CLIEvent,
} from '../cli-agent/types.js';

vi.mock('fs', () => {
  const existsSync = vi.fn(() => true);
  const readFileSync = vi.fn(() => JSON.stringify({ model: 'test-model' }));
  const writeFileSync = vi.fn(() => {});
  const mkdirSync = vi.fn(() => {});
  const fsMock = { existsSync, readFileSync, writeFileSync, mkdirSync };
  return {
    default: fsMock,
    ...fsMock,
  };
});

vi.mock('path', () => ({
  resolve: vi.fn((p: string) => '/tmp' + p),
  dirname: vi.fn((p: string) => '/tmp'),
}));

vi.mock('readline', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn((_prompt: string, cb: (input: string) => void) => cb('/quit')),
    close: vi.fn(),
  })),
}));

const mockedFs = vi.mocked(fs);

describe('cli-agent', () => {
  describe('config', () => {
    it('should create default config', () => {
      const config = createDefaultConfig({ sessionId: 'test-1', workspacePath: '/test' });
      expect(config.sessionId).toBe('test-1');
      expect(config.workspacePath).toBe('/test');
      expect(config.model).toBe('claude-sonnet-4-20250514');
      expect(config.provider).toBe('anthropic');
      expect(config.interactive).toBe(true);
    });

    it('should override defaults', () => {
      const config = createDefaultConfig({
        sessionId: 'test-2',
        workspacePath: '/test',
        model: 'gpt-4',
        temperature: 0.5,
        verbose: true,
      });
      expect(config.model).toBe('gpt-4');
      expect(config.temperature).toBe(0.5);
      expect(config.verbose).toBe(true);
    });

    it('should generate session id when not provided', () => {
      const config = createDefaultConfig({ workspacePath: '/test' } as Partial<CLIAgentConfig>);
      expect(config.sessionId).toBeDefined();
      expect(config.sessionId).toMatch(/^cli-/);
    });

    it('should validate correct config', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test' });
      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it('should detect missing sessionId', () => {
      const errors = validateConfig({ workspacePath: '/test' } as CLIAgentConfig);
      expect(errors).toContain('sessionId is required');
    });

    it('should detect missing workspacePath', () => {
      const errors = validateConfig({ sessionId: 'test' } as CLIAgentConfig);
      expect(errors).toContain('workspacePath is required');
    });

    it('should detect invalid temperature', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test', temperature: 3 });
      const errors = validateConfig(config);
      expect(errors).toContain('temperature must be between 0 and 2');
    });

    it('should detect negative temperature', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test', temperature: -1 });
      const errors = validateConfig(config);
      expect(errors).toContain('temperature must be between 0 and 2');
    });

    it('should detect invalid maxTokens', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test', maxTokens: 0 });
      const errors = validateConfig(config);
      expect(errors).toContain('maxTokens must be positive');
    });

    it('should detect small contextWindowSize', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test', contextWindowSize: 500 });
      const errors = validateConfig(config);
      expect(errors).toContain('contextWindowSize must be at least 1000');
    });

    it('should detect missing model', () => {
      const errors = validateConfig({ sessionId: 'test', workspacePath: '/test', model: '' } as CLIAgentConfig);
      expect(errors).toContain('model is required');
    });

    it('should detect missing provider', () => {
      const errors = validateConfig({ sessionId: 'test', workspacePath: '/test', provider: '' } as CLIAgentConfig);
      expect(errors).toContain('provider is required');
    });

    it('should merge command options', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test' });
      const options: CLICommandOptions = { model: 'gpt-4', temperature: 0.3 };
      const merged = mergeCommandOptions(config, options);
      expect(merged.model).toBe('gpt-4');
      expect(merged.temperature).toBe(0.3);
      expect(merged.maxTokens).toBe(config.maxTokens);
    });

    it('should keep existing values when options not provided', () => {
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test' });
      const merged = mergeCommandOptions(config, {});
      expect(merged.model).toBe(config.model);
      expect(merged.temperature).toBe(config.temperature);
    });

    it('should get config defaults', () => {
      const defaults = getConfigDefaults();
      expect(defaults.model).toBe('claude-sonnet-4-20250514');
      expect(defaults.provider).toBe('anthropic');
      expect(defaults.temperature).toBe(0.7);
      expect(defaults.interactive).toBe(true);
      expect(defaults.batchMode).toBe(false);
    });

    it('should load config from file', async () => {
      const os = await vi.importActual('os');
      const path = await vi.importActual('path');
      const fsReal = await vi.importActual('fs');
      const tmpDir = os.tmpdir();
      const testConfigPath = path.join(tmpDir, 'test-opensin-config.json');
      fsReal.writeFileSync(testConfigPath, JSON.stringify({ model: 'test-model', provider: 'test' }));
      const config = loadConfigFromFile(testConfigPath);
      expect(config).not.toBeNull();
      expect(config?.model).toBe('test-model');
      fsReal.unlinkSync(testConfigPath);
    });

    it('should return null when config file does not exist', () => {
      const config = loadConfigFromFile('/nonexistent/config-12345.json');
      expect(config).toBeNull();
    });

    it('should save config to file', async () => {
      const os = await vi.importActual('os');
      const path = await vi.importActual('path');
      const fsReal = await vi.importActual('fs');
      const tmpDir = os.tmpdir();
      const testConfigPath = path.join(tmpDir, 'test-save-config.json');
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test' });
      const result = saveConfigToFile(config, testConfigPath);
      expect(result).toBe(true);
      expect(fsReal.existsSync(testConfigPath)).toBe(true);
      fsReal.unlinkSync(testConfigPath);
    });

    it('should return false when save fails', () => {
      mockedFs.writeFileSync.mockImplementation(() => { throw new Error('write failed'); });
      const config = createDefaultConfig({ sessionId: 'test', workspacePath: '/test' });
      const result = saveConfigToFile(config, '/test/config.json');
      expect(result).toBe(false);
      mockedFs.writeFileSync.mockImplementation(() => {});
    });
  });

  describe('types', () => {
    it('should support CLIAgentConfig type', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude-sonnet-4-20250514',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: ['read_file'],
        verbose: false,
      };
      expect(config.sessionId).toBe('test');
      expect(config.autoApproveTools).toContain('read_file');
    });

    it('should support CLIMessage type', () => {
      const message: CLIMessage = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      };
      expect(message.role).toBe('user');
    });

    it('should support CLIContext type', () => {
      const context: CLIContext = {
        workspacePath: '/test',
        activeFiles: ['index.ts'],
        gitBranch: 'main',
        environment: { NODE_ENV: 'test' },
        customVariables: {},
      };
      expect(context.gitBranch).toBe('main');
    });

    it('should support CLITool type', () => {
      const tool: CLITool = {
        name: 'read_file',
        description: 'Read a file',
        parameters: { path: { type: 'string' } },
        execute: async () => ({ success: true, output: 'content' }),
        requiresApproval: false,
      };
      expect(tool.name).toBe('read_file');
      expect(tool.requiresApproval).toBe(false);
    });

    it('should support ToolCallRecord type', () => {
      const call: ToolCallRecord = {
        id: 'tc-1',
        toolName: 'read_file',
        parameters: { path: 'test.txt' },
        result: { success: true, output: 'content' },
        timestamp: Date.now(),
        duration: 100,
        approved: true,
      };
      expect(call.approved).toBe(true);
    });

    it('should support ToolResult type', () => {
      const result: ToolResult = {
        success: true,
        output: 'file contents',
        exitCode: 0,
      };
      expect(result.success).toBe(true);
    });

    it('should support TokenUsage type', () => {
      const usage: TokenUsage = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
        estimatedCost: 0.015,
      };
      expect(usage.totalTokens).toBe(1500);
    });

    it('should support CLICommand type', () => {
      const command: CLICommand = {
        type: 'chat',
        input: 'What is this file?',
        options: { model: 'gpt-4', files: ['test.ts'] },
      };
      expect(command.type).toBe('chat');
    });

    it('should support CLIAgentState type', () => {
      const session: CLIAgentSession = {
        id: 'session-1',
        createdAt: Date.now(),
        lastActivity: Date.now(),
        messages: [],
        context: { workspacePath: '/test', activeFiles: [], environment: {}, customVariables: {} },
        status: 'active',
        toolCalls: [],
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      };
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      const state: CLIAgentState = { session, config, isStreaming: false };
      expect(state.isStreaming).toBe(false);
    });

    it('should support CLIEvent type variants', () => {
      const events: CLIEvent[] = [
        { type: 'message:start', messageId: 'msg-1' },
        { type: 'message:delta', messageId: 'msg-1', delta: 'Hello' },
        { type: 'message:end', messageId: 'msg-1' },
        { type: 'complete' },
        { type: 'error', error: 'Something went wrong' },
      ];
      expect(events.map((e) => e.type)).toContain('message:start');
      expect(events.map((e) => e.type)).toContain('complete');
      expect(events.map((e) => e.type)).toContain('error');
    });
  });

  describe('CLIAgent', () => {
    let agent: CLIAgent;

    beforeEach(() => {
      agent = new CLIAgent({
        sessionId: 'test-session',
        workspacePath: '/test',
      });
    });

    it('should create CLIAgent instance', () => {
      expect(agent).toBeDefined();
    });

    it('should get agent state', () => {
      const state = agent.getState();
      expect(state).toBeDefined();
      expect(state.config.sessionId).toBe('test-session');
    });

    it('should get session', () => {
      const session = agent.getSession();
      expect(session).toBeDefined();
      expect(session.id).toBe('test-session');
    });

    it('should get available tools', () => {
      const tools = agent.getAvailableTools();
      expect(Array.isArray(tools)).toBe(true);
    });

    it('should register custom tool', () => {
      const tool: CLITool = {
        name: 'custom_tool',
        description: 'A custom tool',
        parameters: {},
        execute: async () => ({ success: true, output: 'done' }),
        requiresApproval: false,
      };
      agent.registerTool(tool);
      const tools = agent.getAvailableTools();
      expect(tools.some((t) => t.name === 'custom_tool')).toBe(true);
    });

    it('should register event listener', () => {
      const listener = vi.fn();
      agent.onEvent(listener);
      expect(agent).toBeDefined();
    });

    it('should unregister event listener', () => {
      const listener = vi.fn();
      agent.onEvent(listener);
      agent.offEvent(listener);
      expect(agent).toBeDefined();
    });

    it('should abort agent', () => {
      agent.abort();
      const state = agent.getState();
      expect(state).toBeDefined();
    });

    it('should process user input', async () => {
      await agent.processUserInput('Hello, world');
      const session = agent.getSession();
      expect(session.messages.length).toBeGreaterThan(0);
    });

    it('should approve tool call', async () => {
      const toolCall: ToolCallRecord = {
        id: 'tc-test',
        toolName: 'read_file',
        parameters: { path: 'test.txt' },
        result: { success: false, output: '', error: 'Not executed' },
        timestamp: Date.now(),
        duration: 0,
        approved: false,
      };
      (agent as any).approvalQueue.push(toolCall);
      await agent.approveTool('tc-test');
      expect((agent as any).approvalQueue.length).toBe(0);
    });

    it('should handle approving non-existent tool call', async () => {
      await agent.approveTool('nonexistent');
      expect((agent as any).approvalQueue.length).toBe(0);
    });

    it('should handle rejecting non-existent tool call', async () => {
      await agent.rejectTool('nonexistent', 'Not found');
      expect((agent as any).approvalQueue.length).toBe(0);
    });

    it('should reject tool call', async () => {
      const toolCall: ToolCallRecord = {
        id: 'tc-reject',
        toolName: 'bash',
        parameters: { command: 'rm -rf /' },
        result: { success: false, output: '', error: 'Not executed' },
        timestamp: Date.now(),
        duration: 0,
        approved: false,
      };
      (agent as any).approvalQueue.push(toolCall);
      await agent.rejectTool('tc-reject', 'Dangerous command');
      expect((agent as any).approvalQueue.length).toBe(0);
    });

    it('should run batch commands', async () => {
      const commands: CLICommand[] = [
        { type: 'chat', input: 'Hello' },
        { type: 'chat', input: 'World' },
      ];
      const session = await agent.runBatch(commands);
      expect(session).toBeDefined();
      expect(session.status).toBe('completed');
    });
  });

  describe('SessionManager', () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should create SessionManager instance', () => {
      expect(sessionManager).toBeDefined();
    });

    it('should create session', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      const session = sessionManager.createSession(config);
      expect(session).toBeDefined();
      expect(session.id).toBe('test');
    });

    it('should add message to session', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      const message: CLIMessage = { id: 'msg-1', role: 'user', content: 'Hello', timestamp: Date.now() };
      sessionManager.addMessage('test', message);
      const session = sessionManager.getSession('test');
      expect(session?.messages.length).toBe(1);
    });

    it('should add tool call to session', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      const toolCall: ToolCallRecord = {
        id: 'tc-1',
        toolName: 'read_file',
        parameters: {},
        result: { success: true, output: 'content' },
        timestamp: Date.now(),
        duration: 100,
        approved: true,
      };
      sessionManager.addToolCall('test', toolCall);
      const session = sessionManager.getSession('test');
      expect(session?.toolCalls.length).toBe(1);
    });

    it('should set session status', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      sessionManager.setStatus('test', 'completed');
      const session = sessionManager.getSession('test');
      expect(session?.status).toBe('completed');
    });

    it('should get recent messages', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      for (let i = 0; i < 5; i++) {
        sessionManager.addMessage('test', { id: `msg-${i}`, role: 'user', content: `Message ${i}`, timestamp: Date.now() });
      }
      const recent = sessionManager.getRecentMessages('test', 3);
      expect(recent.length).toBe(3);
    });

    it('should clear history', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      sessionManager.addMessage('test', { id: 'msg-1', role: 'user', content: 'Hello', timestamp: Date.now() });
      sessionManager.clearHistory('test');
      const session = sessionManager.getSession('test');
      expect(session?.messages.length).toBe(0);
    });

    it('should get active session', () => {
      const config: CLIAgentConfig = {
        sessionId: 'test',
        model: 'claude',
        provider: 'anthropic',
        workspacePath: '/test',
        maxTokens: 8192,
        temperature: 0.7,
        interactive: true,
        batchMode: false,
        contextWindowSize: 200000,
        toolTimeoutMs: 30000,
        autoApproveTools: [],
        verbose: false,
      };
      sessionManager.createSession(config);
      const active = sessionManager.getActiveSession();
      expect(active).toBeDefined();
      expect(active?.id).toBe('test');
    });

    it('should return undefined for non-existent session', () => {
      const session = sessionManager.getSession('nonexistent');
      expect(session).toBe(null);
    });
  });

  describe('ToolRegistry', () => {
    it('should create ToolRegistry instance', () => {
      const registry = new ToolRegistry();
      expect(registry).toBeDefined();
    });

    it('should register and list tools', () => {
      const registry = new ToolRegistry();
      const tool: CLITool = {
        name: 'test_tool',
        description: 'Test',
        parameters: {},
        execute: async () => ({ success: true, output: 'ok' }),
        requiresApproval: false,
      };
      registry.register(tool);
      const tools = registry.list();
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('test_tool');
    });

    it('should get tool by name', () => {
      const registry = new ToolRegistry();
      const tool: CLITool = {
        name: 'my_tool',
        description: 'Test',
        parameters: {},
        execute: async () => ({ success: true, output: 'ok' }),
        requiresApproval: false,
      };
      registry.register(tool);
      const found = registry.get('my_tool');
      expect(found).toBeDefined();
      expect(found?.name).toBe('my_tool');
    });

    it('should return undefined for non-existent tool', () => {
      const registry = new ToolRegistry();
      const found = registry.get('nonexistent');
      expect(found).toBeUndefined();
    });

    it('should execute registered tool', async () => {
      const registry = new ToolRegistry();
      const tool: CLITool = {
        name: 'exec_tool',
        description: 'Test',
        parameters: {},
        execute: async () => ({ success: true, output: 'executed' }),
        requiresApproval: false,
      };
      registry.register(tool);
      const result = await registry.execute('exec_tool', {});
      expect(result.success).toBe(true);
      expect(result.output).toBe('executed');
    });

    it('should return error when executing non-existent tool', async () => {
      const registry = new ToolRegistry();
      const result = await registry.execute('nonexistent', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('nonexistent');
    });

    it('should create builtin tools', () => {
      const tools = createBuiltinTools('/test');
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });
});
