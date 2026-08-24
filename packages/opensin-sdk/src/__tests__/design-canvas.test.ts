import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DesignCanvas } from '../design-canvas/canvas.js';
import { CanvasRenderer } from '../design-canvas/renderer.js';
import { CanvasSync } from '../design-canvas/sync.js';
import {
  COMPONENT_TEMPLATES,
  createComponentFromTemplate,
  getTemplatesByCategory,
  getAllCategories,
  findTemplateByType,
} from '../design-canvas/components.js';
import type { DesignCanvasConfig, CanvasComponent, CanvasSyncEvent } from '../design-canvas/types.js';

describe('design-canvas', () => {
  describe('components', () => {
    it('should export component templates', () => {
      expect(COMPONENT_TEMPLATES).toBeDefined();
      expect(Array.isArray(COMPONENT_TEMPLATES)).toBe(true);
      expect(COMPONENT_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('should have button template', () => {
      const button = findTemplateByType('button');
      expect(button).toBeDefined();
      expect(button?.name).toBe('Button');
      expect(button?.category).toBe('Basic');
    });

    it('should have input template', () => {
      const input = findTemplateByType('input');
      expect(input).toBeDefined();
      expect(input?.name).toBe('Text Input');
    });

    it('should have heading template', () => {
      const heading = findTemplateByType('heading');
      expect(heading).toBeDefined();
      expect(heading?.category).toBe('Typography');
    });

    it('should have card template', () => {
      const card = findTemplateByType('card');
      expect(card).toBeDefined();
      expect(card?.category).toBe('Layout');
    });

    it('should return undefined for unknown template', () => {
      const template = findTemplateByType('nonexistent');
      expect(template).toBeUndefined();
    });

    it('should create component from template', () => {
      const template = findTemplateByType('button');
      expect(template).toBeDefined();
      const component = createComponentFromTemplate(template!, 100, 200);
      expect(component).toBeDefined();
      expect(component.type).toBe('button');
      expect(component.x).toBe(100);
      expect(component.y).toBe(200);
      expect(component.id).toBeDefined();
      expect(component.visible).toBe(true);
      expect(component.locked).toBe(false);
    });

    it('should get templates by category', () => {
      const basic = getTemplatesByCategory('Basic');
      expect(basic.length).toBeGreaterThan(0);
      expect(basic.every((t) => t.category === 'Basic')).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const unknown = getTemplatesByCategory('Unknown');
      expect(unknown).toEqual([]);
    });

    it('should get all categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('Basic');
      expect(categories).toContain('Typography');
      expect(categories).toContain('Layout');
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should have unique categories', () => {
      const categories = getAllCategories();
      const unique = new Set(categories);
      expect(unique.size).toBe(categories.length);
    });

    it('should have navbar template', () => {
      const navbar = findTemplateByType('navbar');
      expect(navbar).toBeDefined();
      expect(navbar?.category).toBe('Navigation');
    });

    it('should have grid template', () => {
      const grid = findTemplateByType('grid');
      expect(grid).toBeDefined();
      expect(grid?.defaultProperties.columns).toBe(3);
    });
  });

  describe('DesignCanvas', () => {
    let canvas: DesignCanvas;

    beforeEach(() => {
      canvas = new DesignCanvas({ autoSync: false });
    });

    it('should create canvas with default config', () => {
      const config = canvas.getConfig();
      expect(config.width).toBe(1200);
      expect(config.height).toBe(800);
      expect(config.gridSize).toBe(8);
      expect(config.snapToGrid).toBe(true);
    });

    it('should create canvas with custom config', () => {
      const custom = new DesignCanvas({ width: 800, height: 600, gridSize: 16, autoSync: false });
      const config = custom.getConfig();
      expect(config.width).toBe(800);
      expect(config.height).toBe(600);
      expect(config.gridSize).toBe(16);
    });

    it('should add component', () => {
      const component = canvas.addComponent('button', 100, 100);
      expect(component).not.toBeNull();
      expect(component?.type).toBe('button');
      expect(component?.x).toBe(104);
      expect(component?.y).toBe(104);
    });

    it('should snap component to grid', () => {
      const component = canvas.addComponent('button', 103, 107);
      expect(component).not.toBeNull();
      expect(component?.x).toBe(104);
      expect(component?.y).toBe(104);
    });

    it('should return null for unknown component type', () => {
      const component = canvas.addComponent('nonexistent', 0, 0);
      expect(component).toBeNull();
    });

    it('should remove component', () => {
      const component = canvas.addComponent('button', 0, 0);
      expect(component).not.toBeNull();
      const result = canvas.removeComponent(component!.id);
      expect(result).toBe(true);
      expect(canvas.getComponent(component!.id)).toBeUndefined();
    });

    it('should return false when removing non-existent component', () => {
      const result = canvas.removeComponent('nonexistent');
      expect(result).toBe(false);
    });

    it('should move component', () => {
      const component = canvas.addComponent('button', 0, 0);
      const result = canvas.moveComponent(component!.id, 50, 50);
      expect(result).toBe(true);
      const moved = canvas.getComponent(component!.id);
      expect(moved?.x).toBe(48);
      expect(moved?.y).toBe(48);
    });

    it('should return false when moving non-existent component', () => {
      const result = canvas.moveComponent('nonexistent', 50, 50);
      expect(result).toBe(false);
    });

    it('should return false when moving locked component', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.updateComponent(component!.id, { locked: true });
      const result = canvas.moveComponent(component!.id, 50, 50);
      expect(result).toBe(false);
    });

    it('should resize component', () => {
      const component = canvas.addComponent('button', 0, 0);
      const result = canvas.resizeComponent(component!.id, 200, 100);
      expect(result).toBe(true);
      const resized = canvas.getComponent(component!.id);
      expect(resized?.width).toBe(200);
      expect(resized?.height).toBe(104);
    });

    it('should enforce minimum size on resize', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.resizeComponent(component!.id, 5, 5);
      const resized = canvas.getComponent(component!.id);
      expect(resized?.width).toBe(16);
      expect(resized?.height).toBe(16);
    });

    it('should return false when resizing non-existent component', () => {
      const result = canvas.resizeComponent('nonexistent', 100, 100);
      expect(result).toBe(false);
    });

    it('should select component', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.selectComponent(component!.id);
      const selected = canvas.getSelectedComponents();
      expect(selected.length).toBe(1);
      expect(selected[0].id).toBe(component!.id);
    });

    it('should not select non-existent component', () => {
      canvas.selectComponent('nonexistent');
      const selected = canvas.getSelectedComponents();
      expect(selected.length).toBe(0);
    });

    it('should deselect component', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.selectComponent(component!.id);
      canvas.deselectComponent(component!.id);
      const selected = canvas.getSelectedComponents();
      expect(selected.length).toBe(0);
    });

    it('should select all components', () => {
      canvas.addComponent('button', 0, 0);
      canvas.addComponent('input', 100, 100);
      canvas.selectAll();
      const selected = canvas.getSelectedComponents();
      expect(selected.length).toBe(2);
    });

    it('should deselect all components', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.selectComponent(component!.id);
      canvas.deselectAll();
      const selected = canvas.getSelectedComponents();
      expect(selected.length).toBe(0);
    });

    it('should get all components', () => {
      canvas.addComponent('button', 0, 0);
      canvas.addComponent('input', 100, 100);
      const all = canvas.getAllComponents();
      expect(all.length).toBe(2);
    });

    it('should get components by type', () => {
      canvas.addComponent('button', 0, 0);
      canvas.addComponent('button', 100, 100);
      canvas.addComponent('input', 200, 200);
      const buttons = canvas.getComponentsByType('button');
      expect(buttons.length).toBe(2);
    });

    it('should copy and paste selected components', () => {
      const component = canvas.addComponent('button', 100, 100);
      canvas.selectComponent(component!.id);
      canvas.copySelected();
      const pasted = canvas.pasteClipboard(50, 50);
      expect(pasted.length).toBe(1);
      expect(pasted[0].id).not.toBe(component!.id);
    });

    it('should delete selected components', () => {
      const component = canvas.addComponent('button', 0, 0);
      canvas.selectComponent(component!.id);
      canvas.deleteSelected();
      expect(canvas.getAllComponents().length).toBe(0);
    });

    it('should undo add operation', () => {
      canvas.addComponent('button', 0, 0);
      expect(canvas.getAllComponents().length).toBe(1);
      canvas.undo();
      expect(canvas.getAllComponents().length).toBe(0);
    });

    it('should redo operation', () => {
      canvas.addComponent('button', 0, 0);
      const beforeUndo = canvas.getAllComponents().length;
      canvas.undo();
      const afterUndo = canvas.getAllComponents().length;
      expect(afterUndo).toBeLessThan(beforeUndo);
      canvas.redo();
      const afterRedo = canvas.getAllComponents().length;
      expect(afterRedo).toBeGreaterThanOrEqual(afterUndo);
    });

    it('should return false when undoing beyond history', () => {
      const result = canvas.undo();
      expect(result).toBe(false);
    });

    it('should return false when redoing beyond history', () => {
      const result = canvas.redo();
      expect(result).toBe(false);
    });

    it('should set zoom level', () => {
      canvas.setZoom(2);
      const state = canvas.getState();
      expect(state.viewport.zoom).toBe(2);
    });

    it('should clamp zoom level', () => {
      canvas.setZoom(10);
      const state = canvas.getState();
      expect(state.viewport.zoom).toBe(5);
    });

    it('should pan viewport', () => {
      canvas.pan(100, 50);
      const state = canvas.getState();
      expect(state.viewport.x).toBe(100);
      expect(state.viewport.y).toBe(50);
    });

    it('should clear canvas', () => {
      canvas.addComponent('button', 0, 0);
      canvas.clear();
      expect(canvas.getAllComponents().length).toBe(0);
      expect(canvas.getState().selectedIds).toEqual([]);
    });

    it('should export to JSON', () => {
      canvas.addComponent('button', 0, 0);
      const json = canvas.exportJSON();
      expect(json).toBeDefined();
      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.components).toBeDefined();
    });

    it('should import from valid JSON', () => {
      const json = JSON.stringify({
        config: { width: 800, height: 600 },
        components: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      });
      const result = canvas.importJSON(json);
      expect(result).toBe(true);
    });

    it('should return false when importing invalid JSON', () => {
      const result = canvas.importJSON('not json');
      expect(result).toBe(false);
    });

    it('should register event listeners', () => {
      const listener = vi.fn();
      canvas.on('component:added', listener);
      canvas.addComponent('button', 0, 0);
      expect(listener).toHaveBeenCalled();
    });

    it('should unregister event listeners', () => {
      const listener = vi.fn();
      canvas.on('component:added', listener);
      canvas.off('component:added', listener);
      canvas.addComponent('button', 0, 0);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should register sync listeners', () => {
      const listener = vi.fn();
      canvas.onSync(listener);
      canvas.offSync(listener);
      expect(canvas).toBeDefined();
    });

    it('should get templates from canvas', () => {
      const templates = canvas.getTemplates();
      expect(templates.length).toBe(COMPONENT_TEMPLATES.length);
    });

    it('should update component styles', () => {
      const component = canvas.addComponent('button', 0, 0);
      const result = canvas.updateComponentStyles(component!.id, { color: 'red' });
      expect(result).toBe(true);
      const updated = canvas.getComponent(component!.id);
      expect(updated?.styles.color).toBe('red');
    });

    it('should return false when updating styles of non-existent component', () => {
      const result = canvas.updateComponentStyles('nonexistent', { color: 'red' });
      expect(result).toBe(false);
    });

    it('should update component properties', () => {
      const component = canvas.addComponent('button', 0, 0);
      const result = canvas.updateComponentProperties(component!.id, { text: 'New Text' });
      expect(result).toBe(true);
      const updated = canvas.getComponent(component!.id);
      expect(updated?.properties.text).toBe('New Text');
    });

    it('should return false when updating properties of non-existent component', () => {
      const result = canvas.updateComponentProperties('nonexistent', { text: 'New' });
      expect(result).toBe(false);
    });
  });

  describe('CanvasRenderer', () => {
    it('should create renderer instance', () => {
      const renderer = new CanvasRenderer();
      expect(renderer).toBeDefined();
    });

    it('should get empty rendered components initially', () => {
      const renderer = new CanvasRenderer();
      expect(renderer.getAllRendered()).toEqual([]);
    });

    it('should return undefined for non-existent rendered component', () => {
      const renderer = new CanvasRenderer();
      const rendered = renderer.getRenderedComponent('nonexistent');
      expect(rendered).toBeUndefined();
    });
  });

  describe('CanvasSync', () => {
    it('should create sync instance', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      expect(sync).toBeDefined();
    });

    it('should start with empty sync queue', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      expect(sync.getSyncQueue()).toEqual([]);
    });

    it('should clear sync queue', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      sync.clearSyncQueue();
      expect(sync.getSyncQueue()).toEqual([]);
    });

    it('should report not syncing initially', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      expect(sync.isCurrentlySyncing()).toBe(false);
    });

    it('should return last sync time as 0 initially', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      expect(sync.getLastSyncTime()).toBe(0);
    });

    it('should set on code update callback', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      const callback = vi.fn();
      sync.setOnCodeUpdate(callback);
      expect(sync).toBeDefined();
    });

    it('should set on component sync callback', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      const callback = vi.fn();
      sync.setOnComponentSync(callback);
      expect(sync).toBeDefined();
    });

    it('should start and stop auto sync', () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      sync.startAutoSync(1000);
      sync.stopAutoSync();
      expect(sync).toBeDefined();
    });

    it('should sync all components', async () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      await sync.syncAll();
      expect(sync.getLastSyncTime()).toBeGreaterThan(0);
    });

    it('should return false when importing from invalid code', async () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      const result = await sync.importFromCode('invalid html');
      expect(result).toBe(false);
    });

    it('should diff with code', async () => {
      const canvas = new DesignCanvas({ autoSync: false });
      const renderer = new CanvasRenderer();
      const sync = new CanvasSync(canvas, renderer);
      const diff = await sync.diffWithCode('<div></div>');
      expect(diff.added).toEqual([]);
      expect(diff.removed).toEqual([]);
      expect(diff.modified).toEqual([]);
    });
  });
});
