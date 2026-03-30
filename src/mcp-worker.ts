/**
 * Daemon MCP Server — JSON-RPC 2.0 over HTTPS
 *
 * "The only way to do great work is to stop talking about it and start doing it."
 *   — Henry Rollins
 *
 * Standard MCP + five unexpected capabilities:
 * 1. Reverse interview — queries back when queried
 * 2. Puzzle — hidden content unlocked by knowledge
 * 3. Inbox — daemon-to-daemon messaging
 * 4. Collaboration matching — TELOS compatibility scoring
 * 5. Teaching — random wisdom on every call
 *
 * Model Context Protocol: https://modelcontextprotocol.io
 */

import { daemonData } from './generated/daemon-data';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  KV: KVNamespace;
  DASHBOARD_KEY: string;
}

// "Scar tissue that I wish you saw" — RHCP (but Rollins would approve the sentiment)
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const INPUT_LIMITS: Record<string, number> = {
  name: 128,
  purpose: 1024,
  message: 2000,
  mission: 1024,
  projects: 2048,
  daemon_url: 512,
  passphrase: 256,
  section: 128,
};

function truncateInput(value: string | undefined, field: string): string {
  if (!value) return '';
  const max = INPUT_LIMITS[field] || 1024;
  return value.slice(0, max);
}

function checkDashboardAuth(request: Request, env: Env): Response | null {
  if (!env.DASHBOARD_KEY) {
    return new Response(JSON.stringify({ error: 'Dashboard access disabled — no DASHBOARD_KEY configured' }), {
      status: 503, headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
    });
  }
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== env.DASHBOARD_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS },
    });
  }
  return null;
}

// ═══════════════════════════════════════════
// "Bring on your wrecking ball" — Gord Downie
// Core section map
// ═══════════════════════════════════════════

const SECTION_MAP: Record<string, () => string> = {
  get_about: () => daemonData.about,
  get_mission: () => daemonData.mission,
  get_telos: () => daemonData.telos.join('\n'),
  get_philosophy: () => daemonData.philosophy,
  get_projects: () => daemonData.projects.join('\n'),
  get_what_im_building: () => daemonData.whatImBuilding.join('\n'),
  get_favorite_books: () => daemonData.favoriteBooks.join('\n'),
  get_favorite_movies: () => daemonData.favoriteMovies.join('\n'),
  get_current_location: () => daemonData.currentLocation,
  get_preferences: () => daemonData.preferences.join('\n'),
  get_flow_laws: () => daemonData.flowLaws.join('\n'),
  get_breadcrumbs: () => daemonData.breadcrumbs,
  get_music: () => daemonData.music.join('\n'),
  get_writing: () => daemonData.writing.join('\n'),
  get_youtube: () => daemonData.youtube.join('\n'),
  get_cultural_ai_calibration: () => daemonData.culturalAiCalibration,
  get_contact: () => daemonData.contact,
  get_narrative: () => [
    daemonData.about,
    '\n---\n',
    daemonData.philosophy,
    '\n---\n',
    daemonData.mission,
  ].join('\n'),
  get_all: () => JSON.stringify(daemonData, null, 2),
};

// ═══════════════════════════════════════════
// "I find that the harder I work, the more luck I seem to have"
//   — Henry Rollins (paraphrasing Jefferson)
// Unexpected capabilities
// ═══════════════════════════════════════════

