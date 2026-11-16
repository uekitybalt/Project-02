import { h } from './dom';

interface TreeNode {
  label: string;
  expanded?: boolean;
  children?: TreeNode[];
}

// Placeholder data. Later this will be generated from the real project model.
const TREE: TreeNode[] = [
  {
    label: 'Project',
    expanded: true,
    children: [
      { label: 'Levels', expanded: true, children: [{ label: 'Level 1' }, { label: 'Level 2' }] },
      { label: 'Floor Plans', expanded: true, children: [{ label: 'Level 1' }, { label: 'Level 2' }] },
      { label: '3D Views', expanded: true, children: [{ label: '{3D}' }] },
    ],
  },
];

export class ProjectBrowser {
  private selected: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    const body = h('div', 'panel-body');
    body.append(this.renderNodes(TREE, 0));
    root.append(h('div', 'panel-header', 'Project Browser'), body);
  }

  private renderNodes(nodes: TreeNode[], depth: number): HTMLUListElement {
    const ul = h('ul', 'tree');
    for (const node of nodes) {
      const li = h('li', 'tree-item');
      const row = h('div', 'tree-row');
      row.style.paddingLeft = `${8 + depth * 14}px`;
      row.append(h('span', 'tree-chevron', node.children ? '\u25B6' : ''), h('span', 'tree-label', node.label));
      li.append(row);

      if (node.children) {
        const kids = this.renderNodes(node.children, depth + 1);
        li.append(kids);
        const setExpanded = (open: boolean) => {
          li.classList.toggle('expanded', open);
          kids.hidden = !open;
        };
        setExpanded(node.expanded ?? false);
        row.addEventListener('click', () => setExpanded(!li.classList.contains('expanded')));
      } else {
        row.addEventListener('click', () => {
          this.selected?.classList.remove('selected');
          row.classList.add('selected');
          this.selected = row;
        });
      }
      ul.append(li);
    }
    return ul;
  }
}
