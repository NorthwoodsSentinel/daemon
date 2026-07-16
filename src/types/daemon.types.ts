/**
 * Type definitions for daemon.md parsing
 */

/**
 * Raw parsed sections from daemon.md
 * Keys match section headers: [ABOUT], [MISSION], etc.
 */
export interface DaemonSections {
  ABOUT?: string;
  CURRENT_LOCATION?: string;
  MISSION?: string;
  TELOS?: string;
  WHAT_IM_BUILDING?: string;
  WHO_I_AM?: string;
  FAVORITE_BOOKS?: string;
  FAVORITE_MOVIES?: string;
  FAVORITE_TV?: string;
  PREFERENCES?: string;
  DAILY_ROUTINE?: string;
  PROJECTS?: string;
  RESUME?: string;
  CONTACT?: string;
  PHILOSOPHY?: string;
  FLOW_LAWS?: string;
  BREADCRUMBS?: string;
  MUSIC?: string;
  WRITING?: string;
  YOUTUBE?: string;
  CULTURAL_AI_CALIBRATION?: string;
  VOICE?: string;
  PROVENANCE?: string;
}

/**
 * Provenance receipt for a served field — source, freshness, attribution.
 * Attribution vocabulary: "Rob direct" | "substrate-compiled, Rob-reviewed" | "agent-reported"
 */
export interface ProvenanceEntry {
  source: string;
  asOf: string;
  attribution: string;
}

/**
 * Processed daemon data ready for component consumption
 */
export interface DaemonData {
  about: string;
  mission: string;
  telos: string[];
  currentLocation: string;
  philosophy: string;
  whatImBuilding: string[];
  whoIAm: string;
  preferences: string[];
  dailyRoutine: string[];
  favoriteBooks: string[];
  favoriteMovies: string[];
  favoriteTv: string[];
  projects: string[];
  resume: string;
  contact: string;
  lastUpdated: string;
  flowLaws: string[];
  breadcrumbs: string;
  music: string[];
  writing: string[];
  youtube: string[];
  culturalAiCalibration: string;
  voice: string;
  provenance: Record<string, ProvenanceEntry>;
}

/**
 * Hero-specific data subset
 */
export interface HeroData {
  tagline: string;
  location: string;
  subtitle: string;
}
