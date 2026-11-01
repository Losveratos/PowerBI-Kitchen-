import kpis from './queries/demo/kpis.dax?raw';
export const q = kpis;
export function label(v: number) { return `${v.toFixed(1)} €`; }
