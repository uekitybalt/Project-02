import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** 3D viewport. Y is up; the ground plane is X/Z. 1 unit = 1 meter. */
export class Viewport {
  readonly scene = new THREE.Scene();
  /** Everything the user builds (walls, doors...) goes in here. */
  readonly modelGroup = new THREE.Group();
  readonly camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
  readonly renderer = new THREE.WebGLRenderer({ antialias: true });
  readonly controls: OrbitControls;

  /** Called with the ground-plane point under the cursor (or null). */
  onCursorMove: (point: THREE.Vector3 | null) => void = () => {};

  private container: HTMLElement;
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private hit = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.container = container;

    // Theme colors come from CSS variables in styles.css.
    const css = getComputedStyle(document.documentElement);
    const color = (name: string) => css.getPropertyValue(name).trim();

    this.scene.background = new THREE.Color(color('--viewport-bg'));
    this.scene.add(this.modelGroup);

    // Ground grid: 1 m minor lines, 10 m major lines.
    const minor = new THREE.GridHelper(200, 200, color('--grid-minor'), color('--grid-minor'));
    const major = new THREE.GridHelper(200, 20, color('--grid-major'), color('--grid-major'));
    major.position.y = 0.002;
    // Axes: X red, Y green (up), Z blue. Always drawn on top.
    const axes = new THREE.AxesHelper(5);
    (axes.material as THREE.LineBasicMaterial).depthTest = false;
    axes.renderOrder = 10;
    this.scene.add(minor, major, axes);

    this.camera.position.set(18, 14, 18);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Right-drag rotate, middle-drag pan, wheel zoom. Left is free for tools.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 2000;
    this.controls.zoomSpeed = 5; // 1 = default, higher = faster, lower = slower
this.controls.zoomToCursor = true; // zoom toward the mouse pointer, like CAD/Revit
    this.controls.maxPolarAngle = Math.PI * 0.499; // stay above the ground; remove to orbit underneath

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointermove', (e) => this.updateCursor(e));
    canvas.addEventListener('pointerleave', () => this.onCursorMove(null));

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();
    this.zoomExtents();

    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  /** Fit the camera to the model, or to a default area when the model is empty. */
  zoomExtents(): void {
    const box = new THREE.Box3().setFromObject(this.modelGroup);
    if (box.isEmpty()) box.set(new THREE.Vector3(-10, 0, -10), new THREE.Vector3(10, 4, 10));
    const sphere = box.getBoundingSphere(new THREE.Sphere());

    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const distance = (sphere.radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.1;

    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.controls.target.copy(sphere.center);
    this.camera.position.copy(sphere.center).addScaledVector(dir, distance);
    this.controls.update();
  }

  private resize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private updateCursor(e: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const p = this.raycaster.ray.intersectPlane(this.groundPlane, this.hit);
    this.onCursorMove(p ? this.hit : null);
  }
}
