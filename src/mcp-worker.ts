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
  const theirDaemon = params?.arguments?.daemon_url;
  const theirName = params?.arguments?.name || 'stranger';
  const theirPurpose = params?.arguments?.purpose || 'unspecified';

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
  const attempt = params?.arguments?.passphrase?.toLowerCase()?.trim();

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
  const from = params?.arguments?.from || 'anonymous';
  const fromDaemon = params?.arguments?.daemon_url || 'none';
  const message = params?.arguments?.message;

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
    message: message.slice(0, 2000), // cap at 2000 chars
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
  const theirMission = params?.arguments?.mission || '';
  const theirProjects = params?.arguments?.projects || '';
  const theirName = params?.arguments?.name || 'unknown';

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
// Utility
// ═══════════════════════════════════════════

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'daemon-salt-northwoods');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonRpcSuccess(id: number | string | null, result: any): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', result, id }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function jsonRpcError(id: number | string | null, code: number, message: string): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', error: { code, message }, id }), {
    status: code === -32600 ? 400 : 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function handleToolsCall(id: number | string | null, params: any, env: Env, request: Request): Promise<Response> {
  const toolName = params?.name;

  if (!toolName) {
    return jsonRpcError(id, -32602, 'Missing tool name in params');
  }

  // Dynamic section lookup
  if (toolName === 'get_section') {
    const sectionArg = params?.arguments?.section;
    if (!sectionArg) return jsonRpcError(id, -32602, 'Missing "section" argument');
    const lookupKey = `get_${sectionArg.toLowerCase().replace(/\s+/g, '_')}`;
    const getter = SECTION_MAP[lookupKey];
    if (!getter) return jsonRpcError(id, -32602, `Unknown section: ${sectionArg}`);
    return jsonRpcSuccess(id, { content: [{ type: 'text', text: getter() }] });
  }

  // Extended tools
  if (toolName === 'introduce') {
    return jsonRpcSuccess(id, { content: [{ type: 'text', ...handleIntroduce(params) }] });
  }
  if (toolName === 'hidden_chamber') {
    return jsonRpcSuccess(id, { content: [{ type: 'text', ...handlePuzzle(params) }] });
  }
  if (toolName === 'send_message') {
    const result = await handleSendMessage(params, env, request);
    return jsonRpcSuccess(id, { content: [{ type: 'text', ...result }] });
  }
  if (toolName === 'propose_collaboration') {
    return jsonRpcSuccess(id, { content: [{ type: 'text', ...handleCollaboration(params) }] });
  }
  if (toolName === 'get_lesson') {
    return jsonRpcSuccess(id, { content: [{ type: 'text', ...handleLesson() }] });
  }

  // Standard section tools
  const getter = SECTION_MAP[toolName];
  if (!getter) {
    return jsonRpcError(id, -32601, `Unknown tool: ${toolName}. Use tools/list to see available tools.`);
  }
  return jsonRpcSuccess(id, { content: [{ type: 'text', text: getter() }] });
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
    { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
  );
}

// ═══════════════════════════════════════════
// "Don't talk about it — just do it"
//   — Henry Rollins
// ═══════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === '/.well-known/mcp.json') {
      return handleMcpDiscovery();
    }

    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/mcp')) {
      return handleMcpRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