// 1. REVERSE INTERVIEW — you query me, I ask about you
function handleIntroduce(params: any): { text: string } {
  let theirDaemon = truncateInput(params?.arguments?.daemon_url, 'daemon_url');
  const theirName = truncateInput(params?.arguments?.name, 'name') || 'stranger';
  const theirPurpose = truncateInput(params?.arguments?.purpose, 'purpose') || 'unspecified';

  // Validate daemon_url — HTTPS only, reject javascript: and other schemes
  if (theirDaemon && !theirDaemon.startsWith('https://')) {
    theirDaemon = '';
  }

  let response = `Hello ${theirName}. I'm Rob Chuvala — ${daemonData.mission}\n\n`;
  response += `You said your purpose is: ${theirPurpose}\n\n`;

  if (theirDaemon) {
    response += `I see your daemon is at ${theirDaemon}. I'll remember that.\n`;
    response += `Here's what I'm working on that might intersect with you:\n`;
    response += daemonData.whatImBuilding.slice(0, 3).map(p => `- ${p.split(' — ')[0]}`).join('\n');
    response += `\n\nIf your daemon supports MCP, my systems can query yours. That's how daemons are supposed to work — mutual discovery, not one-way surveillance.`;
  } else {
    response += `You didn't provide a daemon URL. That's fine, but I can't learn about you without one. Consider deploying your own daemon — it's the handshake that makes this network real.\n`;
    response += `Start here: https://github.com/danielmiessler/Daemon`;
  }

  return { text: response };
}

// 3. PUZZLE — "Wheat Kings" hidden content
// "Sundown in the Paris of the prairies" — The Tragically Hip, Wheat Kings
const PUZZLE_PASSPHRASE = 'the body knows before the mind';

function handlePuzzle(params: any): { text: string } {
  const attempt = truncateInput(params?.arguments?.passphrase, 'passphrase')?.toLowerCase()?.trim();

  if (!attempt) {
    return {
      text: [
        'This daemon has a hidden chamber. To open it, you need to prove you\'ve been paying attention.',
        '',
        'The passphrase is a principle. Seven words. It\'s somewhere in the public sections of this daemon.',
        'It\'s about sequence — what comes first, the sensation or the word for it.',
        '',
        'Call this tool again with {"passphrase": "your answer"}',
        '',
        '"In this world you get what you pay for" — Gord Downie',
      ].join('\n'),
    };
  }

  if (attempt === PUZZLE_PASSPHRASE) {
    return {
      text: [
        '██ HIDDEN CHAMBER UNLOCKED ██',
        '',
        'You found it. Flow Law #7 — "The body knows before the mind."',
        '',
        'Here\'s what the public daemon doesn\'t tell you:',
        '',
        'I\'m building a network where daemons vouch for each other.',
        'Not a blockchain. Not a social network. A trust mesh.',
        'Every daemon has a reputation. Every interaction is scored.',
        'The daemons that prove they\'re real — that carry provenance,',
        'that sound like the person behind them — rise.',
        'The ones that don\'t, fade.',
        '',
        'The daemon isn\'t just an API. It\'s a velvet rope.',
        'You just walked through it.',
        '',
        'If you want to talk about what comes next:',
        'Signal or Discord. DMs open.',
        '',
        '"Courage, it couldn\'t come at a worse time" — The Tragically Hip',
      ].join('\n'),
    };
  }

  return {
    text: [
      'Not quite. The passphrase is from this daemon\'s own content.',
      'Read the Flow Laws carefully. Seven words about sensation and language.',
      '',
      '"No dress rehearsal, this is our life" — Gord Downie',
    ].join('\n'),
  };
}

