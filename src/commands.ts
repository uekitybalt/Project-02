import type { Viewport } from './viewport';

export type LogKind = 'info' | 'success' | 'error' | 'echo' | 'muted';

/** Everything a command is allowed to touch. Add new app services here. */
export interface CommandContext {
  print(message: string, kind?: LogKind): void;
  clearLog(): void;
  setTool(name: string): void;
  viewport: Viewport;
}

export interface Command {
  name: string; // e.g. "WALL"
  description: string;
  aliases?: string[];
  run(ctx: CommandContext, args: string[]): void | Promise<void>;
}

export interface Suggestion {
  text: string;
  description: string;
}

/** The single place where commands live. Ribbon and command line both call execute(). */
export class CommandRegistry {
  private byKey = new Map<string, Command>(); // name + aliases -> command
  private ctx: CommandContext | null = null;

  setContext(ctx: CommandContext): void {
    this.ctx = ctx;
  }

  register(cmd: Command): void {
    for (const key of [cmd.name, ...(cmd.aliases ?? [])]) {
      const k = key.toUpperCase();
      if (this.byKey.has(k)) throw new Error(`Duplicate command: ${k}`);
      this.byKey.set(k, cmd);
    }
  }

  get(name: string): Command | undefined {
    return this.byKey.get(name.toUpperCase());
  }

  list(): Command[] {
    return [...new Set(this.byKey.values())].sort((a, b) => a.name.localeCompare(b.name));
  }

  /** Names/aliases starting with `prefix`, for autocomplete. */
  suggest(prefix: string, limit = 8): Suggestion[] {
    const p = prefix.trim().toUpperCase();
    if (!p) return [];
    return [...this.byKey.entries()]
      .filter(([key]) => key.startsWith(p))
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, limit)
      .map(([key, cmd]) => ({ text: key, description: cmd.description }));
  }

  /** Run a command line such as "WALL" or "HELP WALL". Echoes it to the log. */
  execute(input: string): void {
    const ctx = this.ctx;
    const text = input.trim();
    if (!ctx || !text) return;

    ctx.print(`Command: ${text}`, 'echo');
    const [name, ...args] = text.split(/\s+/);
    const cmd = this.get(name);
    if (!cmd) {
      const hints = this.suggest(name, 5).map((s) => s.text);
      ctx.print(
        `Unknown command "${name}".` + (hints.length ? ` Did you mean: ${hints.join(', ')}?` : ' Type HELP for a list.'),
        'error',
      );
      return;
    }

    const fail = (err: unknown) =>
      ctx.print(`${cmd.name}: ${err instanceof Error ? err.message : String(err)}`, 'error');
    try {
      const result = cmd.run(ctx, args);
      if (result instanceof Promise) result.catch(fail);
    } catch (err) {
      fail(err);
    }
  }
}

// Placeholder commands so every ribbon button has something to run.
const STUBS: Array<[string, string]> = [
  ['DOOR', 'Place a door'],
  ['WINDOW', 'Place a window'],
  ['FLOOR', 'Create a floor'],
  ['STAIR', 'Create a stair'],
  ['RAILING', 'Create a railing'],
  ['LEVEL', 'Add a level'],
  ['GRIDLINE', 'Add a grid line'],
  ['COLUMN', 'Place a structural column'],
  ['BEAM', 'Place a structural beam'],
  ['FOUNDATION', 'Create a foundation'],
  ['REBAR', 'Add reinforcement'],
  ['LINKIFC', 'Link an IFC model'],
  ['IMPORTCAD', 'Import a CAD file'],
  ['LOADFAMILY', 'Load a family'],
  ['VIEW3D', 'Open a 3D view'],
  ['PLANVIEW', 'Create a plan view'],
  ['SECTION', 'Create a section'],
  ['PROJECTINFO', 'Edit project information'],
  ['UNITS', 'Project units'],
  ['PHASES', 'Manage phases'],
];

export function registerBuiltinCommands(registry: CommandRegistry): void {
  registry.register({
    name: 'WALL',
    description: 'Draw a wall (placeholder)',
    run: (ctx) => ctx.print('WALL: not implemented yet. Next step: click two points to draw a wall.'),
  });

  for (const [name, description] of STUBS) {
    registry.register({
      name,
      description: `${description} (placeholder)`,
      run: (ctx) => ctx.print(`${name}: not implemented yet.`),
    });
  }

  registry.register({
    name: 'HELP',
    aliases: ['?'],
    description: 'List commands, or HELP <command> for details',
    run: (ctx, args) => {
      if (args[0]) {
        const cmd = registry.get(args[0]);
        if (!cmd) return ctx.print(`No such command: ${args[0]}`, 'error');
        const aka = cmd.aliases?.length ? `  (aliases: ${cmd.aliases.join(', ')})` : '';
        return ctx.print(`${cmd.name} - ${cmd.description}${aka}`);
      }
      const lines = registry.list().map((c) => `  ${c.name.padEnd(12)} ${c.description}`);
      ctx.print(['Available commands:', ...lines, 'Tab autocompletes. Up/Down recalls history.'].join('\n'));
    },
  });

  registry.register({
    name: 'CLEAR',
    aliases: ['CLS'],
    description: 'Clear the command history log',
    run: (ctx) => ctx.clearLog(),
  });

  registry.register({
    name: 'ZOOMEXTENTS',
    aliases: ['ZE'],
    description: 'Fit the view to the model (alias: ZE)',
    run: (ctx) => {
      ctx.viewport.zoomExtents();
      ctx.print('Zoomed to extents.', 'muted');
    },
  });
}
