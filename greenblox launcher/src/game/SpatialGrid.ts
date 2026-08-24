// Spatial hash grid for the game engine.
//
// The naive engine loop performs a full O(N) sweep over every part for each
// physics axis + zone check + camera raycast. Studio worlds routinely contain
// thousands of parts, so that per-frame cost grows linearly and turns into a
// slideshow on low-end machines. The grid buckets parts by their AABB into
// 3D cells; queries only touch the cells overlapping the player's region,
// which is O(1) for typical worlds regardless of total part count.

export interface AABB {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

const CELL_RANGE = 4096;

export class SpatialGrid {
  readonly cellSize: number;

  // Cells keyed by a packed INTEGER instead of a "x,y,z" string. The engine
  // runs grid queries 3+ times per physics frame; string keys were allocated
  // and GC'd thousands of times per second in big Studio worlds, adding
  // measurable garbage-collection pressure to the game loop.
  private cells = new Map<number, number[]>();
  private aabbs: AABB[] = [];

  // Reused version-tagged array so query() allocates nothing after warm-up
  // (hot path: called 3+ times per physics frame).
  private seen = new Uint32Array(0);
  private seenVersion = 0;

  constructor(cellSize = 8) {
    this.cellSize = cellSize;
  }

  /**
   * (Re)index every part. Must be called whenever the part list or any part's
   * AABB changes (world load, build placement).
   */
  rebuild(aabbs: AABB[]): void {
    this.cells.clear();
    this.aabbs = aabbs;
    for (let i = 0; i < aabbs.length; i++) this.insert(i, aabbs[i]);
  }

  /** Index one newly added part (runtime build placement). */
  add(index: number, aabb: AABB): void {
    if (this.aabbs.length <= index) this.aabbs.length = index + 1;
    this.aabbs[index] = aabb;
    this.insert(index, aabb);
  }

  /** Pack three cell coordinates into one number. Cells may be negative, so we
   *  bias by CELL_RANGE; the packed value stays well below 2^53 (safe doubles).
   *  Parts whose AABB extends beyond the clamped range land on the boundary
   *  cells — queries clamp identically, so they still resolve. */
  private static key(cx: number, cy: number, cz: number): number {
    return (cx + CELL_RANGE) * 16777216 + (cy + CELL_RANGE) * 4096 + (cz + CELL_RANGE);
  }

  private static clampCell(v: number): number {
    return Math.max(-CELL_RANGE, Math.min(CELL_RANGE, v));
  }

  private insert(index: number, b: AABB): void {
    const cs = this.cellSize;
    const minCx = SpatialGrid.clampCell(Math.floor(b.minX / cs));
    const maxCx = SpatialGrid.clampCell(Math.floor(b.maxX / cs));
    const minCy = SpatialGrid.clampCell(Math.floor(b.minY / cs));
    const maxCy = SpatialGrid.clampCell(Math.floor(b.maxY / cs));
    const minCz = SpatialGrid.clampCell(Math.floor(b.minZ / cs));
    const maxCz = SpatialGrid.clampCell(Math.floor(b.maxZ / cs));
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const k = SpatialGrid.key(cx, cy, cz);
          let arr = this.cells.get(k);
          if (!arr) {
            arr = [];
            this.cells.set(k, arr);
          }
          arr.push(index);
        }
      }
    }
  }

  /**
   * Collect all part indices whose cells overlap the given region. The cells
   * are the granularity, so the caller must still perform exact AABB overlap
   * tests on the returned candidates. Fills `out` and returns its length.
   */
  query(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number, out: number[]): number {
    out.length = 0;
    const cs = this.cellSize;
    // Clamp to a sane cell range so degenerate / huge queries can't explode.
    const minCx = SpatialGrid.clampCell(Math.floor(minX / cs));
    const maxCx = SpatialGrid.clampCell(Math.floor(maxX / cs));
    const minCy = SpatialGrid.clampCell(Math.floor(minY / cs));
    const maxCy = SpatialGrid.clampCell(Math.floor(maxY / cs));
    const minCz = SpatialGrid.clampCell(Math.floor(minZ / cs));
    const maxCz = SpatialGrid.clampCell(Math.floor(maxZ / cs));

    this.seenVersion++;
    if (this.seenVersion === 0) {
      this.seen.fill(0);
      this.seenVersion = 1;
    }
    if (this.seen.length < this.aabbs.length) this.seen = new Uint32Array(this.aabbs.length);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        for (let cz = minCz; cz <= maxCz; cz++) {
          const arr = this.cells.get(SpatialGrid.key(cx, cy, cz));
          if (!arr) continue;
          for (let i = 0; i < arr.length; i++) {
            const idx = arr[i];
            if (this.seen[idx] !== this.seenVersion) {
              this.seen[idx] = this.seenVersion;
              out.push(idx);
            }
          }
        }
      }
    }
    return out.length;
  }
}