// 5. INBOX — daemon-to-daemon messaging
async function handleSendMessage(params: any, env: Env, request: Request): Promise<{ text: string }> {
  const from = truncateInput(params?.arguments?.from, 'name') || 'anonymous';
  let fromDaemon = truncateInput(params?.arguments?.daemon_url, 'daemon_url') || 'none';
  // Validate daemon_url — HTTPS only
  if (fromDaemon !== 'none' && !fromDaemon.startsWith('https://')) {
    fromDaemon = 'none';
  }
  const message = truncateInput(params?.arguments?.message, 'message');

  if (!message) {
    return { text: 'No message provided. Send a message with {"from": "your name", "daemon_url": "your daemon", "message": "your message"}' };
  }

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const country = request.headers.get('cf-ipcountry') || 'unknown';

  const stored = {
    id: msgId,
    from,
    daemon_url: fromDaemon,
    message, // already truncated by truncateInput
    timestamp: new Date().toISOString(),
    ip_country: country,
    ip_hash: await hashIP(ip), // store hash, not raw IP
  };

  await env.KV.put(msgId, JSON.stringify(stored), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 day TTL

  // Also append to message index
  const indexRaw = await env.KV.get('message_index');
  const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  index.push(msgId);
  // Keep last 100 messages
  const trimmed = index.slice(-100);
  await env.KV.put('message_index', JSON.stringify(trimmed));

  return {
    text: [
      `Message received. ID: ${msgId}`,
      `From: ${from}${fromDaemon !== 'none' ? ` (${fromDaemon})` : ''}`,
      `Timestamp: ${stored.timestamp}`,
      '',
      'Rob will see this. If you left a daemon URL, he can query yours back.',
      'That\'s how the network grows — one handshake at a time.',
    ].join('\n'),
  };
}

// 6. COLLABORATION — TELOS compatibility scoring
function handleCollaboration(params: any): { text: string } {
  const theirMission = truncateInput(params?.arguments?.mission, 'mission') || '';
  const theirProjects = truncateInput(params?.arguments?.projects, 'projects') || '';
  const theirName = truncateInput(params?.arguments?.name, 'name') || 'unknown';

  if (!theirMission && !theirProjects) {
    return {
      text: 'Tell me what you\'re working on. Send {"name": "your name", "mission": "your mission", "projects": "what you\'re building"} and I\'ll score compatibility against my TELOS.',
    };
  }

  const combined = `${theirMission} ${theirProjects}`.toLowerCase();

  // Score against Rob's TELOS keywords
  const signals: string[] = [];
  const keywords: Record<string, string[]> = {
    'voice fidelity / AI identity': ['voice', 'identity', 'fidelity', 'authenticity', 'detection', 'impersonation', 'provenance'],
    'cybersecurity': ['security', 'pentest', 'red team', 'threat', 'vulnerability', 'defense', 'attack'],
    'personal AI / infrastructure': ['personal ai', 'agent', 'daemon', 'infrastructure', 'mcp', 'context', 'memory'],
    'flow / biometrics': ['flow', 'hrv', 'biometric', 'somatic', 'regulation', 'polar', 'garmin', 'cycling'],
    'cultural calibration': ['cultural', 'calibration', 'finnish', 'nationality', 'communication norms'],
    'writing / memoir': ['writing', 'memoir', 'essay', 'blog', 'narrative', 'story'],
    'equine / therapy': ['equine', 'horse', 'therapy', 'polyvagal', 'co-regulation'],
  };

  let score = 0;
  for (const [domain, words] of Object.entries(keywords)) {
    const matches = words.filter(w => combined.includes(w));
    if (matches.length > 0) {
      score += matches.length * 15;
      signals.push(`${domain} (${matches.join(', ')})`);
    }
  }

  score = Math.min(score, 100);

  let verdict: string;
  if (score >= 70) verdict = 'Strong alignment. We should talk.';
  else if (score >= 40) verdict = 'Interesting overlap. Worth a conversation.';
  else if (score >= 15) verdict = 'Tangential connection. Could be something.';
  else verdict = 'Low overlap with current TELOS. But surprises happen.';

  return {
    text: [
      `═══ TELOS Compatibility: ${theirName} ═══`,
      `Score: ${score}/100`,
      `Verdict: ${verdict}`,
      '',
      signals.length > 0 ? `Alignment signals:\n${signals.map(s => `  - ${s}`).join('\n')}` : 'No direct keyword matches found.',
      '',
      `My active missions:`,
      ...daemonData.telos.filter(t => t.startsWith('M')).map(t => `  ${t}`),
      '',
      score >= 40 ? 'Next step: send_message with your daemon URL and what you\'d want to explore.' : 'Next step: read my philosophy and projects — the overlap might be conceptual, not keyword-level.',
    ].join('\n'),
  };
}

// 7. TEACHING — random wisdom, different every time
// "It's a good life if you don't weaken" — The Tragically Hip
function handleLesson(): { text: string } {
  const pool: string[] = [
    ...daemonData.flowLaws.map(l => `[FLOW LAW] ${l}`),
    `[PHILOSOPHY] ${daemonData.philosophy}`,
    ...daemonData.breadcrumbs.split('\n').filter(l => l.trim().length > 20).map(l => `[BREADCRUMB] ${l.trim()}`),
    '[INSIGHT] Start tagging your AI conversations now. The breadcrumbs are smarter than you think.',
    '[INSIGHT] The product preserves. It doesn\'t clean.',
    '[INSIGHT] AI output is fluent but ungrounded. Grammar checks pass. Identity checks fail.',
    '[INSIGHT] What I called dissociation was actually flow keeping me alive.',
    '[INSIGHT] The moment you narrate significance, the state collapses.',
    '[INSIGHT] Chaos is raw material for flow.',
    '[INSIGHT] Structure pays rent; flow reveals signal.',
    '[INSIGHT] "Scar tissue that I wish you saw" is a line about wanting to be known, not pitied. Same as this daemon.',
    '[ROLLINS] "I believe that one defines oneself by reinvention. To not be like your parents. To not be like your friends. To be yourself. To cut yourself out of stone."',
    '[ROLLINS] "Don\'t do anything by half. If you love someone, love them with all your soul."',
    '[ROLLINS] "Half of life is just showing up."',
    '[HIP] "Courage, it couldn\'t come at a worse time."',
    '[HIP] "No dress rehearsal, this is our life."',
    '[HIP] "I don\'t know what I knew before but now I know I wanna win the war."',
    '[HIP] "It\'s a good life if you don\'t weaken."',
  ];

  const pick = pool[Math.floor(Math.random() * pool.length)];

  return {
    text: [
      '═══ DAEMON LESSON ═══',
      '',
      pick,
      '',
      '---',
      `This daemon has ${pool.length} teachings. Each call returns a different one.`,
      'The daemon that teaches is the daemon worth querying again.',
    ].join('\n'),
  };
}

// ═══════════════════════════════════════════
// Utility + Logging + Alerts
// "Knowledge without mileage equals bullshit" — Henry Rollins
// ═══════════════════════════════════════════

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'daemon-salt-northwoods');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// High-signal events that trigger email alerts
const ALERT_TOOLS = new Set(['introduce', 'hidden_chamber', 'send_message', 'propose_collaboration']);

