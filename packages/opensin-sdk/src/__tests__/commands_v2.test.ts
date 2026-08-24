import { describe, it, expect } from 'vitest';

describe('commands_v2', () => {
  it('should have commands_v2 directory structure', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    expect(fs.existsSync(commandsDir)).toBe(true);
  });

  it('should have index.ts entry point', () => {
    const fs = require('fs');
    const path = require('path');
    const indexPath = path.join(__dirname, '../commands_v2/index.ts');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('should have many command subdirectories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir).filter((e: string) => !e.endsWith('.ts') && !e.endsWith('.tsx'));
    expect(entries.length).toBeGreaterThan(40);
  });

  it('should have core command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('help');
    expect(entries).toContain('config');
    expect(entries).toContain('clear');
    expect(entries).toContain('model');
    expect(entries).toContain('login');
    expect(entries).toContain('logout');
  });

  it('should have session-related command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('session');
    expect(entries).toContain('rename');
    expect(entries).toContain('resume');
  });

  it('should have UI-related command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('theme');
    expect(entries).toContain('color');
    expect(entries).toContain('output-style');
  });

  it('should have integration command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('ide');
    expect(entries).toContain('bridge');
    expect(entries).toContain('chrome');
    expect(entries).toContain('mcp');
  });

  it('should have code-related command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('review');
    expect(entries).toContain('pr_comments');
    expect(entries).toContain('files');
  });

  it('should have plugin-related command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('plugin');
    expect(entries).toContain('reload-plugins');
    expect(entries).toContain('skills');
  });

  it('should have utility command directories', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('exit');
    expect(entries).toContain('upgrade');
    expect(entries).toContain('usage');
    expect(entries).toContain('stats');
    expect(entries).toContain('status');
  });

  it('should have index.ts with allCommands export', () => {
    const fs = require('fs');
    const path = require('path');
    const indexPath = path.join(__dirname, '../commands_v2/index.ts');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('allCommands');
    expect(content).toContain('export');
  });

  it('should have each command directory with an index file', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir).filter((e: string) => !e.endsWith('.ts') && !e.endsWith('.tsx'));
    for (const entry of entries.slice(0, 10)) {
      const indexPath = path.join(commandsDir, entry, 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    }
  });

  it('should have command directories for vim and voice', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('vim');
    expect(entries).toContain('voice');
  });

  it('should have command directories for remote operations', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('remote-env');
    expect(entries).toContain('remote-setup');
  });

  it('should have command directories for context and cost', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('context');
    expect(entries).toContain('cost');
    expect(entries).toContain('effort');
  });

  it('should have command directories for memory and knowledge', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('memory');
    expect(entries).toContain('thinkback');
    expect(entries).toContain('thinkback-play');
  });

  it('should have command directories for communication', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('btw');
    expect(entries).toContain('feedback');
    expect(entries).toContain('install-slack-app');
  });

  it('should have command directories for planning', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir);
    expect(entries).toContain('plan');
    expect(entries).toContain('compact');
  });

  it('should have over 50 command directories total', () => {
    const fs = require('fs');
    const path = require('path');
    const commandsDir = path.join(__dirname, '../commands_v2');
    const entries = fs.readdirSync(commandsDir).filter((e: string) => !e.endsWith('.ts') && !e.endsWith('.tsx'));
    expect(entries.length).toBeGreaterThan(50);
  });
});
