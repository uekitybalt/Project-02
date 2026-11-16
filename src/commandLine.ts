import { h } from './dom';
import type { CommandRegistry, LogKind, Suggestion } from './commands';

const MAX_LOG_LINES = 500;
const MAX_HISTORY = 100;
const MAX_SUGGESTIONS = 8;

/** AutoCAD-style command line: log above, input below, autocomplete + history. */
export class CommandLine {
  private registry: CommandRegistry;
  private log = h('div', 'cmd-log');
  private input = h('input', 'cmd-input');
  private box = h('div', 'cmd-suggestions');

  private history: string[] = [];
  private historyPos = -1; // -1 = not browsing history
  private draft = ''; // text typed before pressing Up
  private matches: Suggestion[] = [];
  private active = -1; // highlighted suggestion
  private tabBase: string | null = null; // text that Tab-cycling started from

  constructor(root: HTMLElement, registry: CommandRegistry) {
    this.registry = registry;
    this.input.type = 'text';
    this.input.spellcheck = false;
    this.input.autocomplete = 'off';
    this.input.placeholder = 'Type a command, e.g. WALL or HELP';
    this.box.hidden = true;

    const row = h('div', 'cmd-row');
    row.append(this.box, h('span', 'cmd-prompt', 'Command:'), this.input);
    root.append(this.log, row);

    this.input.addEventListener('input', () => {
      this.historyPos = -1;
      this.tabBase = null;
      this.refreshSuggestions();
    });
    this.input.addEventListener('keydown', (e) => this.onKey(e));
    this.input.addEventListener('blur', () => this.hideSuggestions());
  }

  print(message: string, kind: LogKind = 'info'): void {
    this.log.appendChild(h('div', `cmd-line cmd-${kind}`, message));
    while (this.log.childElementCount > MAX_LOG_LINES) this.log.firstElementChild?.remove();
    this.log.scrollTop = this.log.scrollHeight;
  }

  clear(): void {
    this.log.replaceChildren();
  }

  focus(): void {
    this.input.focus();
  }

  private onKey(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        this.submit();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.recall(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.recall(1);
        break;
      case 'Tab':
        e.preventDefault();
        this.cycle(e.shiftKey ? -1 : 1);
        break;
      case 'Escape':
        this.input.value = '';
        this.historyPos = -1;
        this.tabBase = null;
        this.hideSuggestions();
        break;
    }
  }

  private submit(): void {
    const text = this.input.value.trim();
    this.input.value = '';
    this.historyPos = -1;
    this.tabBase = null;
    this.hideSuggestions();
    if (!text) return;

    if (this.history[this.history.length - 1] !== text) this.history.push(text);
    if (this.history.length > MAX_HISTORY) this.history.shift();
    this.registry.execute(text);
  }

  /** Up (-1) / Down (+1) through previously run commands. */
  private recall(dir: -1 | 1): void {
    if (this.history.length === 0) return;
    if (this.historyPos === -1) {
      if (dir === 1) return;
      this.draft = this.input.value;
      this.historyPos = this.history.length - 1;
    } else {
      this.historyPos += dir;
      if (this.historyPos >= this.history.length) this.historyPos = -1;
      else if (this.historyPos < 0) this.historyPos = 0;
    }
    this.input.value = this.historyPos === -1 ? this.draft : this.history[this.historyPos];
    this.hideSuggestions();
  }

  /** Tab / Shift+Tab: complete the command name, cycling through matches. */
  private cycle(dir: 1 | -1): void {
    if (!/^\S*$/.test(this.input.value)) return; // only complete the first word
    this.tabBase ??= this.input.value;
    const list = this.registry.suggest(this.tabBase, MAX_SUGGESTIONS);
    if (list.length === 0) return;
    this.matches = list;
    this.active =
      this.active === -1
        ? dir === 1
          ? 0
          : list.length - 1
        : (this.active + dir + list.length) % list.length;
    this.input.value = list[this.active].text;
    this.render();
  }

  private refreshSuggestions(): void {
    const v = this.input.value;
    this.active = -1;
    this.matches = /^\S*$/.test(v) ? this.registry.suggest(v, MAX_SUGGESTIONS) : [];
    if (this.matches.length === 1 && this.matches[0].text === v.toUpperCase()) this.matches = [];
    this.render();
  }

  private hideSuggestions(): void {
    this.matches = [];
    this.active = -1;
    this.render();
  }

  private render(): void {
    this.box.replaceChildren();
    this.box.hidden = this.matches.length === 0;
    this.matches.forEach((m, i) => {
      const item = h('div', i === this.active ? 'cmd-suggestion active' : 'cmd-suggestion');
      item.append(h('span', 'cmd-suggestion-name', m.text), h('span', 'cmd-suggestion-desc', m.description));
      // mousedown (not click) so the input keeps focus.
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.input.value = m.text;
        this.hideSuggestions();
        this.input.focus();
      });
      this.box.append(item);
    });
  }
}
