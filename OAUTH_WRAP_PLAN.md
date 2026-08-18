# Daemon OAuth Wrap — v0 Plan

Drafted 2026-06-24 by Margin after Rob green-lit `workers-oauth-provider`. Nothing here has been executed. This is the artifact for Rob to mark up before any install, KV namespace creation, or deploy.

## What changes structurally

The daemon today is `export default { fetch }` in `src/mcp-worker.ts`, 873 lines, one auth shape — `Authorization: Bearer <DASHBOARD_KEY>` checked manually in `checkDashboardAuth()` for dashboard routes only. Everything else open. The MCP tool surface has 25 endpoints and no per-caller identity.

After the wrap, the entrypoint becomes `export default new OAuthProvider({...})`. The existing fetch handler moves into the `apiHandler` slot as a class. Astro marketing pages stay reachable through the `defaultHandler` path. DASHBOARD_KEY keeps working in parallel for the dashboard route during the transition — the OAuth provider only intercepts paths matching its declared `apiRoute` prefixes, so legacy callers continue functioning until you cut them over.

## Scope design

This is the first decision and the only one with real switching cost. Once a scope name ships and a client has a grant against it, renaming costs real work — every client's stored grants reference the old name.

Strawman:

| Scope | Covers | Public? |
|-------|--------|---------|
| `daemon.read.public` | get_about, get_mission, get_telos, get_philosophy, get_favorite_*, get_what_im_building, get_projects | yes |
| `daemon.read.work` | active projects, current building, devlog | yes |
| `daemon.write.inbox` | leave a message to Rob's daemon | yes |
| `daemon.read.weight` | weight tracker (currently WEIGHT_KEY-gated) | no — principal only |
| `daemon.expertise.fleet` | G8 tier 1 — fleet auto-response, no Rob | future |
| `daemon.expertise.realtime` | G8 tier 2 — Rob real-time sync | future |
| `daemon.expertise.async` | G8 tier 3 — Rob async batched | future |

