<p align="center">
  <img src="public/favicon.png" alt="Daemon" width="120">
</p>

<h1 align="center">Daemon</h1>

<p align="center">
  <strong>A personal API for human connection</strong>
</p>

<p align="center">
  <a href="https://daemon.saltedkeys.io">Live Site</a> ·
  <a href="https://github.com/danielmiessler/Daemon">Upstream</a> ·
  <a href="https://danielmiessler.com/blog/real-internet-of-things">The Real Internet of Things</a>
</p>

<p align="center">
  <img src="public/screenshot.png" alt="Daemon Dashboard" width="800">
</p>

---

## Fork Notice

This is [0xsalt](https://github.com/0xsalt)'s fork of [danielmiessler/Daemon](https://github.com/danielmiessler/Daemon).

**Branches:**
| Branch | Purpose |
|--------|---------|
| `main` | Personal deployment at [daemon.saltedkeys.io](https://daemon.saltedkeys.io) |
| `feature/*` | Changes staged for upstream PRs |

**Docs:**
- [SETUP](docs/SETUP.md) - Configure your daemon.md (XDG paths)
- [ARCHITECTURE](docs/ARCHITECTURE.md) - Build-time parser and data flow
- [FORK-SETUP](docs/FORK-SETUP.md) - Deployment checklist
- [ROADMAP](docs/ROADMAP.md) - Planned features
- [BACKLOG](docs/BACKLOG.md) - Work tracking
- [ADR](docs/adr/) - Architecture decisions

---

## The Vision: Connecting Humans, Not Just Devices

The future isn't about connecting refrigerators to the internet. It's about **connecting people to each other** through AI-powered personal assistants that know us, represent us, and handle the complexity of modern life on our behalf.

This is part of the [Human 3.0](https://danielmiessler.com/blog/human-3-creator-revolution) philosophy: technology should serve human flourishing, not replace human connection. Your daemon is your digital representative—it knows your preferences, your availability, your interests—and it can interact with other people's daemons to find common ground, schedule meetings, or discover shared interests.

Read more about this vision:
- [The Real Internet of Things](https://danielmiessler.com/blog/real-internet-of-things) - The full book on Digital Assistants and the future of human-AI interaction
- [AI's Predictable Path](https://danielmiessler.com/blog/ai-predictable-path-7-components-2024) - The 7 components that define where AI is heading
- [Personal AIs Will Mediate Everything](https://danielmiessler.com/blog/personal-ais-will-mediate-everything) - Why personal AI assistants will become our primary interface to the world

## What is a Daemon?

A daemon is a **public API that represents you**. It exposes the information you want to share with the world in a structured, queryable format that both humans and AI systems can access.

Think of it as your digital business card, but infinitely more powerful:
- **For humans**: A beautiful website showing who you are and what you're about
- **For AI systems**: An MCP (Model Context Protocol) server that can be queried programmatically
- **For connection**: A standardized way for your AI assistant to talk to someone else's AI assistant

## This is the Actual Code

This repository contains the exact code running at [daemon.danielmiessler.com](https://daemon.danielmiessler.com). It's not a demo or a template—it's the real thing. Fork it, customize it, and deploy your own daemon.

## Features

- **Static Website**: Beautiful, fast Astro-based site showcasing your daemon info
- **MCP Server**: Query your daemon programmatically via the Model Context Protocol
- **Cloudflare Pages**: Deploy globally with zero configuration
- **Forkable**: Designed to be forked and customized for your own daemon

## Quick Start

```bash
# Clone the repo
git clone https://github.com/danielmiessler/Daemon.git
cd Daemon

# Install dependencies
bun install

# Run locally
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=your-daemon-name
```

## Customization

1. **Edit your daemon info**: Update `public/daemon.md` with your own information
2. **Customize the design**: Modify the Astro components in `src/`
3. **Update branding**: Replace images in `public/` with your own
4. **Deploy**: Push to your own Cloudflare Pages project

## Architecture

> **Full documentation:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed data flow diagrams and build-time parser documentation.

### The Data File

The `public/daemon.md` file is the **source of truth** for your daemon's information. A build-time parser generates TypeScript from this file, ensuring both the dashboard and MCP server derive from the same source. It uses a simple section-based format:

```markdown
[ABOUT]
Your bio goes here...

[MISSION]
Your mission statement...

[FAVORITE_BOOKS]
- Book 1
- Book 2
```

Available sections: `ABOUT`, `CURRENT_LOCATION`, `MISSION`, `TELOS`, `FAVORITE_BOOKS`, `FAVORITE_MOVIES`, `FAVORITE_PODCASTS`, `DAILY_ROUTINE`, `PREFERENCES`, `PREDICTIONS`

### How the Live Site Works

The live site at [daemon.danielmiessler.com](https://daemon.danielmiessler.com) uses a two-component architecture:

1. **This repo** → The Astro website (what you're looking at)
2. **MCP Server** → A separate Cloudflare Worker that serves the daemon data via API

The website's dashboard fetches data from the MCP server at `mcp.daemon.danielmiessler.com`. This enables real-time API access for AI systems while the static site provides the human-readable interface.

### For Forkers: MCP Server Setup (Advanced)

If you want the full experience with a queryable MCP endpoint:

1. The MCP server is a separate Cloudflare Worker that:
   - Parses your `daemon.md` file
   - Stores the data in Cloudflare KV
   - Serves it via JSON-RPC (MCP protocol)

2. You'll need to:
   - Create a Cloudflare Worker for your MCP endpoint
   - Set up a KV namespace for data storage
   - Update the dashboard component to point to your MCP URL

3. The MCP server code and setup instructions will be documented separately.

**Note**: The static site works without the MCP component—you just won't have the live API functionality until you set up your own MCP server.

## Why Should You Have a Daemon?

1. **Own your digital identity**: Your daemon is yours, hosted where you choose
2. **Enable AI-to-AI communication**: As AI assistants become more prevalent, they'll need standardized ways to learn about people
3. **Future-proof your online presence**: Static sites with structured data are the most resilient format
4. **Join the network**: Every daemon makes the network more valuable for everyone

## The Bigger Picture

We're building toward a future where:
- Your AI assistant can find the right person to help with a problem by querying their daemon
- Scheduling a meeting means your daemon talking to their daemon
- Professional networking happens through AI matching compatible daemons
- Serendipitous human connections are facilitated by daemon-to-daemon discovery

This isn't about replacing human interaction—it's about **enabling more of it** by removing the friction and overhead that currently prevents connection.

## Tech Stack

- [Astro](https://astro.build) - Static site generation
- [Bun](https://bun.sh) - JavaScript runtime
- [Cloudflare Pages](https://pages.cloudflare.com) - Hosting and deployment
- [MCP](https://modelcontextprotocol.io) - Model Context Protocol for AI integration

## Related Projects

- [Fabric](https://github.com/danielmiessler/fabric) - AI prompts for solving everyday problems
- [Human 3.0](https://human3.danielmiessler.com) - The framework for thriving in an AI world

## License

MIT - Fork it, customize it, make it yours.

---

<p align="center">
  <em>Part of the <a href="https://danielmiessler.com/projects">Unsupervised Learning</a> project ecosystem</em>
</p>

---

## Northwoods Sentinel Labs

Part of the [Northwoods Sentinel Labs](https://northwoodssentinel.com) ecosystem — open-source tools for human-centered AI.

[Blog](https://northwoodssentinel.com) · [Substack](https://substack.com/@chewvala) · [GitHub](https://github.com/NorthwoodsSentinel)
