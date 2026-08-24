import { describe, it, expect, vi } from 'vitest';
import type { HookResult, PaginationState, SearchState, TerminalSize, MemoryUsage, DiffType, DiffData, TaskItem, ScheduledTask, TypeaheadOption, VirtualScrollItem } from '../hooks_v2/types.js';
import { DOUBLE_PRESS_TIMEOUT_MS } from '../hooks_v2/useDoublePress.js';

describe('hooks_v2', () => {
  it('should export type definitions', () => {
    const hookResult: HookResult<string> = { data: 'test', loading: false, error: null };
    expect(hookResult.data).toBe('test');
    expect(hookResult.loading).toBe(false);
    expect(hookResult.error).toBeNull();
  });

  it('should support PaginationState type', () => {
    const pagination: PaginationState = { page: 1, pageSize: 10, total: 100, hasMore: true };
    expect(pagination.page).toBe(1);
    expect(pagination.hasMore).toBe(true);
  });

  it('should support SearchState type', () => {
    const search: SearchState = { query: 'test', results: ['a', 'b'], selectedIndex: 0, isSearching: false };
    expect(search.query).toBe('test');
    expect(search.results).toHaveLength(2);
  });

  it('should support TerminalSize type', () => {
    const size: TerminalSize = { columns: 80, rows: 24 };
    expect(size.columns).toBe(80);
    expect(size.rows).toBe(24);
  });

  it('should support MemoryUsage type', () => {
    const mem: MemoryUsage = { rss: 1000, heapUsed: 500, heapTotal: 800, external: 200 };
    expect(mem.rss).toBe(1000);
    expect(mem.heapUsed).toBe(500);
  });

  it('should support DiffType union', () => {
    const types: DiffType[] = ['added', 'removed', 'modified', 'unchanged'];
    expect(types).toContain('added');
    expect(types).toContain('removed');
    expect(types).toContain('modified');
    expect(types).toContain('unchanged');
  });

  it('should support DiffData interface', () => {
    const diff: DiffData = { type: 'added', line: 1, content: '+ hello', oldLine: undefined };
    expect(diff.type).toBe('added');
    expect(diff.line).toBe(1);
  });

  it('should support TaskItem interface', () => {
    const task: TaskItem = { id: '1', content: 'Do something', status: 'pending', priority: 1 };
    expect(task.id).toBe('1');
    expect(task.status).toBe('pending');
  });

  it('should support ScheduledTask interface', () => {
    const scheduled: ScheduledTask = { id: 'cron-1', cronExpression: '0 * * * *', command: 'echo hi', enabled: true };
    expect(scheduled.cronExpression).toBe('0 * * * *');
    expect(scheduled.enabled).toBe(true);
  });

  it('should support TypeaheadOption interface', () => {
    const option: TypeaheadOption = { label: 'Option 1', value: 'opt1', description: 'A test option', category: 'test' };
    expect(option.label).toBe('Option 1');
    expect(option.value).toBe('opt1');
  });

  it('should support VirtualScrollItem interface', () => {
    const item: VirtualScrollItem = { id: 'item-1', height: 40, data: { text: 'content' } };
    expect(item.id).toBe('item-1');
    expect(item.height).toBe(40);
  });

  it('should export DOUBLE_PRESS_TIMEOUT_MS constant', () => {
    expect(DOUBLE_PRESS_TIMEOUT_MS).toBe(800);
  });

  it('should handle HookResult with null data', () => {
    const result: HookResult<number> = { data: null, loading: true, error: new Error('loading') };
    expect(result.data).toBeNull();
    expect(result.loading).toBe(true);
    expect(result.error).toBeInstanceOf(Error);
  });

  it('should handle TaskItem with all status variants', () => {
    const statuses: TaskItem['status'][] = ['pending', 'active', 'completed', 'error'];
    const tasks: TaskItem[] = statuses.map((s, i) => ({ id: String(i), content: `Task ${i}`, status: s, priority: i }));
    expect(tasks).toHaveLength(4);
    expect(tasks.map((t) => t.status)).toEqual(statuses);
  });

  it('should handle edge case of empty search results', () => {
    const emptySearch: SearchState = { query: '', results: [], selectedIndex: -1, isSearching: false };
    expect(emptySearch.results).toHaveLength(0);
  });

  it('should handle ScheduledTask with optional nextRun', () => {
    const task: ScheduledTask = { id: '1', cronExpression: '0 0 * * *', command: 'backup', enabled: true, nextRun: new Date() };
    expect(task.nextRun).toBeInstanceOf(Date);
  });

  it('should handle HookResult with error state', () => {
    const result: HookResult<string> = { data: null, loading: false, error: new Error('Failed to load') };
    expect(result.error?.message).toBe('Failed to load');
    expect(result.loading).toBe(false);
  });

  it('should handle pagination with no more pages', () => {
    const pagination: PaginationState = { page: 5, pageSize: 10, total: 50, hasMore: false };
    expect(pagination.hasMore).toBe(false);
    expect(pagination.total).toBe(50);
  });

  it('should handle search with large result set', () => {
    const results = Array.from({ length: 100 }, (_, i) => `result-${i}`);
    const search: SearchState = { query: 'test', results, selectedIndex: 50, isSearching: false };
    expect(search.results).toHaveLength(100);
    expect(search.selectedIndex).toBe(50);
  });
});
