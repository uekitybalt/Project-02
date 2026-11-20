import * as THREE from 'three';
import type { Viewport } from './viewport';
import { WallStore, buildWallMesh, type Point2 } from './walls';

const GRID = 0.5; // grid snap step in meters
const SNAP_RADIUS = 0.3; // endpoint snap distance in meters

const previewMaterial = new THREE.MeshStandardMaterial({
  color: 0x4aa3ff,
  transparent: true,
  opacity: 0.45,
});

export class WallTool {
  private viewport: Viewport;
  private store: WallStore;
  private info: (text: string) => void;
  private onEnd: () => void;
  private start: Point2 | null = null;
  private preview: THREE.Mesh | null = null;
  private active = false;

  private onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.end();
  };

  /** info: status text. onEnd: called when the tool finishes (Esc / right-click). */
  constructor(viewport: Viewport, store: WallStore, info: (text: string) => void, onEnd: () => void) {
    this.viewport = viewport;
    this.store = store;
    this.info = info;
    this.onEnd = onEnd;
  }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.viewport.onToolMove = (p) => this.move(p);
    this.viewport.onLeftClick = (p) => this.click(p);
    this.viewport.onRightClick = () => this.end();
    window.addEventListener('keydown', this.onKey);
    this.info('Click start point');
  }

  deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.clearPreview();
    this.start = null;
    this.viewport.onToolMove = () => {};
    this.viewport.onLeftClick = () => {};
    this.viewport.onRightClick = () => {};
    window.removeEventListener('keydown', this.onKey);
    this.info('');
  }

  /** Esc / right-click: cancel the current wall first, then leave the tool. */
  private end(): void {
    if (this.start) {
      this.start = null;
      this.clearPreview();
      this.info('Click start point');
      return;
    }
    this.deactivate();
    this.onEnd();
  }

  private snap(p: THREE.Vector3): Point2 {
    let best: Point2 | null = null;
    let bestDist = SNAP_RADIUS;
    for (const w of this.store.all()) {
      for (const pt of [w.start, w.end]) {
        const d = Math.hypot(pt.x - p.x, pt.z - p.z);
        if (d < bestDist) {
          bestDist = d;
          best = pt;
        }
      }
    }
    if (best) return { x: best.x, z: best.z };
    return { x: Math.round(p.x / GRID) * GRID, z: Math.round(p.z / GRID) * GRID };
  }

  private move(p: THREE.Vector3 | null): void {
    if (!this.start || !p) return;
    const end = this.snap(p);
    const length = Math.hypot(end.x - this.start.x, end.z - this.start.z);
    this.clearPreview();
    if (length < 0.01) {
      this.info('Length: 0.000 m');
      return;
    }
    this.preview = buildWallMesh(
      { id: 'preview', start: this.start, end, height: 3, thickness: 0.2 },
      previewMaterial,
    );
    this.viewport.scene.add(this.preview);
    this.info(`Length: ${length.toFixed(3)} m`);
  }

  private click(p: THREE.Vector3): void {
    const pt = this.snap(p);
    if (!this.start) {
      this.start = pt;
      this.info('Click end point');
      return;
    }
    if (Math.hypot(pt.x - this.start.x, pt.z - this.start.z) < 0.01) return;
    const wall = this.store.add(this.start, pt);
    this.viewport.modelGroup.add(buildWallMesh(wall));
    this.start = null;
    this.clearPreview();
    this.info('Click start point');
  }

  private clearPreview(): void {
    if (!this.preview) return;
    this.viewport.scene.remove(this.preview);
    this.preview.geometry.dispose();
    this.preview = null;
  }
}