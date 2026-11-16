import { h } from './dom';
import { icon, type IconName } from './icons';
import type { CommandRegistry } from './commands';

interface RibbonButton {
  label: string;
  icon: IconName;
  command: string; // must be a registered command name
}
interface RibbonGroup {
  label: string;
  buttons: RibbonButton[];
}
interface RibbonTab {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

// Edit this data to change the ribbon. Every button just names a command.
const TABS: RibbonTab[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    groups: [
      {
        label: 'Build',
        buttons: [
          { label: 'Wall', icon: 'wall', command: 'WALL' },
          { label: 'Door', icon: 'door', command: 'DOOR' },
          { label: 'Window', icon: 'window', command: 'WINDOW' },
          { label: 'Floor', icon: 'floor', command: 'FLOOR' },
        ],
      },
      {
        label: 'Circulation',
        buttons: [
          { label: 'Stair', icon: 'stair', command: 'STAIR' },
          { label: 'Railing', icon: 'railing', command: 'RAILING' },
        ],
      },
      {
        label: 'Datum',
        buttons: [
          { label: 'Level', icon: 'level', command: 'LEVEL' },
          { label: 'Grid', icon: 'gridline', command: 'GRIDLINE' },
        ],
      },
    ],
  },
  {
    id: 'structure',
    label: 'Structure',
    groups: [
      {
        label: 'Structure',
        buttons: [
          { label: 'Column', icon: 'column', command: 'COLUMN' },
          { label: 'Beam', icon: 'beam', command: 'BEAM' },
          { label: 'Foundation', icon: 'foundation', command: 'FOUNDATION' },
        ],
      },
      { label: 'Reinforcement', buttons: [{ label: 'Rebar', icon: 'rebar', command: 'REBAR' }] },
    ],
  },
  {
    id: 'insert',
    label: 'Insert',
    groups: [
      {
        label: 'Link',
        buttons: [
          { label: 'Link IFC', icon: 'link', command: 'LINKIFC' },
          { label: 'Import CAD', icon: 'import', command: 'IMPORTCAD' },
        ],
      },
      { label: 'Library', buttons: [{ label: 'Load Family', icon: 'family', command: 'LOADFAMILY' }] },
    ],
  },
  {
    id: 'view',
    label: 'View',
    groups: [
      {
        label: 'Create',
        buttons: [
          { label: '3D View', icon: 'cube', command: 'VIEW3D' },
          { label: 'Plan View', icon: 'plan', command: 'PLANVIEW' },
          { label: 'Section', icon: 'section', command: 'SECTION' },
        ],
      },
      { label: 'Navigate', buttons: [{ label: 'Zoom Extents', icon: 'zoomextents', command: 'ZOOMEXTENTS' }] },
    ],
  },
  {
    id: 'manage',
    label: 'Manage',
    groups: [
      {
        label: 'Project',
        buttons: [
          { label: 'Project Info', icon: 'info', command: 'PROJECTINFO' },
          { label: 'Units', icon: 'settings', command: 'UNITS' },
          { label: 'Phases', icon: 'phases', command: 'PHASES' },
        ],
      },
      {
        label: 'Tools',
        buttons: [
          { label: 'Help', icon: 'help', command: 'HELP' },
          { label: 'Clear Log', icon: 'clear', command: 'CLEAR' },
        ],
      },
    ],
  },
];

export class Ribbon {
  private registry: CommandRegistry;
  private tabButtons = new Map<string, HTMLButtonElement>();
  private panels = new Map<string, HTMLElement>();

  constructor(root: HTMLElement, registry: CommandRegistry) {
    this.registry = registry;
    const tabBar = h('div', 'ribbon-tabs');
    tabBar.setAttribute('role', 'tablist');
    const host = h('div', 'ribbon-panels');

    for (const tab of TABS) {
      const btn = h('button', 'ribbon-tab', tab.label);
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => this.activate(tab.id));
      const panel = this.buildPanel(tab);
      this.tabButtons.set(tab.id, btn);
      this.panels.set(tab.id, panel);
      tabBar.append(btn);
      host.append(panel);
    }

    root.append(tabBar, host);
    this.activate(TABS[0].id);
  }

  private activate(id: string): void {
    for (const [tabId, btn] of this.tabButtons) {
      btn.classList.toggle('active', tabId === id);
      btn.setAttribute('aria-selected', String(tabId === id));
    }
    for (const [panelId, panel] of this.panels) panel.hidden = panelId !== id;
  }

  private buildPanel(tab: RibbonTab): HTMLElement {
    const panel = h('div', 'ribbon-panel');
    panel.setAttribute('role', 'tabpanel');
    for (const group of tab.groups) {
      const g = h('div', 'ribbon-group');
      const buttons = h('div', 'ribbon-group-buttons');
      for (const b of group.buttons) {
        const btn = h('button', 'ribbon-btn');
        btn.type = 'button';
        btn.innerHTML = icon(b.icon); // trusted static markup from icons.ts
        btn.append(h('span', 'ribbon-btn-label', b.label));
        const desc = this.registry.get(b.command)?.description;
        if (!desc) console.warn(`Ribbon button "${b.label}" uses unknown command ${b.command}`);
        btn.title = `${b.label} (${b.command})${desc ? ' - ' + desc : ''}`;
        // Same entry point as typing the command name:
        btn.addEventListener('click', () => this.registry.execute(b.command));
        buttons.append(btn);
      }
      g.append(buttons, h('div', 'ribbon-group-label', group.label));
      panel.append(g);
    }
    return panel;
  }
}
