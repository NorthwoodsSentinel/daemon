/**
 * Build-time parser for daemon.md
 *
 * Reads daemon.md from XDG config path, parses sections, generates TypeScript data file.
 * Run with: bun scripts/parse-daemon.ts
 *
 * Path resolution order:
 * 1. DAEMON_MD_PATH environment variable
 * 2. $XDG_CONFIG_HOME/daemon/daemon.md
 * 3. ~/.config/daemon/daemon.md
 * 4. public/daemon.example.md (fallback for development)
 */

import type { DaemonSections, DaemonData, HeroData, ProvenanceEntry } from "../src/types/daemon.types";

const PROJECT_ROOT = import.meta.dir.replace("/scripts", "");
const OUTPUT_DIR = `${PROJECT_ROOT}/src/generated`;
const OUTPUT_PATH = `${OUTPUT_DIR}/daemon-data.ts`;

// XDG-compliant path resolution
function resolveDaemonMdPath(): string {
	// 1. Environment variable override
	if (process.env.DAEMON_MD_PATH) {
		return process.env.DAEMON_MD_PATH;
	}

	// 2. XDG_CONFIG_HOME or default ~/.config
	const xdgConfigHome = process.env.XDG_CONFIG_HOME || `${process.env.HOME}/.config`;
	const xdgPath = `${xdgConfigHome}/daemon/daemon.md`;

	// 3. Fallback to example template
	const fallbackPath = `${PROJECT_ROOT}/public/daemon.example.md`;

	return xdgPath; // Primary path - existence checked in main()
}

const DAEMON_MD_PATH = resolveDaemonMdPath();
const FALLBACK_PATH = `${PROJECT_ROOT}/public/daemon.example.md`;

/**
 * Parse daemon.md into sections
 * Sections with .unpublished suffix are parsed but excluded from output
 */
function parseDaemonMd(content: string): DaemonSections {
	const sections: DaemonSections = {};
	const lines = content.split("\n");
	let currentSection = "";
	let currentContent: string[] = [];
	let isUnpublished = false;

	for (const line of lines) {
		// Match [SECTION_NAME] or [SECTION_NAME].unpublished
		const sectionMatch = line.match(/^\[([A-Z_]+)\](\.unpublished)?$/);
		if (sectionMatch) {
			// Save previous section (if not unpublished)
			if (currentSection && !isUnpublished) {
				sections[currentSection as keyof DaemonSections] = currentContent.join("\n").trim();
			}
			currentSection = sectionMatch[1];
			isUnpublished = !!sectionMatch[2];
			currentContent = [];
		} else if (currentSection) {
			currentContent.push(line);
		}
	}

	// Save final section (if not unpublished)
	if (currentSection && !isUnpublished) {
		sections[currentSection as keyof DaemonSections] = currentContent.join("\n").trim();
	}

	return sections;
}

/**
 * Extract list items from markdown content
 */
function parseList(content: string | undefined): string[] {
	if (!content) return [];

	const items: string[] = [];
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("- ")) {
			items.push(trimmed.slice(2));
		}
	}
	return items;
}

/**
 * Extract numbered list items (1. Foo, 2. Bar)
 */
function parseNumberedList(content: string | undefined): string[] {
	if (!content) return [];
	const items: string[] = [];
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		const match = trimmed.match(/^\d+\.\s+(.+)/);
		if (match) {
			items.push(match[1]);
		}
	}
	return items;
}

/**
 * Parse TELOS section into structured items
 */
function parseTelos(content: string | undefined): string[] {
	if (!content) return [];

	const items: string[] = [];
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		// Match lines like "- P0: description" or "- M1: description"
		if (trimmed.match(/^-\s*[PMG]\d*:/)) {
			items.push(trimmed.slice(2)); // Remove "- " prefix
		}
	}
	return items;
}

/**
 * Parse PROVENANCE section into per-field receipts
 * Line format: `- field | source | asOf | attribution`
 */
function parseProvenance(content: string | undefined): Record<string, ProvenanceEntry> {
	const map: Record<string, ProvenanceEntry> = {};
	if (!content) return map;

	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("- ")) continue;
		const parts = trimmed.slice(2).split("|").map((p) => p.trim());
		if (parts.length !== 4) continue;
		map[parts[0]] = { source: parts[1], asOf: parts[2], attribution: parts[3] };
	}
	return map;
}

/**
 * Extract last updated date from daemon.md footer
 */
function parseLastUpdated(content: string): string {
	const match = content.match(/\*Last updated:\s*(\d{4}-\d{2}-\d{2})\*/);
	return match ? match[1] : new Date().toISOString().slice(0, 10);
}

