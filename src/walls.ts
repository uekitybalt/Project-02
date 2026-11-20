import * as THREE from 'three';

export interface Point2 {
  x: number;
  z: number;
}

/** Wall data. Meshes are built from this, never the other way round. */
export interface Wall {
  id: string;
  start: Point2;
  end: Point2;
  height: number;
  thickness: number;
}

export class WallStore {
  private walls = new Map<string, Wall>();
  private nextId = 1;

  add(start: Point2, end: Point2, height = 3, thickness = 0.2): Wall {
    const wall: Wall = { id: `wall-${this.nextId++}`, start, end, height, thickness };
    this.walls.set(wall.id, wall);
    return wall;
  }

  all(): Wall[] {
    return [...this.walls.values()];
  }
}

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xc8ccd2 });

/** Build a box mesh for a wall: centered on its line, standing on y = 0. */
export function buildWallMesh(wall: Wall, material: THREE.Material = wallMaterial): THREE.Mesh {
  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.hypot(dx, dz);
  const midX = (wall.start.x + wall.end.x) / 2;
  const midZ = (wall.start.z + wall.end.z) / 2;

  const geometry = new THREE.BoxGeometry(length, wall.height, wall.thickness);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(midX, wall.height / 2, midZ);
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.userData.wallId = wall.id;
  return mesh;
}