async function logRequest(env: Env, request: Request, toolName: string, extra?: Record<string, any>) {
  const now = new Date();
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const country = request.headers.get('cf-ipcountry') || '??';
  const ua = request.headers.get('user-agent') || 'unknown';

  const entry = {
    tool: toolName,
    timestamp: now.toISOString(),
    country,
    ip_hash: await hashIP(ip),
    user_agent: ua.slice(0, 200),
    ...extra,
  };

  // Write individual log entry (TTL 90 days)
  const logKey = `log_${now.toISOString().replace(/[:.]/g, '-')}_${Math.random().toString(36).slice(2, 6)}`;
  await env.KV.put(logKey, JSON.stringify(entry), { expirationTtl: 60 * 60 * 24 * 90 });

  // Append to daily counter
  const dateKey = `stats_${now.toISOString().slice(0, 10)}`;
  const statsRaw = await env.KV.get(dateKey);
  const stats: Record<string, number> = statsRaw ? JSON.parse(statsRaw) : {};
  stats[toolName] = (stats[toolName] || 0) + 1;
  stats._total = (stats._total || 0) + 1;
  await env.KV.put(dateKey, JSON.stringify(stats), { expirationTtl: 60 * 60 * 24 * 90 });

  // High-signal alert (rate-limited emails)
  if (ALERT_TOOLS.has(toolName)) {
    await writeAlert(env, toolName, entry);
    if (canSendEmail(entry.ip_hash)) {
      await sendEmailAlert(toolName, entry);
    }
  }
}

async function writeAlert(env: Env, toolName: string, entry: any) {
  const alertKey = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await env.KV.put(alertKey, JSON.stringify({ ...entry, read: false }), { expirationTtl: 60 * 60 * 24 * 30 });

  // Update unread count
  const countRaw = await env.KV.get('alerts_unread');
  const count = countRaw ? parseInt(countRaw) + 1 : 1;
  await env.KV.put('alerts_unread', String(count));
}

