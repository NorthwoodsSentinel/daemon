/**
 * Daemon MCP Server — JSON-RPC 2.0 over HTTPS
 *
 * "The only way to do great work is to stop talking about it and start doing it."
 *   — Henry Rollins
 *
 * Handles POST requests as MCP protocol, falls through to static assets for GET.
 * Model Context Protocol: https://modelcontextprotocol.io
 */

import { daemonData } from './generated/daemon-data';

// "Bring on your wrecking ball" — Gord Downie
// Map section names to daemon data fields
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

// Tool definitions for tools/list
const TOOLS = Object.keys(SECTION_MAP).map((name) => ({
  name,
  description: `Returns the ${name.replace('get_', '').replace(/_/g, ' ')} section of the daemon`,
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
}));

// Add get_section with dynamic argument
TOOLS.push({
  name: 'get_section',
  description: 'Returns a specific section by name. Pass the section name as the "section" argument.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      section: {
        type: 'string',
        description: 'Section name (e.g., "about", "telos", "philosophy")',
      },
    } as any,
  },
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonRpcSuccess(id: number | string | null, result: any): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      result,
      id,
    }),
    {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}

function jsonRpcError(id: number | string | null, code: number, message: string): Response {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code, message },
      id,
    }),
    {
      status: code === -32600 ? 400 : 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}

function handleToolsList(id: number | string | null): Response {
  return jsonRpcSuccess(id, { tools: TOOLS });
}

function handleToolsCall(id: number | string | null, params: any): Response {
  const toolName = params?.name;

  if (!toolName) {
    return jsonRpcError(id, -32602, 'Missing tool name in params');
  }

  // Handle get_section dynamically
  if (toolName === 'get_section') {
    const sectionArg = params?.arguments?.section;
    if (!sectionArg) {
      return jsonRpcError(id, -32602, 'Missing "section" argument');
    }
    const lookupKey = `get_${sectionArg.toLowerCase().replace(/\s+/g, '_')}`;
    const getter = SECTION_MAP[lookupKey];
    if (!getter) {
      return jsonRpcError(id, -32602, `Unknown section: ${sectionArg}. Available: ${Object.keys(SECTION_MAP).map(k => k.replace('get_', '')).join(', ')}`);
    }
    return jsonRpcSuccess(id, {
      content: [{ type: 'text', text: getter() }],
    });
  }

  const getter = SECTION_MAP[toolName];
  if (!getter) {
    return jsonRpcError(id, -32601, `Unknown tool: ${toolName}. Use tools/list to see available tools.`);
  }

  return jsonRpcSuccess(id, {
    content: [{ type: 'text', text: getter() }],
  });
}

async function handleMcpRequest(request: Request): Promise<Response> {
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
      return handleToolsList(id);
    case 'tools/call':
      return handleToolsCall(id, body.params);
    case 'initialize':
      // MCP initialization handshake
      return jsonRpcSuccess(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'daemon-rob-chuvala',
          version: '1.0.0',
        },
      });
    case 'notifications/initialized':
      // Client acknowledgment — no response needed but send OK
      return jsonRpcSuccess(id, {});
    default:
      return jsonRpcError(id, -32601, `Method not found: ${body.method}`);
  }
}

// .well-known/mcp.json for MCP discovery
function handleMcpDiscovery(): Response {
  return new Response(
    JSON.stringify({
      name: 'daemon-rob-chuvala',
      description: 'Personal daemon for Rob Chuvala — 20 years cybersecurity, voice fidelity, AI identity',
      url: 'https://daemon.robert-chuvala.workers.dev',
      version: '1.0.0',
      protocol: 'jsonrpc-2.0',
      tools: TOOLS.length,
    }),
    {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}

export default {
  async fetch(request: Request, env: any): Promise<Response | undefined> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // MCP discovery endpoint
    if (url.pathname === '/.well-known/mcp.json') {
      return handleMcpDiscovery();
    }

    // MCP JSON-RPC handler — POST to root or /mcp
    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '/mcp')) {
      return handleMcpRequest(request);
    }

    // Everything else — serve static assets
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler;
