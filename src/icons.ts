// Simple 24x24 stroke icons. Each value is the inner SVG markup.
const ICONS = {
  wall: '<rect x="3" y="6" width="18" height="12"/><path d="M3 12h18M9 6v6M15 12v6"/>',
  door: '<path d="M6 21V4h9l3 2v15M3 21h18M12 13h.01"/>',
  window: '<rect x="4" y="4" width="16" height="16"/><path d="M12 4v16M4 12h16"/>',
  floor: '<path d="M3 11l9-5 9 5-9 5zM3 15l9 5 9-5"/>',
  stair: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  railing: '<path d="M3 8h18M5 8v12M12 8v12M19 8v12"/>',
  level: '<path d="M2 12h20M8 12l4-5 4 5"/>',
  gridline: '<path d="M8 3v18M16 3v18M3 8h18M3 16h18"/>',
  column: '<path d="M8 4h8v16H8zM6 4h12M6 20h12"/>',
  beam: '<rect x="2" y="9" width="20" height="6"/>',
  foundation: '<path d="M3 21h18M5 21v-6h14v6M9 15V9h6v6"/>',
  rebar: '<circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="12" cy="16" r="2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  import: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  family: '<path d="M12 3l9 5v8l-9 5-9-5V8zM12 12l9-4M12 12v9M12 12L3 8"/>',
  cube: '<path d="M12 3l9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8"/>',
  plan: '<rect x="3" y="3" width="18" height="18"/><path d="M3 10h8v11M15 3v7h6"/>',
  section: '<path d="M3 12h18M12 3v6M9 6l3-3 3 3M12 21v-6"/>',
  zoomextents: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  phases: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  clear: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
};

export type IconName = keyof typeof ICONS;

/** Returns a complete <svg> string for the icon (trusted, static markup). */
export function icon(name: IconName): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}
