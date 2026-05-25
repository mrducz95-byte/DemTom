export interface ShrimpMarker {
  x: number; // percentage from 0.0 to 100.0
  y: number; // percentage from 0.0 to 100.0
  confidence?: number;
}

export interface CountResult {
  count: number;
  shrimps: ShrimpMarker[];
  accuracy: number;
  notes?: string;
}

export interface PresetImage {
  id: string;
  name: string;
  url: string; // Base64 or interactive generator
  description: string;
  shrimpCount: number;
}
