# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [SemVer](https://semver.org/spec/v2.0.0.html)

## [Unreleased]

### Security
- `[local]` Removed re-tracked personal `daemon.md` from the repo tip (regression of the 2026-01 filter-repo scrub; re-added by later refresh commits). Added `daemon.md` to `.gitignore` so it cannot be re-tracked. History rewrite for the re-added commits pending owner decision.
- `[local]` Replaced `public/daemon.example.md` personal content with a generic placeholder persona — the template had drifted into a copy of the real daemon.md.

### Added
- `[local]` First-class `[VOICE]` section — the enforced writing-voice spec, served as `voice` so anything generating text as the principal can be scored against it.
- `[local]` Per-field `[PROVENANCE]` receipts (`- field | source | asOf | attribution`), parsed into a `provenance` map and served with `get_all`. Receipts, not vibes: every field names where it came from, when, and on whose authority.
- `[local]` T-100 freshness + provenance guard on canonical answers. Every section answer now carries `provenance` (`last_updated`, `generated_at`, `age_days`, `budget_days`) and a `stale` flag; content older than a 14-day budget is flagged `stale: true` with a loud warning (warned, never refused). Empty/whitespace sections now return `{ status: "unpopulated" }` instead of a blank string, so "missing fact" is distinguishable from "blank fact". New `get_freshness` MCP tool reports snapshot provenance and lists unpopulated sections. `/dashboard` now surfaces `content_last_updated` / `content_generated_at` / `content_age_days` / `content_stale`. Parser emits a `generatedAt` export. Pure freshness logic lives in `src/freshness.ts` with `bun test` coverage.
- `[local]` Body-weight tracking via two new MCP tools: `log_weight` (record a reading) and `get_weight_status` (return current, targets, trend). Auth-gated by `WEIGHT_KEY` env var. Targets configured via `WEIGHT_TARGET_STRETCH` / `WEIGHT_TARGET_SETTLE` (default 180 / 190 lb). Storage in KV with 5-year TTL on individual readings; index of the last 200 timestamps. Personal health data, not public — both read and write require auth.
- `[upstream]` XDG-compliant path resolution for daemon.md
- `[upstream]` Example template (`public/daemon.example.md`) for new users
- `[upstream]` Setup documentation (`docs/SETUP.md`) with configuration guide

### Changed
- `[upstream]` Parser reads from `~/.config/daemon/daemon.md` (XDG) instead of repo
- `[upstream]` Repo is now a clean framework - no personal data in history
- `[local]` CLAUDE.md updated to reflect new content architecture

### Removed
- Personal content from git history via filter-repo rewrite

## [2.0.0] - 2026-01-10

Build-time parser for single source of truth - dashboard and MCP server now derive from the same `daemon.md` file.

### Added
- `[upstream]` Build-time parser (`scripts/parse-daemon.ts`) generates TypeScript from `daemon.md`
- `[upstream]` Type definitions (`src/types/daemon.types.ts`) for parsed data
- `[upstream]` Architecture documentation (`docs/ARCHITECTURE.md`) with data flow diagrams
- `[upstream]` README links to architecture docs

### Changed
- `[upstream]` Dashboard imports from generated data instead of hardcoded values
- `[upstream]` Hero component imports location from generated data
- `[local]` Astro config uses env var for allowed hosts (removes internal hostnames from repo)

### Removed
- `[upstream]` Hardcoded data in `DaemonDashboard.tsx` and `Hero.tsx`

## [1.2.0] - 2026-01-09

TELOS page customization and dev environment setup.

### Changed
- `[local]` /telos page content replaced with 0xsalt's TELOS framework
- `[local]` Dev server binds to 0.0.0.0 with allowedHosts for tailscale access
- `[local]` Backlog/changelog items tagged `[local]` vs `[upstream]`

## [1.1.0] - 2026-01-09

Identity customization and deployment configuration.

### Added
- Branching strategy documented in CLAUDE.md
- Roadmap: "daemon.md as single source of truth" for upstream contribution

### Changed
- Identity content replaced in daemon.md, DaemonDashboard.tsx, Hero.tsx, cms/telos.md
- Deployment configured for Cloudflare Pages (daemon.saltedkeys.io)
- API docs updated with placeholder URLs
- Branding updated to "The Context You Keep"

## [1.0.1] - 2026-01-09

Fork setup and documentation.

### Added
- Architecture decision records (ADR-001)
- Project standards in CLAUDE.md
- Backlog tracking (docs/BACKLOG.md)
- Roadmap placeholder (docs/ROADMAP.md)

### Changed
- Git remote points to 0xsalt/daemon fork
- Upstream tracked as separate remote

## [1.0.0] - 2026-01-09

Initial fork from [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon).

Upstream had no releases; 1.0.0 establishes baseline. Includes Astro site, daemon.md identity format, dashboard, TELOS page, API docs, and Cloudflare Pages config.

See `docs/BACKLOG.md` for work items.

[Unreleased]: https://github.com/0xsalt/daemon/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/0xsalt/daemon/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/0xsalt/daemon/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/0xsalt/daemon/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/0xsalt/daemon/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/0xsalt/daemon/releases/tag/v1.0.0
