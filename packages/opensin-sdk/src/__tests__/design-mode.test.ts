import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DesignMode,
  activateDesignMode,
  deactivateDesignMode,
  isDesignModeActive,
} from '../design-mode/browser.js';
import { Annotator } from '../design-mode/annotator.js';
import { Selector } from '../design-mode/selector.js';
import { FeedbackCollector, sendFeedbackToAgent } from '../design-mode/feedback.js';
import type { DesignModeConfig, UIElement, Annotation, FeedbackPayload } from '../design-mode/types.js';

vi.stubGlobal('document', {
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
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  elementsFromPoint: vi.fn(() => []),
});

vi.stubGlobal('window', {
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
});

describe('design-mode', () => {
  describe('DesignMode class', () => {
    it('should create DesignMode instance with default config', () => {
      const dm = new DesignMode();
      expect(dm).toBeDefined();
      const state = dm.getState();
      expect(state.isActive).toBe(false);
      expect(state.mode).toBe('select');
    });

    it('should create DesignMode with custom config', () => {
      const config: Partial<DesignModeConfig> = { annotationColor: '#ff0000', annotationOpacity: 0.5 };
      const dm = new DesignMode(config);
      expect(dm).toBeDefined();
    });

    it('should expose annotator instance', () => {
      const dm = new DesignMode();
      expect(dm.annotatorInstance).toBeInstanceOf(Annotator);
    });

    it('should expose selector instance', () => {
      const dm = new DesignMode();
      expect(dm.selectorInstance).toBeInstanceOf(Selector);
    });

    it('should expose feedback collector instance', () => {
      const dm = new DesignMode();
      expect(dm.feedbackInstance).toBeInstanceOf(FeedbackCollector);
    });

    it('should activate design mode', () => {
      const dm = new DesignMode();
      dm.activate();
      const state = dm.getState();
      expect(state.isActive).toBe(true);
    });

    it('should deactivate design mode', () => {
      const dm = new DesignMode();
      dm.activate();
      dm.deactivate();
      const state = dm.getState();
      expect(state.isActive).toBe(false);
    });

    it('should not double-activate', () => {
      const dm = new DesignMode();
      dm.activate();
      dm.activate();
      const state = dm.getState();
      expect(state.isActive).toBe(true);
    });

    it('should not double-deactivate', () => {
      const dm = new DesignMode();
      dm.deactivate();
      const state = dm.getState();
      expect(state.isActive).toBe(false);
    });

    it('should change mode', () => {
      const dm = new DesignMode();
      dm.setMode('annotate');
      const state = dm.getState();
      expect(state.mode).toBe('annotate');
    });

    it('should capture screenshot', () => {
      const dm = new DesignMode();
      const screenshot = dm.captureScreenshot();
      expect(screenshot).toBeDefined();
      expect(screenshot.viewportWidth).toBeDefined();
      expect(screenshot.viewportHeight).toBeDefined();
    });

    it('should register and unregister event listeners', () => {
      const dm = new DesignMode();
      const listener = vi.fn();
      dm.on('mode:activated', listener);
      dm.activate();
      expect(listener).toHaveBeenCalled();
      dm.off('mode:activated', listener);
    });
  });

  describe('Annotator', () => {
    it('should create Annotator instance', () => {
      const annotator = new Annotator();
      expect(annotator).toBeDefined();
    });

    it('should get empty annotations initially', () => {
      const annotator = new Annotator();
      expect(annotator.getAnnotations()).toEqual([]);
    });

    it('should get empty unresolved annotations initially', () => {
      const annotator = new Annotator();
      expect(annotator.getUnresolvedAnnotations()).toEqual([]);
    });

    it('should clear all annotations', () => {
      const annotator = new Annotator();
      annotator.clearAll();
      expect(annotator.getAnnotations()).toEqual([]);
    });

    it('should update annotation style', () => {
      const annotator = new Annotator();
      annotator.updateStyle({ color: '#ff0000' });
      expect(annotator).toBeDefined();
    });

    it('should resolve non-existent annotation returning false', () => {
      const annotator = new Annotator();
      const result = annotator.resolveAnnotation('nonexistent');
      expect(result).toBe(false);
    });

    it('should delete non-existent annotation returning false', () => {
      const annotator = new Annotator();
      const result = annotator.deleteAnnotation('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('Selector', () => {
    it('should create Selector instance', () => {
      const selector = new Selector();
      expect(selector).toBeDefined();
    });

    it('should get empty selections initially', () => {
      const selector = new Selector();
      expect(selector.getSelections()).toEqual([]);
    });

    it('should clear selections', () => {
      const selector = new Selector();
      selector.clearSelections();
      expect(selector.getSelections()).toEqual([]);
    });

    it('should capture screenshot data', () => {
      const selector = new Selector();
      const screenshot = selector.captureScreenshot();
      expect(screenshot.imageData).toBe('');
      expect(screenshot.devicePixelRatio).toBeDefined();
      expect(screenshot.timestamp).toBeDefined();
    });

    it('should set on select callback', () => {
      const selector = new Selector();
      const callback = vi.fn();
      selector.setOnSelect(callback);
      expect(selector).toBeDefined();
    });

    it('should set on selection area callback', () => {
      const selector = new Selector();
      const callback = vi.fn();
      selector.setOnSelectionArea(callback);
      expect(selector).toBeDefined();
    });
  });

  describe('FeedbackCollector', () => {
    it('should create FeedbackCollector instance', () => {
      const fc = new FeedbackCollector();
      expect(fc).toBeDefined();
    });

    it('should start with empty feedback queue', () => {
      const fc = new FeedbackCollector();
      expect(fc.getFeedbackQueue()).toEqual([]);
    });

    it('should submit text feedback', () => {
      const fc = new FeedbackCollector();
      const feedback = fc.submitTextFeedback('ann-1', 'Make it bigger', undefined, 'high');
      expect(feedback.id).toBeDefined();
      expect(feedback.type).toBe('text');
      expect(feedback.content).toBe('Make it bigger');
      expect(feedback.priority).toBe('high');
    });

    it('should submit screenshot feedback', () => {
      const fc = new FeedbackCollector();
      const feedback = fc.submitScreenshotFeedback('ann-1', 'data:image/png;base64,...', { x: 10, y: 20 });
      expect(feedback.type).toBe('screenshot');
      expect(feedback.screenshotData).toBe('data:image/png;base64,...');
      expect(feedback.coordinates).toEqual({ x: 10, y: 20 });
    });

    it('should submit drawing feedback', () => {
      const fc = new FeedbackCollector();
      const feedback = fc.submitDrawingFeedback('ann-1', 'Draw circle', { x: 50, y: 50 }, 'low');
      expect(feedback.type).toBe('drawing');
      expect(feedback.coordinates).toEqual({ x: 50, y: 50 });
    });

    it('should submit voice feedback', () => {
      const fc = new FeedbackCollector();
      const feedback = fc.submitVoiceFeedback('ann-1', 'Move this left', undefined);
      expect(feedback.type).toBe('voice');
      expect(feedback.content).toBe('Move this left');
    });

    it('should send feedback to agent', () => {
      const fc = new FeedbackCollector();
      const fb = fc.submitTextFeedback('ann-1', 'test');
      const result = fc.sendToAgent(fb.id, 'agent-1');
      expect(result).toBe(true);
    });

    it('should return false when sending non-existent feedback to agent', () => {
      const fc = new FeedbackCollector();
      const result = fc.sendToAgent('nonexistent', 'agent-1');
      expect(result).toBe(false);
    });

    it('should resolve feedback', () => {
      const fc = new FeedbackCollector();
      const fb = fc.submitTextFeedback('ann-1', 'test');
      const result = fc.resolveFeedback(fb.id);
      expect(result).toBe(true);
      expect(fc.getFeedbackQueue()).not.toContain(fb);
    });

    it('should return false when resolving non-existent feedback', () => {
      const fc = new FeedbackCollector();
      const result = fc.resolveFeedback('nonexistent');
      expect(result).toBe(false);
    });

    it('should get pending feedback', () => {
      const fc = new FeedbackCollector();
      fc.submitTextFeedback('ann-1', 'test 1');
      fc.submitTextFeedback('ann-2', 'test 2');
      const pending = fc.getPendingFeedback();
      expect(pending.length).toBe(2);
    });

    it('should get feedback for specific agent', () => {
      const fc = new FeedbackCollector();
      const fb1 = fc.submitTextFeedback('ann-1', 'test 1');
      const fb2 = fc.submitTextFeedback('ann-2', 'test 2');
      fc.sendToAgent(fb1.id, 'agent-1');
      fc.sendToAgent(fb2.id, 'agent-2');
      const agent1Feedback = fc.getFeedbackForAgent('agent-1');
      expect(agent1Feedback.length).toBe(1);
      expect(agent1Feedback[0].id).toBe(fb1.id);
    });

    it('should clear feedback queue', () => {
      const fc = new FeedbackCollector();
      fc.submitTextFeedback('ann-1', 'test');
      fc.clearQueue();
      expect(fc.getFeedbackQueue()).toEqual([]);
    });

    it('should export feedback for agent', () => {
      const fc = new FeedbackCollector();
      fc.submitTextFeedback('ann-1', 'test', { tagName: 'div', cssSelector: 'div', xpath: '/div', textContent: 'test' } as UIElement);
      const exported = fc.exportFeedbackForAgent();
      expect(exported.length).toBe(1);
      expect(exported[0].type).toBe('text');
    });

    it('should set on submit callback', () => {
      const fc = new FeedbackCollector();
      const callback = vi.fn();
      fc.setOnSubmit(callback);
      fc.submitTextFeedback('ann-1', 'test');
      expect(callback).toHaveBeenCalled();
    });

    it('should set on resolve callback', () => {
      const fc = new FeedbackCollector();
      const callback = vi.fn();
      fc.setOnResolve(callback);
      const fb = fc.submitTextFeedback('ann-1', 'test');
      fc.resolveFeedback(fb.id);
      expect(callback).toHaveBeenCalledWith(fb.id);
    });
  });

  describe('sendFeedbackToAgent', () => {
    it('should return false on network error', async () => {
      const feedback: FeedbackPayload = {
        id: 'fb-1',
        annotationId: 'ann-1',
        type: 'text',
        content: 'test',
        timestamp: Date.now(),
        priority: 'medium',
      };
      const result = await sendFeedbackToAgent(feedback, 'http://invalid-endpoint');
      expect(result).toBe(false);
    });
  });

  describe('helper functions', () => {
    it('should activate design mode via helper', () => {
      const dm = activateDesignMode();
      expect(isDesignModeActive(dm)).toBe(true);
    });

    it('should deactivate design mode via helper', () => {
      const dm = activateDesignMode();
      deactivateDesignMode(dm);
      expect(isDesignModeActive(dm)).toBe(false);
    });
  });
});