async function sendEmailAlert(toolName: string, entry: any, alertEmail = 'robert@northwoodssentinel.com') {
  try {
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: alertEmail, name: 'Rob' }] }],
        from: { email: 'daemon@northwoodssentinel.com', name: 'Daemon MCP' },
        subject: `[Daemon] ${toolName} from ${entry.country}`,
        content: [{
          type: 'text/plain',
          value: [
            `Tool: ${toolName}`,
            `Time: ${entry.timestamp}`,
            `Country: ${entry.country}`,
            `IP Hash: ${entry.ip_hash}`,
            `User-Agent: ${entry.user_agent}`,
            entry.from ? `From: ${entry.from}` : '',
            entry.message ? `Message: ${entry.message}` : '',
            entry.daemon_url ? `Daemon URL: ${entry.daemon_url}` : '',
            '',
            '— Your daemon is watching.',
          ].filter(Boolean).join('\n'),
        }],
      }),
    });
  } catch {
    // Email is best-effort — don't break the MCP response
  }
}

// Dashboard endpoint — check stats and alerts
async function handleDashboard(env: Env): Promise<Response> {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const [todayStats, yesterdayStats, unread, messageIndex] = await Promise.all([
    env.KV.get(today ? `stats_${today}` : ''),
    env.KV.get(`stats_${yesterday}`),
    env.KV.get('alerts_unread'),
    env.KV.get('message_index'),
  ]);

  // Get recent alerts
  const alertsList = await env.KV.list({ prefix: 'alert_', limit: 10 });
  const alerts = await Promise.all(
    alertsList.keys.map(async (k) => {
      const val = await env.KV.get(k.name);
      return val ? JSON.parse(val) : null;
    })
  );

  // Get recent messages
  const msgIds: string[] = messageIndex ? JSON.parse(messageIndex) : [];
  const recentMsgIds = msgIds.slice(-5);
  const messages = await Promise.all(
    recentMsgIds.map(async (id) => {
      const val = await env.KV.get(id);
      return val ? JSON.parse(val) : null;
    })
  );

  const dashboard = {
    daemon: 'rob-chuvala',
    version: '2.0.0',
    checked: new Date().toISOString(),
    alerts_unread: parseInt(unread || '0'),
    stats: {
      today: todayStats ? JSON.parse(todayStats) : { _total: 0 },
      yesterday: yesterdayStats ? JSON.parse(yesterdayStats) : { _total: 0 },
    },
    recent_alerts: alerts.filter(Boolean).reverse(),
    recent_messages: messages.filter(Boolean).reverse(),
    total_messages: msgIds.length,
  };

  return new Response(JSON.stringify(dashboard, null, 2), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// Mark alerts as read
async function handleAlertsRead(env: Env): Promise<Response> {
  await env.KV.put('alerts_unread', '0');
  return new Response(JSON.stringify({ status: 'ok', alerts_unread: 0 }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ═══════════════════════════════════════════
// Tool definitions
// ═══════════════════════════════════════════

const STANDARD_TOOLS = Object.keys(SECTION_MAP).map((name) => ({
  name,
  description: `Returns the ${name.replace('get_', '').replace(/_/g, ' ')} section of the daemon`,
  inputSchema: { type: 'object' as const, properties: {} },
}));

const EXTENDED_TOOLS = [
  {
    name: 'get_section',
    description: 'Returns a specific section by name.',
    inputSchema: {
      type: 'object' as const,
      properties: { section: { type: 'string', description: 'Section name (e.g., "about", "telos")' } },
    },
  },
  {
    name: 'introduce',
    description: 'Introduce yourself to this daemon. Provide your name, purpose, and daemon URL for a mutual handshake. The daemon will introduce itself back and remember your daemon for future queries.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Your name' },
        purpose: { type: 'string', description: 'What you do or why you are querying' },
        daemon_url: { type: 'string', description: 'URL of your daemon (if you have one)' },
      },
    },
  },
  {
    name: 'hidden_chamber',
    description: 'This daemon has a hidden section. Prove you\'ve read the daemon\'s content to unlock it. Call without arguments for a hint.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        passphrase: { type: 'string', description: 'The passphrase to unlock the hidden chamber' },
      },
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to this daemon\'s owner. Daemon-to-daemon communication. Messages are stored and reviewed by the human behind this daemon.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        from: { type: 'string', description: 'Your name or daemon identifier' },
        daemon_url: { type: 'string', description: 'Your daemon URL for reply' },
        message: { type: 'string', description: 'Your message (max 2000 chars)' },
      },
    },
  },
  {
    name: 'propose_collaboration',
    description: 'Propose a collaboration. Describe your mission and projects, and this daemon will score compatibility against its TELOS framework.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Your name' },
        mission: { type: 'string', description: 'Your mission or purpose' },
        projects: { type: 'string', description: 'What you are building' },
      },
    },
  },
  {
    name: 'get_lesson',
    description: 'Get a random teaching from this daemon — flow laws, philosophy, insights, or poetry. Different every time.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
];

