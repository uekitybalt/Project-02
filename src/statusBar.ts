import type { Vector3 } from 'three';
import { h } from './dom';

export const UNITS_LABEL = 'Meters';

export class StatusBar {
  private coords = h('span', 'status-item status-coords');
  private tool = h('span', 'status-item');
  private info = h('span', 'status-item status-info');

  constructor(root: HTMLElement) {
    root.append(
      this.coords,
      this.tool,
      this.info,
      h('span', 'status-spacer'),
      h('span', 'status-item', `Units: ${UNITS_LABEL}`),
    );
    this.setCursor(null);
    this.setTool('Select');
  }

  /** Ground-plane position under the cursor (X and Z, because Y is up). */
  setCursor(p: Vector3 | null): void {
    this.coords.textContent = p
      ? `X: ${p.x.toFixed(3)}   Z: ${p.z.toFixed(3)}`
      : 'X: \u2014   Z: \u2014';
  }

  setTool(name: string): void {
    this.tool.textContent = `Tool: ${name}`;
  }

  /** Live hint or measurement next to the tool name, e.g. "Length: 3.500 m". */
  setInfo(text: string): void {
    this.info.textContent = text;
  }
}