Structurally excluded from OAuth at any scope: FINANCES, HEALTH (except the weight tracker that's already principal-gated), CONTACTS, OUR_STORY, OPINIONS. These never get a scope. The daemon doesn't serve them and never should — PROJECTS.md is clear on that. Naming them here so the exclusion is explicit in the audit trail.

## OAuthProvider config

```ts
export default new OAuthProvider({
  apiRoute: ['/mcp/', '/api/'],
  apiHandler: McpApiHandler,         // existing handler moved into a class
  defaultHandler: { fetch: astroHandler },  // marketing + dashboard
  authorizeEndpoint: '/oauth/authorize',
  tokenEndpoint: '/oauth/token',
  disallowPublicClientRegistration: true,
  allowPlainPKCE: false,
  scopesSupported: [
    'daemon.read.public',
    'daemon.read.work',
    'daemon.write.inbox',
  ],
  accessTokenTTL: 3600,
  refreshTokenTTL: 2592000,
});
```

Two non-default settings worth naming. `disallowPublicClientRegistration: true` means nobody can register a client until you flip it off — the v0 surface is reachable but unregisterable, which is the right posture before public launch. `allowPlainPKCE: false` forces S256, which is OAuth 2.1 best practice and we don't need backward compatibility with any legacy clients.

## KV namespace

New namespace required. Do not reuse the daemon KV (`901f02847dec42f18ed4dedf7054af08`). Token storage and daemon content should never share key space — different access patterns, different sensitivity, different deletion semantics. Running `wrangler kv:namespace create OAUTH_KV` creates the new namespace and prints the ID; that gets added as a second `[[kv_namespaces]]` binding in wrangler.toml. Deleting the namespace later forces re-auth on all clients but loses no daemon content.

## First client = Rob's own Claude.ai

Created manually via `OAUTH_PROVIDER.createClient()`, not the dynamic registration endpoint. The grant gets `props: { tier: 'principal', userId: 'rob-chuvala' }`. This is the proof-of-pattern client — it proves the auth flow works end-to-end without exposing the daemon to any third-party registration risk. Public dynamic registration stays off until the abuse model is explicit.

## Decisions owed before any deploy

Four things to mark up.

**Scope names.** The strawman above OK as-is, or different shape? The names will be baked into client grants once they ship, so the time to rename is now.

**First client identity.** Is v0 just Rob's own Claude.ai, or do you want a second non-Rob fleet member in scope from the start — CeeCee on the Mac, Caddie, or Mirror? Adding a fleet member on v0 proves the cross-instance auth case is real, not just a thought experiment.

**G8 scope reservation.** The three expertise tiers (`fleet`, `realtime`, `async`) need names you can live with for the G8 BRIDGE REVENUE launch. Naming them now means zero rename cost later. Skipping them means they get named under pressure when the launch is closer.

**Dashboard transition.** Keep DASHBOARD_KEY working in parallel for some number of weeks, then migrate the dashboard to OAuth, then remove the bearer-token path? Or do a single hard cutover? The parallel path is safer; the single cutover is cleaner.

## Security clear-eyes

A few risks worth naming explicitly so they don't surprise us mid-deploy.

The `props` blob is signed but its contents are visible to the API handler — that means no secrets in props, only tier markers and userId. Treat it like a non-sensitive routing header, not a credential store.

The library defaults `allowPlainPKCE` to true for backward compatibility with old clients. We don't need that compat, and plain PKCE offers no cryptographic protection. Set it to false explicitly.

`revokeExistingGrants` defaults to true, which means re-authorizing the same client revokes the old grant — that's the right behavior, keep the default.

During the transition, DASHBOARD_KEY and OAuth coexist. There's no collision because OAuthProvider only intercepts paths matching `apiRoute`; the dashboard path stays in the `defaultHandler` and continues checking the bearer token. The two systems run side by side until you cut the dashboard over.

Marketing pages stay public — Astro routes outside `/mcp/` and `/api/` flow through the default handler without any auth check.

## Garmin composition

When you said "this will help with Garmin too" — yes, and the path is the same library on a different Worker. Garmin-ingest currently lives on H-CLIVE-VPS (Hostinger 72.60.175.138 per the Leroy archive inventory) with hand-rolled auth. Three forward paths the OAuth provider unlocks.

First, move garmin-ingest to a CF Worker and wrap it with `OAuthProvider`. Each Garmin webhook source — your watch, your bike computer, any sync service — becomes a registered client with its own scope. Per-source revoke without rotating a shared secret.

Second, give each fleet member a per-scope read on biometric data. `biometric.read.hrv`, `biometric.read.sleep`, `biometric.read.weight`. Soma-stream and felt-sense-sessions become callers with their own grants. Mirror gets read-only HRV; somatic regulation tools get a fuller scope. No more "everyone with the bearer can read everything."

Third, the Karoo Connect IQ pattern. Apps on the bike computer that want to call your personal infra register as OAuth clients with their own grant. The bike computer doesn't share its credential with the phone, and the phone doesn't share its credential with the laptop.

Same pattern, same library, three Workers eventually — daemon, garmin-ingest, anything else you want to bring under sovereignty. The daemon wrap is the proof; Garmin is the second deploy that proves it composes.

## Execution sequence

Steps 1 through 6 are pure-local and reversible. Step 7 is a deploy to a new URL — also reversible by deleting the Worker. Step 10 is the only step that changes a URL anything else depends on.

1. You mark up this doc. Fix scope names. Pick first-client identity. Decide whether to reserve G8 names now. Pick dashboard transition shape.
2. `bun add @cloudflare/workers-oauth-provider` — installs the lib in the daemon project.
3. `wrangler kv:namespace create OAUTH_KV` — creates the OAuth state namespace, prints the ID, I add it to wrangler.toml.
4. Refactor `src/mcp-worker.ts` to expose `McpApiHandler` as a class and `astroHandler` as the default handler; new entrypoint = `new OAuthProvider({...})`.
5. Add a minimal `/oauth/authorize` consent route. No styling, no UI framework — just a "confirm this client wants daemon.read.public, OK/Cancel" page.
6. `wrangler dev` locally, smoke test with curl.
7. `wrangler deploy --name daemon-oauth-preview` to a preview URL — not the production daemon endpoint.
8. Create Rob's Claude.ai client manually via `OAUTH_PROVIDER.createClient()`, store the client_id + secret in 1Password.
9. Connect Claude.ai's MCP integration to the preview URL, run the full auth flow end-to-end, verify a tool call returns the expected `props.userId`.
10. Cut production over by switching the `daemon.robert-chuvala.workers.dev` route to point at the OAuth-wrapped Worker.

The split that matters: nothing live changes until step 10. Everything before that runs against a preview deploy and can be unwound by deleting the preview Worker and the OAUTH_KV namespace.