/**
 * Transform raw sections into DaemonData
 */
function transformToDaemonData(sections: DaemonSections, rawContent: string): DaemonData {
	return {
		about: sections.ABOUT || "",
		mission: sections.MISSION || "",
		telos: parseTelos(sections.TELOS),
		currentLocation: sections.CURRENT_LOCATION || "",
		philosophy: sections.PHILOSOPHY || "",
		whatImBuilding: parseList(sections.WHAT_IM_BUILDING),
		whoIAm: sections.WHO_I_AM || "",
		preferences: parseList(sections.PREFERENCES),
		dailyRoutine: sections.DAILY_ROUTINE ? [sections.DAILY_ROUTINE] : [],
		favoriteBooks: parseList(sections.FAVORITE_BOOKS),
		favoriteMovies: parseList(sections.FAVORITE_MOVIES),
		favoriteTv: parseList(sections.FAVORITE_TV),
		projects: parseList(sections.PROJECTS),
		resume: sections.RESUME || "",
		contact: sections.CONTACT || "",
		lastUpdated: parseLastUpdated(rawContent),
		flowLaws: parseNumberedList(sections.FLOW_LAWS),
		breadcrumbs: sections.BREADCRUMBS || "",
		music: parseList(sections.MUSIC),
		writing: parseList(sections.WRITING),
		youtube: parseList(sections.YOUTUBE),
		culturalAiCalibration: sections.CULTURAL_AI_CALIBRATION || "",
		voice: sections.VOICE || "",
		provenance: parseProvenance(sections.PROVENANCE),
	};
}

/**
 * Extract hero-specific data
 */
function extractHeroData(sections: DaemonSections): HeroData {
	const missionLines = (sections.MISSION || "").split(".");

	return {
		tagline: "The Context You Keep",
		location: sections.CURRENT_LOCATION || "",
		subtitle: missionLines[0] ? missionLines[0].trim() + "." : "",
	};
}

/**
 * Generate TypeScript output file
 */
function generateOutput(data: DaemonData, heroData: HeroData, sourcePath: string): string {
	const generatedAt = new Date().toISOString();
	return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 *
 * Generated from: ${sourcePath}
 * Parser: scripts/parse-daemon.ts
 * To update, edit your daemon.md and run: bun run parse-daemon
 *
 * Generated: ${generatedAt}
 */

import type { DaemonData, HeroData } from "../types/daemon.types";

export const daemonData: DaemonData = ${JSON.stringify(data, null, "\t")};

export const heroData: HeroData = ${JSON.stringify(heroData, null, "\t")};

/**
 * ISO timestamp this snapshot was generated. Surfaced at call time (T-100) as
 * provenance so callers can see how fresh the frozen data is.
 */
export const generatedAt = ${JSON.stringify(generatedAt)};

/**
 * Tool count for dashboard (matches MCP server tools)
 */
export const toolCount = 14;
`;
}

// Main execution
async function main() {
	console.log("Parsing daemon.md...");

	// Try primary path, fall back to example template
	let sourcePath = DAEMON_MD_PATH;
	let file = Bun.file(DAEMON_MD_PATH);

	if (!(await file.exists())) {
		console.log(`Primary path not found: ${DAEMON_MD_PATH}`);
		console.log(`Falling back to: ${FALLBACK_PATH}`);
		sourcePath = FALLBACK_PATH;
		file = Bun.file(FALLBACK_PATH);

		if (!(await file.exists())) {
			console.error(`Error: Neither ${DAEMON_MD_PATH} nor ${FALLBACK_PATH} found`);
			console.error("Create your daemon.md at ~/.config/daemon/daemon.md");
			console.error("See docs/SETUP.md for instructions.");
			process.exit(1);
		}
	}

	console.log(`Source: ${sourcePath}`);
	const content = await file.text();

	// Parse sections
	const sections = parseDaemonMd(content);
	console.log(`Found ${Object.keys(sections).length} sections`);

	// Transform data
	const daemonData = transformToDaemonData(sections, content);
	const heroData = extractHeroData(sections);

	// Ensure output directory exists
	await Bun.$`mkdir -p ${OUTPUT_DIR}`.quiet();

	// Write output
	const output = generateOutput(daemonData, heroData, sourcePath);
	await Bun.write(OUTPUT_PATH, output);

	console.log(`Generated: ${OUTPUT_PATH}`);
	console.log(`  - ${daemonData.favoriteBooks.length} books`);
	console.log(`  - ${daemonData.favoriteMovies.length} movies`);
	console.log(`  - ${daemonData.telos.length} TELOS items`);
	console.log(`  - ${daemonData.whatImBuilding.length} projects`);
}

main();
