import { describe, it, expect, beforeEach } from 'vitest';
import {
  designSystemRegistry,
  getDesignSystem,
  listDesignSystems,
  getComponentSpec,
} from '../design-systems/registry.js';
import { loadDesignSystem, preloadAllDesignSystems, clearDesignSystemCache, mergeTheme, getThemeVariables } from '../design-systems/loader.js';
import { generateComponent, generateAllComponents } from '../design-systems/generator.js';
import type { DesignSystemConfig, ThemeConfig, ComponentSpec, ThemeCustomization } from '../design-systems/types.js';

describe('design-systems', () => {
  describe('registry', () => {
    it('should have design system registry defined', () => {
      expect(designSystemRegistry).toBeDefined();
      expect(typeof designSystemRegistry).toBe('object');
    });

    it('should contain shadcn design system', () => {
      const shadcn = getDesignSystem('shadcn');
      expect(shadcn).toBeDefined();
      expect(shadcn?.name).toBe('shadcn');
      expect(shadcn?.version).toBe('1.0.0');
    });

    it('should contain mui design system', () => {
      const mui = getDesignSystem('mui');
      expect(mui).toBeDefined();
      expect(mui?.name).toBe('mui');
    });

    it('should contain chakra design system', () => {
      const chakra = getDesignSystem('chakra');
      expect(chakra).toBeDefined();
      expect(chakra?.name).toBe('chakra');
    });

    it('should contain tailwind design system', () => {
      const tailwind = getDesignSystem('tailwind');
      expect(tailwind).toBeDefined();
      expect(tailwind?.name).toBe('tailwind');
    });

    it('should return undefined for unknown design system', () => {
      const unknown = getDesignSystem('unknown');
      expect(unknown).toBeUndefined();
    });

    it('should list all design systems', () => {
      const systems = listDesignSystems();
      expect(systems).toContain('shadcn');
      expect(systems).toContain('mui');
      expect(systems).toContain('chakra');
      expect(systems).toContain('tailwind');
      expect(systems.length).toBe(4);
    });

    it('should get component spec by name', () => {
      const button = getComponentSpec('shadcn', 'Button');
      expect(button).toBeDefined();
      expect(button?.name).toBe('Button');
      expect(button?.category).toBe('form');
    });

    it('should return undefined for non-existent component', () => {
      const spec = getComponentSpec('shadcn', 'NonExistent');
      expect(spec).toBeUndefined();
    });

    it('should return undefined for non-existent design system', () => {
      const spec = getComponentSpec('unknown', 'Button');
      expect(spec).toBeUndefined();
    });

    it('should have components in each design system', () => {
      for (const name of listDesignSystems()) {
        const ds = getDesignSystem(name);
        expect(ds?.components.length).toBeGreaterThan(0);
      }
    });

    it('should have theme configuration in each design system', () => {
      for (const name of listDesignSystems()) {
        const ds = getDesignSystem(name);
        expect(ds?.theme).toBeDefined();
        expect(ds?.theme.colors).toBeDefined();
        expect(ds?.theme.spacing).toBeDefined();
      }
    });

    it('should have dependencies in each design system', () => {
      const shadcn = getDesignSystem('shadcn');
      expect(shadcn?.dependencies).toContain('@radix-ui/react-dialog');
      const mui = getDesignSystem('mui');
      expect(mui?.dependencies).toContain('@mui/material');
    });

    it('should find component case-insensitively', () => {
      const buttonLower = getComponentSpec('shadcn', 'button');
      const buttonUpper = getComponentSpec('shadcn', 'BUTTON');
      expect(buttonLower).toBeDefined();
      expect(buttonUpper).toBeDefined();
      expect(buttonLower?.name).toBe(buttonUpper?.name);
    });
  });

  describe('loader', () => {
    beforeEach(() => {
      clearDesignSystemCache();
    });

    it('should load design system by name', async () => {
      const ds = await loadDesignSystem('shadcn');
      expect(ds).not.toBeNull();
      expect(ds?.name).toBe('shadcn');
    });

    it('should return null for unknown design system', async () => {
      const ds = await loadDesignSystem('unknown');
      expect(ds).toBeNull();
    });

    it('should cache loaded design systems', async () => {
      const first = await loadDesignSystem('shadcn');
      const second = await loadDesignSystem('shadcn');
      expect(first).toBe(second);
    });

    it('should preload all design systems', () => {
      preloadAllDesignSystems();
      const systems = listDesignSystems();
      for (const name of systems) {
        const ds = getDesignSystem(name);
        expect(ds).toBeDefined();
      }
    });

    it('should clear design system cache', () => {
      preloadAllDesignSystems();
      clearDesignSystemCache();
      const systems = listDesignSystems();
      expect(systems.length).toBe(4);
    });

    it('should merge theme with customization', () => {
      const shadcn = getDesignSystem('shadcn') as DesignSystemConfig;
      const customization: ThemeCustomization = {
        colors: { primary: '#ff0000' },
      };
      const merged = mergeTheme(shadcn.theme, customization);
      expect(merged.colors.primary).toBe('#ff0000');
      expect(merged.colors.background).toBe(shadcn.theme.colors.background);
    });

    it('should handle empty customization in mergeTheme', () => {
      const shadcn = getDesignSystem('shadcn') as DesignSystemConfig;
      const merged = mergeTheme(shadcn.theme, {});
      expect(merged.colors.primary).toBe(shadcn.theme.colors.primary);
    });

    it('should generate theme variables', () => {
      const shadcn = getDesignSystem('shadcn') as DesignSystemConfig;
      const vars = getThemeVariables(shadcn.theme);
      expect(vars['--color-primary']).toBe(shadcn.theme.colors.primary);
      expect(vars['--color-background']).toBe(shadcn.theme.colors.background);
    });

    it('should include spacing variables in theme variables', () => {
      const shadcn = getDesignSystem('shadcn') as DesignSystemConfig;
      const vars = getThemeVariables(shadcn.theme);
      expect(vars['--spacing-4']).toBe(shadcn.theme.spacing['4']);
    });

    it('should include border radius variables in theme variables', () => {
      const shadcn = getDesignSystem('shadcn') as DesignSystemConfig;
      const vars = getThemeVariables(shadcn.theme);
      expect(vars['--radius-md']).toBe(shadcn.theme.borderRadius.md);
    });
  });

  describe('generator', () => {
    it('should generate component for shadcn', async () => {
      const component = await generateComponent('shadcn', 'Button');
      expect(component).not.toBeNull();
      expect(component?.componentName).toBe('Button');
      expect(component?.language).toBe('tsx');
      expect(component?.theme).toBe('shadcn');
    });

    it('should generate component for mui', async () => {
      const component = await generateComponent('mui', 'Button');
      expect(component).not.toBeNull();
      expect(component?.componentName).toBe('Button');
      expect(component?.theme).toBe('mui');
    });

    it('should generate component for chakra', async () => {
      const component = await generateComponent('chakra', 'Button');
      expect(component).not.toBeNull();
      expect(component?.theme).toBe('chakra');
    });

    it('should generate component for tailwind', async () => {
      const component = await generateComponent('tailwind', 'Button');
      expect(component).not.toBeNull();
      expect(component?.theme).toBe('tailwind');
    });

    it('should return null for unknown design system', async () => {
      const component = await generateComponent('unknown', 'Button');
      expect(component).toBeNull();
    });

    it('should return null for unknown component', async () => {
      const component = await generateComponent('shadcn', 'NonExistent');
      expect(component).toBeNull();
    });

    it('should generate all components for a design system', async () => {
      const components = await generateAllComponents('shadcn');
      expect(components.length).toBeGreaterThan(0);
      for (const comp of components) {
        expect(comp.componentName).toBeDefined();
        expect(comp.code).toBeDefined();
      }
    });

    it('should return empty array for unknown design system in generateAllComponents', async () => {
      const components = await generateAllComponents('unknown');
      expect(components).toEqual([]);
    });

    it('should generate component with customization', async () => {
      const customization: ThemeCustomization = { colors: { primary: '#ff0000' } };
      const component = await generateComponent('shadcn', 'Button', customization);
      expect(component).not.toBeNull();
      expect(component?.code).toBeDefined();
    });

    it('should include dependencies in generated component', async () => {
      const component = await generateComponent('shadcn', 'Button');
      expect(component?.dependencies).toContain('@radix-ui/react-slot');
    });
  });
});