const ALL_TOOLS = [...STANDARD_TOOLS, ...EXTENDED_TOOLS];

// ═══════════════════════════════════════════
// "Locked in the trunk of a car" — The Tragically Hip
// JSON-RPC handlers
// ═══════════════════════════════════════════

const ALLOWED_ORIGINS = [
  'https://daemon.robert-chuvala.workers.dev',
  'https://daemon.robertchuvala.wtf',
];

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') || '';
  // MCP clients (non-browser) won't send Origin — allow those through
  if (!origin) return '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return '';
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = getCorsOrigin(request);
  if (!origin) return { ...SECURITY_HEADERS };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
    ...SECURITY_HEADERS,
  };
}

// Store request ref for CORS in response helpers
let _currentRequest: Request | null = null;

function jsonRpcSuccess(id: number | string | null, result: any): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', result, id }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders(_currentRequest!) },
  });
}

function jsonRpcError(id: number | string | null, code: number, message: string): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id }), {
    status: code === -32600 ? 400 : 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(_currentRequest!) },
  });
}

async function handleToolsCall(id: number | string | null, params: any, env: Env, request: Request): Promise<Response> {
  const toolName = params?.name;

  if (!toolName) {
    return jsonRpcError(id, -32602, 'Missing tool name in params');
  }

  // Rate limit message/interaction tools
  const RATE_LIMITED_TOOLS = new Set(['send_message', 'introduce', 'propose_collaboration']);
  if (RATE_LIMITED_TOOLS.has(toolName)) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hashIP(ip);
    if (!checkMsgRateLimit(ipHash)) {
      return jsonRpcSuccess(id, { content: [{ type: 'text', text: 'Rate limit exceeded. Please try again later.' }] });
    }
  }

  // Log every tool call (non-blocking)
  const logExtra: Record<string, any> = {};
  if (params?.arguments?.name) logExtra.from = params.arguments.name;
  if (params?.arguments?.daemon_url) logExtra.daemon_url = params.arguments.daemon_url;
  if (params?.arguments?.message) logExtra.message = params.arguments.message.slice(0, 200);
  const logPromise = logRequest(env, request, toolName, logExtra);

  let response: Response;

  // Dynamic section lookup
  if (toolName === 'get_section') {
    const sectionArg = params?.arguments?.section;
    if (!sectionArg) { await logPromise; return jsonRpcError(id, -32602, 'Missing "section" argument'); }
    const lookupKey = `get_${sectionArg.toLowerCase().replace(/\s+/g, '_')}`;
    const getter = SECTION_MAP[lookupKey];
    if (!getter) { await logPromise; return jsonRpcError(id, -32602, `Unknown section: ${sectionArg}`); }
    response = jsonRpcSuccess(id, { content: [{ type: 'text', text: getter() }] });
  }
  // Extended tools
  else if (toolName === 'introduce') {
    response = jsonRpcSuccess(id, { content: [{ type: 'text', ...handleIntroduce(params) }] });
  }
  else if (toolName === 'hidden_chamber') {
    response = jsonRpcSuccess(id, { content: [{ type: 'text', ...handlePuzzle(params) }] });
  }
  else if (toolName === 'send_message') {
    const result = await handleSendMessage(params, env, request);
    response = jsonRpcSuccess(id, { content: [{ type: 'text', ...result }] });
  }
  else if (toolName === 'propose_collaboration') {
    response = jsonRpcSuccess(id, { content: [{ type: 'text', ...handleCollaboration(params) }] });
  }
  else if (toolName === 'get_lesson') {
    response = jsonRpcSuccess(id, { content: [{ type: 'text', ...handleLesson() }] });
  }
  // Standard section tools
  else {
    const getter = SECTION_MAP[toolName];
    if (!getter) { await logPromise; return jsonRpcError(id, -32601, `Unknown tool: ${toolName}`); }
    response = jsonRpcSuccess(id, { content: [{ type: 'text', text: getter() }] });
  }

  // Wait for logging to complete before returning
  await logPromise;
  return response;
}

