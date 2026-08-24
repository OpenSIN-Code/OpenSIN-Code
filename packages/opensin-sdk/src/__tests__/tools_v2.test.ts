import { describe, it, expect } from 'vitest';
import { tagMessagesWithToolUseID, getToolUseIDFromParentMessage } from '../tools_v2/utils.js';
import type { ToolDefinition, ToolResult, ToolCall, ToolCategory } from '../tools_v2/types.js';

describe('tools_v2', () => {
  it('should export ToolDefinition type', () => {
    const def: ToolDefinition = {
      name: 'test_tool',
      description: 'A test tool',
      inputSchema: { type: 'object' },
      handler: async () => ({ content: [{ type: 'text', text: 'ok' }] }),
    };
    expect(def.name).toBe('test_tool');
    expect(typeof def.handler).toBe('function');
  });

  it('should export ToolResult type', () => {
    const result: ToolResult = {
      content: [{ type: 'text', text: 'success' }],
      isError: false,
    };
    expect(result.content).toHaveLength(1);
    expect(result.isError).toBe(false);
  });

  it('should export ToolCall type', () => {
    const call: ToolCall = {
      id: 'call-1',
      name: 'read_file',
      input: { path: 'test.txt' },
      status: 'completed',
      startedAt: Date.now(),
      completedAt: Date.now(),
    };
    expect(call.id).toBe('call-1');
    expect(call.status).toBe('completed');
  });

  it('should export ToolCategory union', () => {
    const categories: ToolCategory[] = ['communication', 'planning', 'execution', 'information', 'automation', 'utility'];
    expect(categories).toHaveLength(6);
    expect(categories).toContain('communication');
    expect(categories).toContain('utility');
  });

  it('should tag messages with tool use ID', () => {
    const messages = [
      { type: 'user' as const, content: 'hello' },
      { type: 'system' as const, content: 'system msg' },
    ];
    const tagged = tagMessagesWithToolUseID(messages, 'tool-123');
    expect(tagged[0]).toHaveProperty('sourceToolUseID', 'tool-123');
    expect(tagged[1]).not.toHaveProperty('sourceToolUseID');
  });

  it('should not tag messages when toolUseID is undefined', () => {
    const messages = [{ type: 'user' as const, content: 'hello' }];
    const tagged = tagMessagesWithToolUseID(messages, undefined);
    expect(tagged).toBe(messages);
    expect(tagged[0]).not.toHaveProperty('sourceToolUseID');
  });

  it('should not tag non-user messages', () => {
    const messages = [
      { type: 'attachment' as const, content: 'file.txt' },
      { type: 'system' as const, content: 'system' },
    ];
    const tagged = tagMessagesWithToolUseID(messages, 'tool-1');
    expect(tagged).toEqual(messages);
  });

  it('should extract tool use ID from parent message', () => {
    const parentMessage = {
      message: {
        content: [
          { type: 'tool_use' as const, name: 'read_file', id: 'tu-123' },
          { type: 'text' as const, text: 'reading file' },
        ],
      },
    };
    const id = getToolUseIDFromParentMessage(parentMessage as any, 'read_file');
    expect(id).toBe('tu-123');
  });

  it('should return undefined for non-matching tool name', () => {
    const parentMessage = {
      message: {
        content: [
          { type: 'tool_use' as const, name: 'read_file', id: 'tu-123' },
        ],
      },
    };
    const id = getToolUseIDFromParentMessage(parentMessage as any, 'write_file');
    expect(id).toBeUndefined();
  });

  it('should return undefined when no tool_use blocks exist', () => {
    const parentMessage = {
      message: {
        content: [
          { type: 'text' as const, text: 'hello' },
        ],
      },
    };
    const id = getToolUseIDFromParentMessage(parentMessage as any, 'read_file');
    expect(id).toBeUndefined();
  });

  it('should handle ToolResult with error flag', () => {
    const errorResult: ToolResult = {
      content: [{ type: 'text', text: 'error occurred' }],
      isError: true,
    };
    expect(errorResult.isError).toBe(true);
  });

  it('should handle ToolCall with pending status', () => {
    const pendingCall: ToolCall = {
      id: 'call-2',
      name: 'bash',
      input: { command: 'echo hello' },
      status: 'pending',
    };
    expect(pendingCall.status).toBe('pending');
    expect(pendingCall.result).toBeUndefined();
  });

  it('should handle ToolCall with error status', () => {
    const errorCall: ToolCall = {
      id: 'call-3',
      name: 'bash',
      input: { command: 'invalid' },
      status: 'error',
      result: { content: [{ type: 'text', text: 'command failed' }], isError: true },
    };
    expect(errorCall.status).toBe('error');
    expect(errorCall.result?.isError).toBe(true);
  });

  it('should handle empty messages array in tagMessagesWithToolUseID', () => {
    const tagged = tagMessagesWithToolUseID([], 'tool-1');
    expect(tagged).toEqual([]);
  });

  it('should handle ToolDefinition handler returning result', async () => {
    const tool: ToolDefinition = {
      name: 'greet',
      description: 'Greets user',
      inputSchema: { type: 'object', properties: { name: { type: 'string' } } },
      handler: async (input) => ({
        content: [{ type: 'text', text: `Hello, ${input.name}` }],
      }),
    };
    const result = await tool.handler({ name: 'World' });
    expect(result.content[0].text).toBe('Hello, World');
  });
});