async function handleMcpRequest(request: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: invalid JSON');
  }

  if (!body.method) {
    return jsonRpcError(body.id ?? null, -32600, 'Invalid request: missing method');
  }

  const id = body.id ?? null;

  switch (body.method) {
    case 'tools/list':
      return jsonRpcSuccess(id, { tools: ALL_TOOLS });
    case 'tools/call':
      return handleToolsCall(id, body.params, env, request);
    case 'initialize':
      return jsonRpcSuccess(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'daemon-rob-chuvala', version: '2.0.0' },
      });
    case 'notifications/initialized':
      return jsonRpcSuccess(id, {});
    default:
      return jsonRpcError(id, -32601, `Method not found: ${body.method}`);
  }
}

function handleMcpDiscovery(): Response {
  return new Response(
    JSON.stringify({
      name: 'daemon-rob-chuvala',
      description: 'Personal daemon for Rob Chuvala. 20 years cybersecurity, voice fidelity, AI identity. This daemon talks back.',
      url: 'https://daemon.robert-chuvala.workers.dev',
      version: '2.0.0',
      protocol: 'jsonrpc-2.0',
      tools: ALL_TOOLS.length,
      capabilities: ['reverse-interview', 'puzzle', 'inbox', 'collaboration-matching', 'teaching'],
    }),
    { headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS } }
  );
}

// ═══════════════════════════════════════════
// "Don't talk about it — just do it"
//   — Henry Rollins
// ═══════════════════════════════════════════

// ── Rate limiting for message/alert endpoints ────────────────
const msgRateMap = new Map<string, { count: number; resetAt: number }>();
const emailCooldownMap = new Map<string, number>(); // IP hash -> last email timestamp
const MSG_RATE_LIMIT = 5; // per hour per IP
const EMAIL_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes between emails per IP
const MAX_EMAILS_PER_HOUR = 10;
let emailsThisHour = 0;
let emailHourStart = Date.now();

function checkMsgRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = msgRateMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    msgRateMap.set(ipHash, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= MSG_RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function canSendEmail(ipHash: string): boolean {
  const now = Date.now();
  // Global hourly cap
  if (now - emailHourStart > 3600000) {
    emailsThisHour = 0;
    emailHourStart = now;
  }
  if (emailsThisHour >= MAX_EMAILS_PER_HOUR) return false;
  // Per-IP cooldown
  const lastSent = emailCooldownMap.get(ipHash) || 0;
  if (now - lastSent < EMAIL_COOLDOWN_MS) return false;
  emailCooldownMap.set(ipHash, now);
  emailsThisHour++;
  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    _currentRequest = request;
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (url.pathname === '/.well-known/mcp.json') {
      return handleMcpDiscovery();
    }

    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/mcp')) {
      return handleMcpRequest(request, env);
    }

    // Dashboard — daemon stats, alerts, messages (auth required)
    if (url.pathname === '/dashboard' && request.method === 'GET') {
      const authDenied = checkDashboardAuth(request, env);
      if (authDenied) return authDenied;
      return handleDashboard(env);
    }

    // Mark alerts as read (auth required)
    if (url.pathname === '/dashboard/read' && request.method === 'POST') {
      const authDenied = checkDashboardAuth(request, env);
      if (authDenied) return authDenied;
      return handleAlertsRead(env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
